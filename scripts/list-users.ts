import mongoose from 'mongoose'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const envPath = resolve(process.cwd(), '.env.local')
const envContent = readFileSync(envPath, 'utf-8')
const envVars: Record<string, string> = {}
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) {
    envVars[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '')
  }
})

const MONGODB_URI = envVars.DATABASE_URL

async function listUsers() {
  await mongoose.connect(MONGODB_URI)
  const db = mongoose.connection.db!
  const users = await db.collection('users').find({}).toArray()
  console.log('All users:')
  users.forEach(u => console.log(`  ${u.name}: ${u.email} (${u.role})`))
  await mongoose.disconnect()
}

listUsers()
