import { useMemo, useState } from 'react'
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
    body: '電子ジャーナルサービスのメンテナンスを実施します。',
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
    body: '学生相談室から相談会のお知らせです。',
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
    subject: '【重要・課題】第7回レポート課題提出について（締切: 11/15）',
    summary: 'レポートはkibacoでPDF提出必須。文字数は2,000字以上、サンプルコードの添付が必要です。',
    body: '学生の皆さん、前回の授業お疲れ様でした。次回講義に向けて第7回課題を課します。教科書P.142〜145の演習を進めてください。',
    date: '11/12 10:30',
    deadline: '2024-11-15',
    deadlineLabel: '11/15（金）23:59',
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
    body: '学費免除申請について、書類の再提出をお願いします。窓口受付時間をご確認のうえ対応してください。',
    date: '今日 10:15',
    deadline: '2024-11-13',
    deadlineLabel: '11/13（水）17:00',
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
    body: 'キャリア支援センターから、企業合同説明会のお知らせです。興味のある企業を見つけてください。',
    date: '昨日',
    deadline: '2024-11-20',
    deadlineLabel: '11/20（水）18:00',
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
    body: '冬期インターンシップのエントリー受付を開始しました。応募条件をご確認ください。',
    date: '11/10',
    deadline: '2024-11-20',
    deadlineLabel: '11/20（水）',
    color: 'cyan',
    icon: '</>',
    badges: ['就職', '締切: 11/20'],
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
    body: 'キャンパス施設に関するお知らせです。',
    date: '11/08',
    color: 'gray',
    icon: '♧',
    badges: [],
  },
]

const interestOptions = ['就職活動・インターン', '研究室・卒論', '留学・国際交流', 'サークル・部活', '奨学金・学費免除', 'キャンパスイベント・学園祭', '資格試験・TOEIC']
const courseOptions = ['情報システム特論', 'アルゴリズム演習', '英語プレゼンテーション']

function Header({ onSearch, onNotify }: { onSearch: () => void; onNotify: () => void }) {
  return (
    <header className="app-header">
      <div className="brand"><span className="brand-mark">▣</span><div><strong>キャンパスメール</strong><small>INBOX</small></div></div>
      <div className="header-actions"><button className="icon-button" aria-label="検索" onClick={onSearch}>⌕</button><button className="icon-button" aria-label="通知" onClick={onNotify}>♧<i /></button><span className="avatar">👩🏻</span></div>
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

function EmailCard({ email, onOpen }: { email: CampusEmail; onOpen: (email: CampusEmail) => void }) {
  return <article className="email-card" onClick={() => onOpen(email)} role="button" tabIndex={0} onKeyDown={(event) => event.key === 'Enter' && onOpen(email)}>
    <div className="email-meta"><span className="sender-icon">{email.icon}</span><div className="email-title"><strong>{email.sender}</strong><h3>{email.subject}</h3></div><time>{email.date}<b>●</b></time></div>
    <div className="card-footer"><span className="pill">{email.badges[0] || 'お知らせ'}</span>{email.badges[1] && <span className="pill peach">{email.badges[1]}</span>}<button aria-label={`${email.subject}をブックマーク`} onClick={(event) => event.stopPropagation()}>♡</button></div>
  </article>
}

function Inbox({ onOpen, searchOpen, setSearchOpen, searchQuery, setSearchQuery, savedInterests, recommendedIds }: { onOpen: (email: CampusEmail) => void; searchOpen: boolean; setSearchOpen: (value: boolean) => void; searchQuery: string; setSearchQuery: (value: string) => void; savedInterests: string[]; recommendedIds: string[] }) {
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
        {visibleEmails.map((email) => <EmailCard key={email.id} email={email} onOpen={onOpen} />)}
      </section>
    ) : mailbox === 'interest' ? (
      <section className="interest-mailbox">
        <div className="section-heading"><h2>✨ 興味メール</h2><span className="blue">{interestEmails.length}件</span></div>
        <p className="mailbox-description">マイ条件で登録した興味分野に関するメールを表示しています。</p>
        {visibleEmails.map((email) => <EmailCard key={email.id} email={email} onOpen={onOpen} />)}
      </section>
    ) : (
      <section className="all-mailbox">
        <div className="section-heading"><h2>すべてのメール</h2><span>受信順</span></div>
        {visibleEmails.map((email) => <EmailCard key={email.id} email={email} onOpen={onOpen} />)}
      </section>
    )}
  </main>
}

function Calendar({ selected, setSelected }: { selected: string; setSelected: (date: string) => void }) {
  const days = Array.from({ length: 30 }, (_, index) => index + 1)
  return <div className="calendar"><div className="calendar-title"><button>‹</button><strong>2024年 11月</strong><button>›</button></div><div className="weekdays">{['月', '火', '水', '木', '金', '土', '日'].map((day) => <span key={day}>{day}</span>)}</div><div className="days">{days.map((day) => {
    const date = `2024-11-${String(day).padStart(2, '0')}`
    const hasDeadline = ['13', '15', '20'].includes(String(day))
    return <button key={day} className={`${selected === date ? 'selected' : ''} ${hasDeadline ? 'has-deadline' : ''}`} onClick={() => setSelected(date)}>{day}{hasDeadline && <i />}</button>
  })}</div></div>
}

