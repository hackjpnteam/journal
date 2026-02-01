import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'

const registerSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(6, 'パスワードは6文字以上必要です'),
  name: z.string().min(1, '名前を入力してください'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, name } = registerSchema.parse(body)

    await connectDB()

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: 'このメールアドレスは既に登録されています' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    // ロールを決定
    const superadminEmail = process.env.SUPERADMIN_EMAIL
    const coachEmail = process.env.COACH_EMAIL

    let role: 'member' | 'coach' | 'superadmin' = 'member'
    if (superadminEmail && email === superadminEmail) {
      role = 'superadmin'
    } else if (coachEmail && email === coachEmail) {
      role = 'coach'
    }

    const user = await User.create({
      email,
      passwordHash,
      name,
      role,
      onboardingCompleted: false,
    })

    return NextResponse.json({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error('Registration error:', error)
    return NextResponse.json({ error: '登録に失敗しました' }, { status: 500 })
  }
}
