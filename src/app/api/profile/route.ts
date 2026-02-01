import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'

const profileSchema = z.object({
  avatar: z.string().optional(),
  name: z.string().min(1).optional(),
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
      avatar: user.avatar || '👤',
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

    const updateData: { avatar?: string; name?: string } = {}
    if (data.avatar) updateData.avatar = data.avatar
    if (data.name) updateData.name = data.name

    const user = await User.findByIdAndUpdate(
      session.user.id,
      updateData,
      { new: true }
    )

    if (!user) {
      return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 })
    }

    return NextResponse.json({
      name: user.name,
      email: user.email,
      avatar: user.avatar || '👤',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error('Update profile error:', error)
    return NextResponse.json({ error: '更新に失敗しました' }, { status: 500 })
  }
}
