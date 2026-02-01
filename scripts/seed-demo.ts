import mongoose from 'mongoose'

const MONGODB_URI = process.env.DATABASE_URL || 'mongodb+srv://hack:hack1204@cluster0.xqrlw7o.mongodb.net/community?retryWrites=true&w=majority'

const UserSchema = new mongoose.Schema({
  email: String,
  passwordHash: String,
  name: String,
  role: { type: String, default: 'member' },
  onboardingCompleted: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
})

const DailyShareSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  dateKey: String,
  mood: String,
  value: String,
  action: String,
  letGo: String,
  declaration: String,
}, { timestamps: true })

const NightJournalSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  dateKey: String,
  proudChoice: String,
  offChoice: String,
  moodReflection: String,
  learning: String,
  tomorrowMessage: String,
  isShared: { type: Boolean, default: false },
}, { timestamps: true })

const CoachingNoteSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  dateKey: String,
  redline: String,
  question: String,
}, { timestamps: true })

const User = mongoose.models.User || mongoose.model('User', UserSchema)
const DailyShare = mongoose.models.DailyShare || mongoose.model('DailyShare', DailyShareSchema)
const NightJournal = mongoose.models.NightJournal || mongoose.model('NightJournal', NightJournalSchema)
const CoachingNote = mongoose.models.CoachingNote || mongoose.model('CoachingNote', CoachingNoteSchema)

async function seed() {
  await mongoose.connect(MONGODB_URI)
  console.log('Connected to MongoDB')

  const today = new Date()
  const dateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  // 既存データを削除
  await DailyShare.deleteMany({})
  await NightJournal.deleteMany({})
  await CoachingNote.deleteMany({})
  console.log('Cleared existing data')

  // デモユーザー
  const demoUsers = [
    { name: '田中 健太', email: 'tanaka@demo.com' },
    { name: '佐藤 美咲', email: 'sato@demo.com' },
    { name: '鈴木 大輔', email: 'suzuki@demo.com' },
    { name: '山本 あかり', email: 'yamamoto@demo.com' },
  ]

  // Morning Journal データ
  const morningData = [
    {
      mood: 'fire',
      value: '挑戦',
      action: '新規プロジェクトの企画書を完成させる',
      letGo: '失敗への恐れ',
      declaration: '今日の自分は、全力で挑戦する。',
    },
    {
      mood: 'stable',
      value: '丁寧さ',
      action: 'チームメンバーとの1on1を3件終わらせる',
      letGo: '焦り',
      declaration: '今日の自分は、一つ一つ丁寧に向き合う。',
    },
    {
      mood: 'recover',
      value: '自分への優しさ',
      action: '午前中のタスクを2つだけ終わらせる',
      letGo: '完璧主義',
      declaration: '今日の自分は、無理せず回復に集中する。',
    },
    {
      mood: 'chaotic',
      value: '整理',
      action: 'タスクリストを整理して優先順位をつける',
      letGo: 'すべてを一度にやろうとする気持ち',
      declaration: '今日の自分は、一歩ずつ前に進む。',
    },
  ]

  // Night Journal データ
  const nightData = [
    {
      proudChoice: '難しい会話を避けずに向き合えた',
      offChoice: '昼休みにSNSを見すぎた。疲れて逃げたかった',
      moodReflection: '朝は燃えてると思ったけど、午後は少し疲れが出た',
      learning: '休憩を取ることも仕事のうち',
      tomorrowMessage: '明日も自分らしく。焦らなくていい。',
      isShared: true,
    },
    {
      proudChoice: '後輩の相談に時間をかけて聞けた',
      offChoice: '夕方、集中力が切れて雑になった',
      moodReflection: '安定していると思ったが、予想通りだった',
      learning: '人の話を聞くことで自分も学べる',
      tomorrowMessage: '今日と同じペースでいこう。',
      isShared: true,
    },
    {
      proudChoice: '体調が悪い中でも最低限のことはできた',
      offChoice: '無理して会議に出てしまった',
      moodReflection: '回復中という判断は正しかった',
      learning: '自分の状態を正直に伝えることも大事',
      tomorrowMessage: 'ゆっくり休んで、明日に備えよう。',
      isShared: false,
    },
    {
      proudChoice: 'カオスな中でもタスクを3つ終わらせた',
      offChoice: 'イライラして同僚に強く言ってしまった',
      moodReflection: 'カオスは正しかった。でも乗り越えられた',
      learning: '感情的になりそうな時は一度離れる',
      tomorrowMessage: '今日より少し余裕を持てるはず。',
      isShared: true,
    },
  ]

  for (let i = 0; i < demoUsers.length; i++) {
    const userData = demoUsers[i]

    // ユーザーを取得または作成
    let user = await User.findOne({ email: userData.email })

    if (!user) {
      user = await User.create({
        ...userData,
        passwordHash: '$2a$12$dummy.hash.for.demo.users',
        onboardingCompleted: true,
      })
      console.log(`Created user: ${userData.name}`)
    }

    // Morning Journal
    await DailyShare.create({
      userId: user._id,
      dateKey,
      ...morningData[i],
    })
    console.log(`Created morning journal for: ${userData.name}`)

    // Night Journal
    await NightJournal.create({
      userId: user._id,
      dateKey,
      ...nightData[i],
    })
    console.log(`Created night journal for: ${userData.name}`)
  }

  console.log('Demo data seeded successfully!')
  await mongoose.disconnect()
}

seed().catch(console.error)