function Deadlines({ onOpen }: { onOpen: (email: CampusEmail) => void }) {
  const [selectedDate, setSelectedDate] = useState('2024-11-13')
  const [completed, setCompleted] = useState<string[]>([])
  const selectedEmails = emails.filter((email) => email.deadline === selectedDate)
  const upcoming = emails.filter((email) => email.deadline)
  return <main className="screen deadline-screen">
    <div className="deadline-hero"><span>● 自動抽出中・同期完了</span><h1>締切カレンダー</h1><p>選択した日の締切と、直近の重要な提出物を確認できます。</p></div>
    <Calendar selected={selectedDate} setSelected={setSelectedDate} />
    <div className="section-heading"><h2>締切 {selectedDate.slice(5).replace('-', '/')} の予定</h2><span>南大沢ポータル連携</span></div>
    <section className="deadline-list">{(selectedEmails.length ? selectedEmails : upcoming).map((email) => <article className={`deadline-card ${email.color}`} key={email.id}>
      <div><span className="pill peach">● 残り {email.id === 'tuition' ? '22時間' : email.id === 'report' ? '3日' : '8日'}</span><time>{email.deadlineLabel}</time></div><h2>{email.subject}</h2><p>▱ {email.sender}</p><div className="deadline-summary"><b>要件:</b> {email.summary}</div><div className="deadline-actions"><button onClick={() => onOpen(email)}>メールを見る</button><button className="primary" onClick={() => setCompleted([...completed, email.id])} disabled={completed.includes(email.id)}>{completed.includes(email.id) ? '✓ 提出完了' : '提出完了にする'}</button></div>
    </article>)}</section>
  </main>
}

function Preferences({ savedInterests, onSave }: { savedInterests: string[]; onSave: (interests: string[]) => void }) {
  const [interests, setInterests] = useState(savedInterests)
  const [customInterest, setCustomInterest] = useState('')
  const [savedMessage, setSavedMessage] = useState('')
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [department, setDepartment] = useState('システムデザイン学部')
  const [grade, setGrade] = useState('第3学年')
  const [draftDepartment, setDraftDepartment] = useState(department)
  const [draftGrade, setDraftGrade] = useState(grade)
  const [courses, setCourses] = useState(courseOptions)
  const [keyword, setKeyword] = useState('提出')
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
    setIsEditingProfile(false)
    setSavedMessage('基本プロフィールを保存しました。')
  }
  return <main className="screen preferences-screen">
    <div className="assistant-card"><span>✦</span><div><strong>設定アシスタント <small>STEP 1</small></strong><p>膨大な全学メールから、あなたに本当に必要な連絡だけをAIが自動抽出！</p></div></div>
    <section className="preference-card"><h2>♙ 基本プロフィール <button className="edit-profile" onClick={() => { setDraftDepartment(department); setDraftGrade(grade); setIsEditingProfile(!isEditingProfile) }}>{isEditingProfile ? 'キャンセル' : '変更する'}</button></h2>{isEditingProfile ? <div className="profile-edit-fields"><label htmlFor="department">所属学部<input id="department" value={draftDepartment} onChange={(event) => setDraftDepartment(event.target.value)} /></label><label htmlFor="grade">学年<input id="grade" value={draftGrade} onChange={(event) => setDraftGrade(event.target.value)} /></label><button className="profile-save" onClick={saveProfile} disabled={!draftDepartment.trim() || !draftGrade.trim()}>プロフィールを保存</button></div> : <div className="profile-fields"><label>所属学部<strong>{department}</strong></label><label>学年<strong>{grade}</strong></label></div>}<div className="campus-photo">▧ 南大沢キャンパス連携中</div></section>
    <section className="preference-card"><h2>♧ 興味のある分野 <small>{interests.length}つ選択中</small></h2><p>タップして優先通知したいテーマを選択してください</p><div className="tag-list">{interestOptions.map((interest) => <button key={interest} className={interests.includes(interest) ? 'chosen' : ''} onClick={() => toggleInterest(interest)}>◉ {interest}</button>)}{interests.filter((interest) => !interestOptions.includes(interest)).map((interest) => <button key={interest} className="chosen custom-tag" onClick={() => toggleInterest(interest)}>✎ {interest} ×</button>)}</div><form className="custom-interest-form" onSubmit={addCustomInterest}><input aria-label="興味のある分野を追加" value={customInterest} onChange={(event) => setCustomInterest(event.target.value)} placeholder="興味のある分野を入力..." maxLength={30} /><button type="submit" disabled={!customInterest.trim()}>＋ 追加</button></form></section>
    <section className="preference-card"><h2>▣ 最重要授業の登録 <small>{courses.length}科目登録中</small></h2><p>登録した授業の休講・教室変更・課題連絡は、受信箱の最優先に即時固定されます。</p>{courses.map((course) => <div className="course-row" key={course}><b>● {course}</b><button onClick={() => setCourses(courses.filter((item) => item !== course))}>×</button></div>)}<form className="add-course" onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const input = event.currentTarget.elements.namedItem('course') as HTMLInputElement; if (input.value.trim()) { setCourses([...courses, input.value.trim()]); input.value = '' } }}><input name="course" placeholder="授業名を入力して追加..." /><button>＋ 追加</button></form></section>
    <section className="preference-card"><h2>◇ 自動フラグキーワード <small>高精度検知中</small></h2><p>件名や本文に以下の単語が含まれると、自動で【要確認】マークが点灯します。</p><div className="keyword-row"><span>{keyword} ×</span><span>締切 ×</span><span>必修 ×</span></div><form className="add-course" onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const input = event.currentTarget.elements.namedItem('keyword') as HTMLInputElement; if (input.value.trim()) { setKeyword(input.value.trim()); input.value = '' } }}><input name="keyword" placeholder="＋ 語句を追加" /><button>追加</button></form></section>
    <button className="save-settings" onClick={() => { onSave(interests); setSavedMessage('興味のある分野を保存しました。興味メールに反映されています。') }}>✓ この設定でメールを整理する</button>
    {savedMessage && <p className="save-message" role="status">{savedMessage}</p>}
  </main>
}

