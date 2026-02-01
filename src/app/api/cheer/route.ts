import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { isValidObjectId } from '@/lib/validation'
import { Cheer } from '@/models/Cheer'
import { User } from '@/models/User'

const cheerSchema = z.object({
  postId: z.string().min(1),
  postType: z.enum(['morning', 'night', 'okr']),
})

// 応援を追加
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const body = await req.json()
    const data = cheerSchema.parse(body)

    if (!isValidObjectId(data.postId)) {
      return NextResponse.json({ error: '無効なIDです' }, { status: 400 })
    }

    await connectDB()

    // ユーザー情報を取得
    const user = await User.findById(session.user.id)
    if (!user) {
      return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 })
    }

    // 応援を作成（何回でも可能）
    const cheer = await Cheer.create({
      postId: data.postId,
      postType: data.postType,
      userId: session.user.id,
      userName: user.name,
      userImage: user.profileImage,
    })

    return NextResponse.json({
      success: true,
      cheer: {
        id: cheer._id.toString(),
        userId: cheer.userId.toString(),
        userName: cheer.userName,
        userImage: cheer.userImage,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error('Create cheer error:', error)
    return NextResponse.json({ error: '応援に失敗しました' }, { status: 500 })
  }
}

// 投稿の応援一覧を取得
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const postId = searchParams.get('postId')

    if (!isValidObjectId(postId)) {
      return NextResponse.json({ error: '無効なIDです' }, { status: 400 })
    }

    await connectDB()

    const cheers = await Cheer.find({ postId }).sort({ createdAt: -1 })

    return NextResponse.json({
      cheers: cheers.map((cheer) => ({
        id: cheer._id.toString(),
        userId: cheer.userId.toString(),
        userName: cheer.userName,
        userImage: cheer.userImage,
      })),
    })
  } catch (error) {
    console.error('Get cheers error:', error)
    return NextResponse.json({ error: '取得に失敗しました' }, { status: 500 })
  }
}
