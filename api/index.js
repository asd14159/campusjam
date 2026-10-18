import express from 'express'
import { api } from '../server/api.js'

const app = express()
app.disable('x-powered-by')
app.use(api)

export default app
