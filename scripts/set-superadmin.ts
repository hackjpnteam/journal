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
const email = process.argv[2]

if (!email) {
  console.error('Usage: npx tsx scripts/set-superadmin.ts <email>')
  process.exit(1)
}

async function setSuperadmin() {
  await mongoose.connect(MONGODB_URI)
  const db = mongoose.connection.db!

  const result = await db.collection('users').updateOne(
    { email },
    { $set: { role: 'superadmin' } }
  )

  if (result.matchedCount === 0) {
    console.log(`User with email ${email} not found`)
  } else {
    console.log(`Updated ${email} to superadmin`)
  }

  await mongoose.disconnect()
}

setSuperadmin()
