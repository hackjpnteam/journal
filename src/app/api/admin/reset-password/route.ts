import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'superadmin') {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    const { userId, newPassword } = await req.json()

    if (!userId || !newPassword) {
      return NextResponse.json({ error: 'ユーザーIDと新しいパスワードが必要です' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'パスワードは6文字以上にしてください' }, { status: 400 })
    }

    await connectDB()

    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 })
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12)
    await user.save()

    return NextResponse.json({ success: true, message: 'パスワードをリセットしました' })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ error: 'パスワードリセットに失敗しました' }, { status: 500 })
  }
}