function Detail({ email, onBack, onClose }: { email: CampusEmail; onBack: () => void; onClose: (email: CampusEmail, durationSeconds: number) => void }) {
  const [bookmarked, setBookmarked] = useState(false)
  return <main className="screen detail-screen"><div className="detail-top"><button onClick={() => { onClose(email, 0); onBack() }}>‹</button><strong>Email Detail</strong><button onClick={() => setBookmarked(!bookmarked)}>{bookmarked ? '★' : '♡'}</button></div><section className="detail-sender"><div className={`sender-icon ${email.color}`}>{email.icon}</div><div><h2>{email.sender}</h2><p>{email.senderMeta}・yamada-k@tmu.ac.jp</p></div></section><div className="detail-badges"><span className="pill peach">● 最優先・履修課題</span><span className="pill blue">▱ 南大沢キャンパス</span></div><section className="ai-summary"><div className="ai-title">✦ AI要約サマリー <span>要確認</span></div><div><small>提出締切 あと3日</small><strong>2024年11月15日(金) 23:59まで</strong></div><div><small>やること</small><p>第7章の演習問題（P.142〜145）を解き、解答をPDF形式で学内Portal（Kibaco）へアップロード提出。</p></div><div><small>注意点・ファイル名命名規則</small><p>提出ファイル名は「学籍番号_氏名_第7回課題.pdf」とすること。</p></div></section><section className="message"><div className="section-heading"><h2>● メッセージ本文</h2><span>LINEビュー形式</span></div><p>学生の皆さん、前回の授業お疲れ様でした。次回講義に向けて<strong>第7回課題</strong>を課します。</p><p>教科書<strong>P.142〜145</strong>の「リレーショナルデータモデル設計演習」を各自解き進めてください。</p><div className="attachment">▣ <strong>{email.attachment || '課題指示書.pdf'}</strong><small>1.2MB・PDFドキュメント</small><button>↓</button></div></section><div className="detail-footer"><button onClick={() => { onClose(email, 0); onBack() }}>✓ 締切リストに追加済み</button><button className="primary">↗ 学内Portalを開く</button></div></main>
}

export default function App() {
  const [tab, setTab] = useState<Tab>('inbox')
  const [selectedEmail, setSelectedEmail] = useState<CampusEmail | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showNotice, setShowNotice] = useState(false)
  const [savedInterests, setSavedInterests] = useState(['就職活動・インターン'])
  const [recommendedIds, setRecommendedIds] = useState<string[]>([])
  const [openedAt, setOpenedAt] = useState<number | null>(null)
  const handleOpen = (email: CampusEmail) => {
    setOpenedAt(Date.now())
    setSelectedEmail(email)
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
      ? <Inbox onOpen={handleOpen} searchOpen={searchOpen} setSearchOpen={setSearchOpen} searchQuery={searchQuery} setSearchQuery={setSearchQuery} savedInterests={savedInterests} recommendedIds={recommendedIds} />
      : tab === 'deadlines'
        ? <Deadlines onOpen={setSelectedEmail} />
        : <Preferences savedInterests={savedInterests} onSave={setSavedInterests} />, [selectedEmail, tab, searchOpen, searchQuery, savedInterests, recommendedIds])
  return <div className="app-shell"><Header onSearch={() => { setSearchOpen(true); setTab('inbox') }} onNotify={() => setShowNotice(!showNotice)} />{showNotice && <div className="notice">新しい重要メールはありません。</div>}{content}{!selectedEmail && <BottomNav tab={tab} setTab={setTab} />}</div>
}
