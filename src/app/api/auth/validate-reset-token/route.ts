import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')
    const email = searchParams.get('email')

    if (!token || !email) {
      return NextResponse.json(
        { valid: false, error: 'トークンとメールアドレスが必要です' },
        { status: 400 }
      )
    }

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
        { valid: false, error: 'リセットリンクが無効か、有効期限が切れています。' },
        { status: 400 }
      )
    }

    return NextResponse.json({ valid: true })
  } catch (error) {
    console.error('Validate reset token error:', error)
    return NextResponse.json(
      { valid: false, error: 'エラーが発生しました' },
      { status: 500 }
    )
  }
}
