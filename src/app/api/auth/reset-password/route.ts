import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'

const resetSchema = z.object({
  token: z.string().min(1, 'トークンが必要です'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(6, 'パスワードは6文字以上必要です'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { token, email, password } = resetSchema.parse(body)

    await connectDB()

    // トークンをハッシュ化してDBと照合
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    const user = await User.findOne({
      email,
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: new Date() },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'リセットリンクが無効か、有効期限が切れています。' },
        { status: 400 }
      )
    }

    // パスワードを更新
    const passwordHash = await bcrypt.hash(password, 12)

    await User.updateOne(
      { _id: user._id },
      {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      }
    )

    return NextResponse.json({
      message: 'パスワードが正常にリセットされました。新しいパスワードでログインしてください。',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'エラーが発生しました。しばらくしてからお試しください。' },
      { status: 500 }
    )
  }
}
