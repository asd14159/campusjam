import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

type Tab = 'inbox' | 'deadlines' | 'preferences'
type Category = 'urgent' | 'interest' | 'other'

type CampusEmail = {
  id: string
  category: Category
  isImportant: boolean
  interestTags: string[]
  receivedAt: number
  sender: string
  senderMeta: string
  subject: string
  summary: string
  body: string
  date: string
  deadline?: string
  deadlineLabel?: string
  color: string
  icon: string
  badges: string[]
  attachment?: string
}

const weekdayLabels = ['日', '月', '火', '水', '木', '金', '土']

function getDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function getDeadline(daysFromNow: number, hour: number, minute = 0) {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() + daysFromNow)
  return {
    date: getDateKey(date),
    label: `${date.getMonth() + 1}/${date.getDate()}（${weekdayLabels[date.getDay()]}）${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
  }
}

const reportDeadline = getDeadline(3, 23, 59)
const tuitionDeadline = getDeadline(1, 17)
const careerDeadline = getDeadline(7, 18)
const internshipDeadline = getDeadline(7, 23, 59)
const reportDateLabel = reportDeadline.date.slice(5).replace('-', '/')
const internshipDateLabel = internshipDeadline.date.slice(5).replace('-', '/')

const emails: CampusEmail[] = [
  {
    id: 'library',
    category: 'other',
    isImportant: false,
    interestTags: [],
    receivedAt: 8,
    sender: '図書館情報センター',
    senderMeta: '南大沢キャンパス',
    subject: '電子ジャーナルサービス停止のお知らせ',
    summary: 'メンテナンスに伴い、電子ジャーナルが一時利用できません。',
    body: '電子ジャーナルサービスのメンテナンスを実施します。11月18日（月）20時から22時までは、学内ネットワークからも電子ジャーナルを利用できません。必要な資料がある場合は、事前にダウンロードしてください。',
    date: '今日 11:00',
    color: 'gray',
    icon: '▤',
    badges: ['全学通知'],
  },
  {
    id: 'seminar',
    category: 'other',
    isImportant: false,
    interestTags: [],
    receivedAt: 7,
    sender: '学生相談室',
    senderMeta: '学生支援センター',
    subject: '秋の学生生活相談会のお知らせ',
    summary: '学生生活や履修について相談できる窓口を案内します。',
    body: '学生相談室では、秋の学生生活相談会を開催します。履修登録や大学生活で困っていることを、相談員に直接相談できます。予約は不要ですが、混雑時はお待ちいただく場合があります。',
    date: '昨日 16:20',
    color: 'gray',
    icon: '♡',
    badges: ['学生支援'],
  },
  {
    id: 'report',
    category: 'urgent',
    isImportant: true,
    interestTags: ['研究室・卒論'],
    receivedAt: 5,
    sender: '情報システム特論',
    senderMeta: '山田教授・講義コード: CS304（月曜2限）',
    subject: `【重要・課題】第7回レポート課題提出について（締切: ${reportDateLabel}）`,
    summary: 'レポートはkibacoでPDF提出必須。文字数は2,000字以上、サンプルコードの添付が必要です。',
    body: '学生の皆さん、前回の授業お疲れ様でした。次回講義に向けて第7回レポート課題を課します。教科書P.142〜145の「リレーショナルデータモデル設計演習」に取り組み、解答を2,000字以上のPDFにまとめてください。サンプルコードを添付し、11月15日（金）23時59分までにKibacoへ提出してください。',
    date: '11/12 10:30',
    deadline: reportDeadline.date,
    deadlineLabel: reportDeadline.label,
    color: 'green',
    icon: '▣',
    badges: ['登録講義', 'あと3日'],
    attachment: '第7回_課題指示書.pdf',
  },
  {
    id: 'tuition',
    category: 'urgent',
    isImportant: true,
    interestTags: ['奨学金・学費免除'],
    receivedAt: 6,
    sender: '学務課 学生支援係',
    senderMeta: '要対応・手続き',
    subject: '【要確認】後期学費免除申請の書類再提出のお願い',
    summary: '添付「様式A」の捺印漏れがあります。明日夕方までに1号館窓口または郵送にて再提出してください。',
    body: '後期学費免除申請を確認したところ、提出された様式Aに捺印漏れがありました。保護者欄への捺印を済ませた書類を、11月13日（水）17時までに1号館の学務課窓口へ再提出してください。窓口へ来られない場合は、期限に間に合うよう郵送してください。',
    date: '今日 10:15',
    deadline: tuitionDeadline.date,
    deadlineLabel: tuitionDeadline.label,
    color: 'red',
    icon: '▥',
    badges: ['重要確認', '締切: 明日17:00まで'],
  },
  {
    id: 'career',
    category: 'interest',
    isImportant: true,
    interestTags: ['就職活動・インターン'],
    receivedAt: 4,
    sender: 'キャリア支援センター',
    senderMeta: '都立大生限定あり',
    subject: '【都立大生限定】大手IT企業合同オンライン説明会のご案内',
    summary: 'OB・OG社員多数登壇！都立大生限定の特別選考ルートが用意されています。定員先着80名のため早めの申込を。',
    body: '11月20日（水）18時から、都立大生限定の大手IT企業合同オンライン説明会を開催します。複数の企業からOB・OG社員が登壇し、仕事内容や選考について説明します。参加を希望する方は、定員80名に達する前に申込フォームから予約してください。予約者には前日までに参加URLを送付します。',
    date: '昨日',
    deadline: careerDeadline.date,
    deadlineLabel: careerDeadline.label,
    color: 'blue',
    icon: '▦',
    badges: ['就職', 'おすすめ'],
  },
  {
    id: 'internship',
    category: 'interest',
    isImportant: false,
    interestTags: ['就職活動・インターン'],
    receivedAt: 3,
    sender: 'インターン事務局',
    senderMeta: '情報科学科向け推薦',
    subject: '冬期エンジニアインターンシップ選考エントリー受付開始',
    summary: '実務に即したクラウドアーキテクチャ設計・Webフロントエンド開発体験コースです。',
    body: '冬期エンジニアインターンシップのエントリー受付を開始しました。クラウドアーキテクチャ設計とWebフロントエンド開発を実務形式で体験できるコースです。情報科学科向けの推薦枠がありますので、応募条件と選考日程を確認のうえエントリーしてください。',
    date: '11/10',
    deadline: internshipDeadline.date,
    deadlineLabel: internshipDeadline.label,
    color: 'cyan',
    icon: '</>',
    badges: ['就職', `締切: ${internshipDateLabel}`],
  },
  {
    id: 'facility',
    category: 'other',
    isImportant: false,
    interestTags: [],
    receivedAt: 2,
    sender: '施設課・全学通知',
    senderMeta: '11/08',
    subject: 'キャンパス内駐輪場点検のお知らせ（定期点検）',
    summary: '駐輪場の定期点検を実施します。',
    body: '11月14日（木）9時から17時まで、南大沢キャンパス内の駐輪場を点検します。安全確認のため、点検中は一部の駐輪スペースを利用できません。自転車を置いている方は、前日までに別の駐輪場へ移動してください。',
    date: '11/08',
    color: 'gray',
    icon: '♧',
    badges: [],
  },
  {
    id: 'health-check',
    category: 'other',
    isImportant: false,
    interestTags: [],
    receivedAt: 1,
    sender: '保健センター',
    senderMeta: '南大沢キャンパス保健室',
    subject: '定期健康診断の予約受付について',
    summary: '後期の定期健康診断を受ける学生は、専用フォームから日時を予約してください。',
    body: '後期の定期健康診断を12月2日（月）から12月6日（金）まで実施します。受診を希望する学生は、11月25日（月）までに専用フォームから希望日時を予約してください。当日は学生証と問診票を持参し、予約時刻の10分前までに保健センターへ来室してください。',
    date: '11/07',
    color: 'gray',
    icon: '＋',
    badges: ['健康支援'],
  },
  {
    id: 'festival',
    category: 'other',
    isImportant: false,
    interestTags: [],
    receivedAt: 0,
    sender: '大学祭実行委員会',
    senderMeta: 'イベント案内',
    subject: '秋の大学祭ボランティア募集',
    summary: '大学祭当日の会場案内と受付を手伝うボランティアを募集しています。',
    body: '11月23日（土）の秋の大学祭で、会場案内と受付を手伝う学生ボランティアを募集しています。午前と午後の交代制で、担当時間以外は大学祭を自由に見学できます。参加できる方は、11月18日（月）までに応募フォームから申し込んでください。',
    date: '11/06',
    color: 'gray',
    icon: '☆',
    badges: ['大学祭'],
  },
]

const interestOptions = ['就職活動・インターン', '研究室・卒論', '留学・国際交流', 'サークル・部活', '奨学金・学費免除', 'キャンパスイベント・学園祭', '資格試験・TOEIC']
const courseOptions = ['情報システム特論', 'アルゴリズム演習', '英語プレゼンテーション']
const completedDeadlinesStorageKey = 'campus-mail-completed-deadlines'
const preferencesStorageKey = 'campus-mail-preferences'

function useCurrentTime() {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000)
    return () => window.clearInterval(timer)
  }, [])
  return now
}

function getRemainingLabel(email: CampusEmail, now: number) {
  if (!email.deadline) return ''
  const time = email.deadlineLabel?.match(/(\d{1,2}):(\d{2})/)
  const deadline = new Date(`${email.deadline}T${time ? `${time[1].padStart(2, '0')}:${time[2]}` : '23:59'}:00`).getTime()
  const remaining = deadline - now
  if (remaining <= 0) return '期限切れ'
  const hours = Math.ceil(remaining / (60 * 60 * 1000))
  return hours >= 24 ? `${Math.floor(hours / 24)}日` : `${hours}時間`
}

function Header({ onSearch, onNotify, onHome, onProfile }: { onSearch: () => void; onNotify: () => void; onHome: () => void; onProfile: () => void }) {
  return (
    <header className="app-header">
      <div className="brand"><button className="brand-mark" aria-label="ホーム" onClick={onHome}>▣</button><div><strong>Overlook</strong><small>INBOX</small></div></div>
      <div className="header-actions"><button className="icon-button" aria-label="検索" onClick={onSearch}>⌕</button><button className="icon-button" aria-label="通知" onClick={onNotify}>♧<i /></button><button className="avatar" aria-label="マイ条件" onClick={onProfile}>👩🏻</button></div>
    </header>
  )
}

function BottomNav({ tab, setTab }: { tab: Tab; setTab: (tab: Tab) => void }) {
  return <nav className="bottom-nav">
    <button className={tab === 'inbox' ? 'active' : ''} onClick={() => setTab('inbox')}><span>✉</span>受信箱</button>
    <button className={tab === 'deadlines' ? 'active' : ''} onClick={() => setTab('deadlines')}><span>◴</span>締切順</button>
    <button className={tab === 'preferences' ? 'active' : ''} onClick={() => setTab('preferences')}><span>☷</span>マイ条件</button>
  </nav>
}

function EmailCard({ email, onOpen, bookmarked, onToggleBookmark }: { email: CampusEmail; onOpen: (email: CampusEmail) => void; bookmarked: boolean; onToggleBookmark: (email: CampusEmail) => void }) {
  return <article className="email-card" onClick={() => onOpen(email)} role="button" tabIndex={0} onKeyDown={(event) => event.key === 'Enter' && onOpen(email)}>
    <div className="email-meta"><span className="sender-icon">{email.icon}</span><div className="email-title"><strong>{email.sender}</strong><h3>{email.subject}</h3></div><time>{email.date}<b>●</b></time></div>
    <div className="card-footer"><span className="pill">{email.badges[0] || 'お知らせ'}</span>{email.badges[1] && <span className="pill peach">{email.badges[1]}</span>}<button aria-label={`${email.subject}をブックマーク`} aria-pressed={bookmarked} onClick={(event) => { event.stopPropagation(); onToggleBookmark(email) }}>{bookmarked ? '♥' : '♡'}</button></div>
  </article>
}

function Inbox({ onOpen, searchOpen, setSearchOpen, searchQuery, setSearchQuery, savedInterests, recommendedIds, bookmarkedIds, onToggleBookmark }: { onOpen: (email: CampusEmail) => void; searchOpen: boolean; setSearchOpen: (value: boolean) => void; searchQuery: string; setSearchQuery: (value: string) => void; savedInterests: string[]; recommendedIds: string[]; bookmarkedIds: string[]; onToggleBookmark: (email: CampusEmail) => void }) {
  const [mailbox, setMailbox] = useState<'all' | 'important' | 'interest'>('important')
  const normalizedQuery = searchQuery.trim().toLowerCase()
  const filtered = emails.filter((email) => `${email.sender} ${email.subject} ${email.summary}`.toLowerCase().includes(normalizedQuery))
  const importantEmails = filtered.filter((email) => email.isImportant)
  const interestEmails = filtered.filter((email) => email.interestTags.some((tag) => savedInterests.includes(tag)) || recommendedIds.includes(email.id))
  const visibleEmails = mailbox === 'important'
    ? importantEmails
    : mailbox === 'interest'
      ? interestEmails
    : [...filtered].sort((first, second) => second.receivedAt - first.receivedAt)
  return <main className="screen">
    <div className="sync-row"><span>✦ AIが重要度を自動判定中</span><span className="sync">● 南大沢キャンパス同期中</span></div>
    {searchOpen && <div className="search-box"><input autoFocus value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="メールを検索" /><button aria-label="検索を閉じる" onClick={() => { setSearchQuery(''); setSearchOpen(false) }}>×</button></div>}
    <div className="filter-row">
      <button className={`filter ${mailbox === 'important' ? 'active' : ''}`} onClick={() => setMailbox('important')}>🔥 重要 <b>{importantEmails.length}</b></button>
      <button className={`filter ${mailbox === 'interest' ? 'active' : ''}`} onClick={() => setMailbox('interest')}>✨ 興味 <b>{interestEmails.length}</b></button>
      <button className={`filter ${mailbox === 'all' ? 'active' : ''}`} onClick={() => setMailbox('all')}>すべて ●</button>
    </div>
    {mailbox === 'important' ? (
      <section className="important-mailbox">
        <div className="section-heading"><h2>🔥 重要なメール</h2><span>{importantEmails.length}件</span></div>
        <p className="mailbox-description">履修中の授業、締切が近い手続き、興味を登録した就活メールをまとめています。</p>
        {visibleEmails.map((email) => <EmailCard key={email.id} email={email} onOpen={onOpen} bookmarked={bookmarkedIds.includes(email.id)} onToggleBookmark={onToggleBookmark} />)}
      </section>
    ) : mailbox === 'interest' ? (
      <section className="interest-mailbox">
        <div className="section-heading"><h2>✨ 興味メール</h2><span className="blue">{interestEmails.length}件</span></div>
        <p className="mailbox-description">マイ条件で登録した興味分野に関するメールを表示しています。</p>
        {visibleEmails.map((email) => <EmailCard key={email.id} email={email} onOpen={onOpen} bookmarked={bookmarkedIds.includes(email.id)} onToggleBookmark={onToggleBookmark} />)}
      </section>
    ) : (
      <section className="all-mailbox">
        <div className="section-heading"><h2>すべてのメール</h2><span>受信順</span></div>
        {visibleEmails.map((email) => <EmailCard key={email.id} email={email} onOpen={onOpen} bookmarked={bookmarkedIds.includes(email.id)} onToggleBookmark={onToggleBookmark} />)}
      </section>
    )}
  </main>
}

function Calendar({ selected, setSelected }: { selected: string; setSelected: (date: string) => void }) {
  const [displayMonth, setDisplayMonth] = useState(() => new Date(`${selected}T00:00:00`))
  const year = displayMonth.getFullYear()
  const month = displayMonth.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7
  const days = Array.from({ length: daysInMonth }, (_, index) => index + 1)
  const emptyDays = Array.from({ length: firstDay }, (_, index) => `empty-${index}`)
  const changeMonth = (offset: number) => setDisplayMonth(new Date(year, month + offset, 1))
  return <div className="calendar"><div className="calendar-title"><button aria-label="前の月" onClick={() => changeMonth(-1)}>‹</button><strong>{year}年 {month + 1}月</strong><button aria-label="次の月" onClick={() => changeMonth(1)}>›</button></div><div className="weekdays">{['月', '火', '水', '木', '金', '土', '日'].map((day) => <span key={day}>{day}</span>)}</div><div className="days">{emptyDays.map((day) => <span key={day} aria-hidden="true" />)}{days.map((day) => {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const hasDeadline = emails.some((email) => email.deadline === date)
    return <button key={day} className={`${selected === date ? 'selected' : ''} ${hasDeadline ? 'has-deadline' : ''}`} onClick={() => setSelected(date)}>{day}{hasDeadline && <i />}</button>
  })}</div></div>
}

function Deadlines({ onOpen }: { onOpen: (email: CampusEmail) => void }) {
  const [selectedDate, setSelectedDate] = useState(getDateKey(new Date()))
  const now = useCurrentTime()
  const [completed, setCompleted] = useState<string[]>(() => {
    const saved = localStorage.getItem(completedDeadlinesStorageKey)
    if (!saved) return []
    try {
      const parsed = JSON.parse(saved)
      return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : []
    } catch {
      return []
    }
  })
  const markCompleted = (email: CampusEmail) => {
    setCompleted((current) => {
      if (current.includes(email.id)) return current
      const next = [...current, email.id]
      localStorage.setItem(completedDeadlinesStorageKey, JSON.stringify(next))
      return next
    })
  }
  const selectedEmails = emails.filter((email) => email.deadline === selectedDate)
  const upcoming = emails.filter((email) => email.deadline)
  return <main className="screen deadline-screen">
    <div className="deadline-hero"><span>● 自動抽出中・同期完了</span><h1>締切カレンダー</h1><p>選択した日の締切と、直近の重要な提出物を確認できます。</p></div>
    <Calendar selected={selectedDate} setSelected={setSelectedDate} />
    <div className="section-heading"><h2>締切 {selectedDate.slice(5).replace('-', '/')} の予定</h2><span>南大沢ポータル連携</span></div>
    <section className="deadline-list">{(selectedEmails.length ? selectedEmails : upcoming).map((email) => <article className={`deadline-card ${email.color}`} key={email.id}>
      <div><span className="pill peach">● 残り {getRemainingLabel(email, now)}</span><time>{email.deadlineLabel}</time></div><h2>{email.subject}</h2><p>▱ {email.sender}</p><div className="deadline-summary"><b>要件:</b> {email.summary}</div><div className="deadline-actions"><button onClick={() => onOpen(email)}>メールを見る</button><button className="primary" onClick={() => markCompleted(email)} disabled={completed.includes(email.id)}>{completed.includes(email.id) ? '✓ 提出完了' : '提出完了にする'}</button></div>
    </article>)}</section>
  </main>
}

function Preferences({ savedInterests, onSave }: { savedInterests: string[]; onSave: (interests: string[]) => void }) {
  const [interests, setInterests] = useState(savedInterests)
  const [customInterest, setCustomInterest] = useState('')
  const [savedMessage, setSavedMessage] = useState('')
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [department, setDepartment] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(preferencesStorageKey) || '{}').department || 'システムデザイン学部'
    } catch {
      return 'システムデザイン学部'
    }
  })
  const [grade, setGrade] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(preferencesStorageKey) || '{}').grade || '第3学年'
    } catch {
      return '第3学年'
    }
  })
  const [draftDepartment, setDraftDepartment] = useState(department)
  const [draftGrade, setDraftGrade] = useState(grade)
  const [courses, setCourses] = useState(courseOptions)
  const [keywords, setKeywords] = useState<string[]>(() => {
    try {
      const savedKeywords = JSON.parse(localStorage.getItem(preferencesStorageKey) || '{}').keywords
      return Array.isArray(savedKeywords) && savedKeywords.every((keyword) => typeof keyword === 'string') ? savedKeywords : ['提出', '締切', '必修']
    } catch {
      return ['提出', '締切', '必修']
    }
  })
  const [keywordDraft, setKeywordDraft] = useState('')
  const toggleInterest = (interest: string) => setInterests((current) => current.includes(interest) ? current.filter((item) => item !== interest) : [...current, interest])
  const addCustomInterest = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const interest = customInterest.trim()
    if (!interest || interests.includes(interest)) return
    setInterests([...interests, interest])
    setCustomInterest('')
  }
  const saveProfile = () => {
    const nextDepartment = draftDepartment.trim()
    const nextGrade = draftGrade.trim()
    if (!nextDepartment || !nextGrade) return
    setDepartment(nextDepartment)
    setGrade(nextGrade)
    const savedPreferences = JSON.parse(localStorage.getItem(preferencesStorageKey) || '{}')
    localStorage.setItem(preferencesStorageKey, JSON.stringify({ ...savedPreferences, department: nextDepartment, grade: nextGrade }))
    setIsEditingProfile(false)
    setSavedMessage('基本プロフィールを保存しました。')
  }
  const removeKeyword = (keyword: string) => {
    setKeywords((current) => {
      const next = current.filter((item) => item !== keyword)
      const savedPreferences = JSON.parse(localStorage.getItem(preferencesStorageKey) || '{}')
      localStorage.setItem(preferencesStorageKey, JSON.stringify({ ...savedPreferences, keywords: next }))
      return next
    })
  }
  const addKeyword = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const value = keywordDraft.trim()
    if (!value || keywords.includes(value)) return
    const next = [...keywords, value]
    setKeywords(next)
    const savedPreferences = JSON.parse(localStorage.getItem(preferencesStorageKey) || '{}')
    localStorage.setItem(preferencesStorageKey, JSON.stringify({ ...savedPreferences, keywords: next }))
    setKeywordDraft('')
  }
  return <main className="screen preferences-screen">
    <div className="assistant-card"><span>✦</span><div><strong>設定アシスタント <small>STEP 1</small></strong><p>膨大な全学メールから、あなたに本当に必要な連絡だけをAIが自動抽出！</p></div></div>
    <section className="preference-card"><h2>♙ 基本プロフィール <button className="edit-profile" onClick={() => { setDraftDepartment(department); setDraftGrade(grade); setIsEditingProfile(!isEditingProfile) }}>{isEditingProfile ? 'キャンセル' : '変更する'}</button></h2>{isEditingProfile ? <div className="profile-edit-fields"><label htmlFor="department">所属学部<input id="department" value={draftDepartment} onChange={(event) => setDraftDepartment(event.target.value)} /></label><label htmlFor="grade">学年<input id="grade" value={draftGrade} onChange={(event) => setDraftGrade(event.target.value)} /></label><button className="profile-save" onClick={saveProfile} disabled={!draftDepartment.trim() || !draftGrade.trim()}>プロフィールを保存</button></div> : <div className="profile-fields"><label>所属学部<strong>{department}</strong></label><label>学年<strong>{grade}</strong></label></div>}<div className="campus-photo">▧ 南大沢キャンパス連携中</div></section>
    <section className="preference-card"><h2>♧ 興味のある分野 <small>{interests.length}つ選択中</small></h2><p>タップして優先通知したいテーマを選択してください</p><div className="tag-list">{interestOptions.map((interest) => <button key={interest} className={interests.includes(interest) ? 'chosen' : ''} onClick={() => toggleInterest(interest)}>◉ {interest}</button>)}{interests.filter((interest) => !interestOptions.includes(interest)).map((interest) => <button key={interest} className="chosen custom-tag" onClick={() => toggleInterest(interest)}>✎ {interest} ×</button>)}</div><form className="custom-interest-form" onSubmit={addCustomInterest}><input aria-label="興味のある分野を追加" value={customInterest} onChange={(event) => setCustomInterest(event.target.value)} placeholder="興味のある分野を入力..." maxLength={30} /><button type="submit" disabled={!customInterest.trim()}>＋ 追加</button></form></section>
    <section className="preference-card"><h2>▣ 最重要授業の登録 <small>{courses.length}科目登録中</small></h2><p>登録した授業の休講・教室変更・課題連絡は、受信箱の最優先に即時固定されます。</p>{courses.map((course) => <div className="course-row" key={course}><b>● {course}</b><button onClick={() => setCourses(courses.filter((item) => item !== course))}>×</button></div>)}<form className="add-course" onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const input = event.currentTarget.elements.namedItem('course') as HTMLInputElement; if (input.value.trim()) { setCourses([...courses, input.value.trim()]); input.value = '' } }}><input name="course" placeholder="授業名を入力して追加..." /><button>＋ 追加</button></form></section>
    <section className="preference-card"><h2>◇ 自動フラグキーワード <small>{keywords.length}語を登録中</small></h2><p>件名や本文に以下の単語が含まれると、自動で【要確認】マークが点灯します。</p><div className="keyword-row">{keywords.map((keyword) => <span key={keyword}>{keyword}<button type="button" aria-label={`${keyword}を削除`} onClick={() => removeKeyword(keyword)}>×</button></span>)}</div><form className="add-course" onSubmit={addKeyword}><input name="keyword" value={keywordDraft} onChange={(event) => setKeywordDraft(event.target.value)} placeholder="＋ 語句を追加" /><button type="submit" disabled={!keywordDraft.trim()}>追加</button></form></section>
    <button className="save-settings" onClick={() => { onSave(interests); setSavedMessage('興味のある分野を保存しました。興味メールに反映されています。') }}>✓ この設定でメールを整理する</button>
    {savedMessage && <p className="save-message" role="status">{savedMessage}</p>}
  </main>
}

function Detail({ email, onBack, onClose }: { email: CampusEmail; onBack: () => void; onClose: (email: CampusEmail, durationSeconds: number) => void }) {
  const [bookmarked, setBookmarked] = useState(false)
  const now = useCurrentTime()
  return <main className="screen detail-screen"><div className="detail-top"><button onClick={() => { onClose(email, 0); onBack() }}>‹</button><strong>Email Detail</strong><button onClick={() => setBookmarked(!bookmarked)}>{bookmarked ? '★' : '♡'}</button></div><section className="detail-sender"><div className={`sender-icon ${email.color}`}>{email.icon}</div><div><h2>{email.sender}</h2><p>{email.senderMeta}・yamada-k@tmu.ac.jp</p></div></section><div className="detail-badges"><span className="pill peach">● 最優先・履修課題</span><span className="pill blue">▱ 南大沢キャンパス</span></div><section className="ai-summary"><div className="ai-title">✦ AI要約サマリー <span>要確認</span></div><div><small>提出締切 {getRemainingLabel(email, now)}</small><strong>{email.deadlineLabel || '締切なし'}</strong></div><div><small>要点</small><p>{email.summary}</p></div></section><section className="message"><div className="section-heading"><h2>● メッセージ本文</h2><span>LINEビュー形式</span></div><p>{email.body}</p>{email.attachment && <div className="attachment">▣ <strong>{email.attachment}</strong><small>1.2MB・PDFドキュメント</small><button>↓</button></div>}</section><div className="detail-footer"><button onClick={() => { onClose(email, 0); onBack() }}>✓ 締切リストに追加済み</button><button className="primary">↗ 学内Portalを開く</button></div></main>
}

export default function App() {
  const [tab, setTab] = useState<Tab>('inbox')
  const [selectedEmail, setSelectedEmail] = useState<CampusEmail | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showNotice, setShowNotice] = useState(false)
  const [savedInterests, setSavedInterests] = useState(['就職活動・インターン'])
  const [recommendedIds, setRecommendedIds] = useState<string[]>([])
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([])
  const [openedAt, setOpenedAt] = useState<number | null>(null)
  const handleOpen = (email: CampusEmail) => {
    setOpenedAt(Date.now())
    setSelectedEmail(email)
  }
  const handleToggleBookmark = (email: CampusEmail) => {
    setBookmarkedIds((current) => current.includes(email.id) ? current.filter((id) => id !== email.id) : [...current, email.id])
  }
  const handleClose = async (email: CampusEmail, fallbackDuration: number) => {
    const durationSeconds = openedAt ? (Date.now() - openedAt) / 1000 : fallbackDuration
    if (email.category !== 'interest') return
    const candidates = emails.map(({ id, sender, subject, summary, category }) => ({ id, sender, subject, summary, category }))
    try {
      const result = await fetch('/api/mail-learning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ focusEmail: { id: email.id, sender: email.sender, subject: email.subject, summary: email.summary }, durationSeconds, candidates }),
      })
      if (!result.ok) throw new Error(`AI learning failed with status ${result.status}`)
      const data = await result.json()
      setRecommendedIds(data.recommendedIds)
    } catch (error) {
      console.error(error)
      setShowNotice(true)
    }
    setOpenedAt(null)
  }
  const content = useMemo(() => selectedEmail
    ? <Detail email={selectedEmail} onBack={() => setSelectedEmail(null)} onClose={handleClose} />
    : tab === 'inbox'
      ? <Inbox onOpen={handleOpen} searchOpen={searchOpen} setSearchOpen={setSearchOpen} searchQuery={searchQuery} setSearchQuery={setSearchQuery} savedInterests={savedInterests} recommendedIds={recommendedIds} bookmarkedIds={bookmarkedIds} onToggleBookmark={handleToggleBookmark} />
      : tab === 'deadlines'
        ? <Deadlines onOpen={setSelectedEmail} />
        : <Preferences savedInterests={savedInterests} onSave={setSavedInterests} />, [selectedEmail, tab, searchOpen, searchQuery, savedInterests, recommendedIds, bookmarkedIds])
  return <div className="app-shell"><Header onSearch={() => { setSearchOpen(true); setTab('inbox') }} onNotify={() => setShowNotice(!showNotice)} onHome={() => { setSelectedEmail(null); setTab('preferences') }} onProfile={() => { setSelectedEmail(null); setTab('preferences') }} />{showNotice && <div className="notice">新しい重要メールはありません。</div>}{content}{!selectedEmail && <BottomNav tab={tab} setTab={setTab} />}</div>
}
