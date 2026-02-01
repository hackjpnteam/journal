import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'

const profileSchema = z.object({
  name: z.string().min(1).optional(),
  profileImage: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).optional(),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    await connectDB()

    const user = await User.findById(session.user.id)
    if (!user) {
      return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 })
    }

    return NextResponse.json({
      name: user.name,
      email: user.email,
      profileImage: user.profileImage || null,
    })
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json({ error: '取得に失敗しました' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const body = await req.json()
    const data = profileSchema.parse(body)

    await connectDB()

    const user = await User.findById(session.user.id)
    if (!user) {
      return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 })
    }

    // パスワード変更の処理
    if (data.newPassword) {
      if (!data.currentPassword) {
        return NextResponse.json({ error: '現在のパスワードを入力してください' }, { status: 400 })
      }

      const isValid = await bcrypt.compare(data.currentPassword, user.passwordHash)
      if (!isValid) {
        return NextResponse.json({ error: '現在のパスワードが正しくありません' }, { status: 400 })
      }

      user.passwordHash = await bcrypt.hash(data.newPassword, 10)
    }

    // 名前の更新
    if (data.name) {
      user.name = data.name
    }

    // プロフィール画像の更新
    if (data.profileImage !== undefined) {
      user.profileImage = data.profileImage || undefined
    }

    await user.save()

    return NextResponse.json({
      name: user.name,
      email: user.email,
      profileImage: user.profileImage || null,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error('Update profile error:', error)
    return NextResponse.json({ error: '更新に失敗しました' }, { status: 500 })
  }
}
