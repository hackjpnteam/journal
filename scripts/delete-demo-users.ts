import mongoose from 'mongoose'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// .env.local を手動で読み込む
const envPath = resolve(process.cwd(), '.env.local')
const envContent = readFileSync(envPath, 'utf-8')
const envVars: Record<string, string> = {}
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) {
    envVars[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '')
  }
})

const MONGODB_URI = envVars.DATABASE_URL || envVars.MONGODB_URI

if (!MONGODB_URI) {
  console.error('DATABASE_URL is not defined')
  process.exit(1)
}

async function deleteDemoUsers() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    const db = mongoose.connection.db
    if (!db) {
      throw new Error('Database connection not established')
    }

    // デモユーザーを検索
    const usersCollection = db.collection('users')
    const demoUsers = await usersCollection.find({
      email: { $regex: /demo/i }
    }).toArray()

    console.log(`Found ${demoUsers.length} demo users:`)
    demoUsers.forEach(u => console.log(`  - ${u.email} (${u.name})`))

    if (demoUsers.length === 0) {
      console.log('No demo users to delete')
      await mongoose.disconnect()
      return
    }

    const demoUserIds = demoUsers.map(u => u._id)

    // 関連データを削除
    const dailySharesResult = await db.collection('dailyshares').deleteMany({
      userId: { $in: demoUserIds }
    })
    console.log(`Deleted ${dailySharesResult.deletedCount} morning posts`)

    const nightJournalsResult = await db.collection('nightjournals').deleteMany({
      userId: { $in: demoUserIds }
    })
    console.log(`Deleted ${nightJournalsResult.deletedCount} night posts`)

    const okrsResult = await db.collection('okrs').deleteMany({
      userId: { $in: demoUserIds }
    })
    console.log(`Deleted ${okrsResult.deletedCount} OKRs`)

    const cheersResult = await db.collection('cheers').deleteMany({
      userId: { $in: demoUserIds }
    })
    console.log(`Deleted ${cheersResult.deletedCount} cheers`)

    const coachingNotesResult = await db.collection('coachingnotes').deleteMany({
      recipientId: { $in: demoUserIds }
    })
    console.log(`Deleted ${coachingNotesResult.deletedCount} coaching notes`)

    // デモユーザーを削除
    const usersResult = await usersCollection.deleteMany({
      _id: { $in: demoUserIds }
    })
    console.log(`Deleted ${usersResult.deletedCount} demo users`)

    console.log('\nDemo data cleanup completed!')

    await mongoose.disconnect()
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

deleteDemoUsers()
