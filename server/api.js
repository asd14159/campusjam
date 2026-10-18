import { Router, json } from 'express'

export const api = Router()
api.use(json({ limit: '100kb' }))

const learningState = {
  interactions: new Map(),
  recommendations: new Set(),
}
const learningThresholds = {
  minimumInteractions: 1,
  minimumSeconds: 2,
}

function getAzureConfig() {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT?.replace(/\/$/, '')
  const apiKey = process.env.AZURE_OPENAI_API_KEY
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT
  if (!endpoint || !apiKey || !deployment) {
    throw new Error('AI learning is not configured')
  }
  return { endpoint, apiKey, deployment }
}

async function analyzeSimilarEmails(focusEmail, candidates, interaction) {
  const { endpoint, apiKey, deployment } = getAzureConfig()
  const response = await fetch(`${endpoint}/responses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
      model: deployment,
      input: [
        'Find emails similar in topic and purpose to the focus email.',
        'Return only JSON in the form {"emailIds":["id1","id2"]}.',
        'Do not include the focus email itself.',
        `Interaction evidence: viewed ${interaction.count} time(s) for ${interaction.seconds} second(s). Treat this as an early interest signal when ranking related emails.`,
        `Focus email: ${JSON.stringify(focusEmail)}`,
        `Candidate emails: ${JSON.stringify(candidates)}`,
      ].join('\n'),
    }),
  })
  if (!response.ok) {
    throw new Error(`AI learning request failed with status ${response.status}`)
  }
  const result = await response.json()
  const text = result.output_text
  if (typeof text !== 'string') {
    throw new Error('AI learning response did not contain output text')
  }
  const parsed = JSON.parse(text)
  if (!Array.isArray(parsed.emailIds) || parsed.emailIds.some((id) => typeof id !== 'string')) {
    throw new Error('AI learning response had an invalid emailIds list')
  }
  return parsed.emailIds
}

// 企画に必要なAPIをここへ追加します。秘密のキーはprocess.envから読み込みます。
api.get('/health', (_request, response) => {
  response.json({ status: 'ok' })
})

api.post('/mail-learning', async (request, response) => {
  const { focusEmail, durationSeconds, candidates } = request.body
  if (!focusEmail?.id || typeof durationSeconds !== 'number' || durationSeconds < 0 || !Array.isArray(candidates)) {
    return response.status(400).json({ error: 'Invalid mail learning payload' })
  }

  const previous = learningState.interactions.get(focusEmail.id) ?? { count: 0, seconds: 0 }
  const interaction = {
    count: previous.count + 1,
    seconds: previous.seconds + Math.round(durationSeconds),
  }
  learningState.interactions.set(focusEmail.id, interaction)
  const learningReady = interaction.count >= learningThresholds.minimumInteractions || interaction.seconds >= learningThresholds.minimumSeconds

  if (!learningReady) {
    return response.json({ interaction, learningReady: false, recommendedIds: [...learningState.recommendations] })
  }

  try {
    const recommendedIds = await analyzeSimilarEmails(focusEmail, candidates, interaction)
    recommendedIds.forEach((id) => learningState.recommendations.add(id))
    return response.json({ interaction, learningReady: true, recommendedIds: [...learningState.recommendations] })
  } catch (error) {
    console.error(error)
    return response.status(502).json({ error: 'AI learning failed' })
  }
})

// 存在しないAPIをフロントエンドのHTMLとして返さないようにします。
api.use((_request, response) => {
  response.status(404).json({ error: 'API not found' })
})
