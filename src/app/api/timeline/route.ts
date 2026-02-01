import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'
import { DailyShare } from '@/models/DailyShare'
import { NightJournal } from '@/models/NightJournal'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    await connectDB()

    // 過去7日間の投稿を取得
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    // 朝の投稿を取得
    const morningPosts = await DailyShare.find({
      createdAt: { $gte: sevenDaysAgo }
    }).sort({ createdAt: -1 }).limit(50)

    // 夜の投稿を取得
    const nightPosts = await NightJournal.find({
      createdAt: { $gte: sevenDaysAgo }
    }).sort({ createdAt: -1 }).limit(50)

    // ユーザー情報を取得
    const userIds = [
      ...new Set([
        ...morningPosts.map(p => p.userId.toString()),
        ...nightPosts.map(p => p.userId.toString())
      ])
    ]
    const users = await User.find({ _id: { $in: userIds } })
    const userMap = new Map(users.map(u => [u._id.toString(), u]))

    // タイムライン形式に変換
    const timeline = [
      ...morningPosts.map(post => {
        const user = userMap.get(post.userId.toString())
        return {
          id: post._id.toString(),
          type: 'morning' as const,
          userId: post.userId.toString(),
          userName: user?.name || '不明',
          userImage: user?.profileImage || null,
          mood: post.mood,
          declaration: post.declaration,
          value: post.value,
          action: post.action,
          letGo: post.letGo,
          createdAt: post.createdAt,
        }
      }),
      ...nightPosts.filter(post => post.isShared).map(post => {
        const user = userMap.get(post.userId.toString())
        return {
          id: post._id.toString(),
          type: 'night' as const,
          userId: post.userId.toString(),
          userName: user?.name || '不明',
          userImage: user?.profileImage || null,
          proudChoice: post.proudChoice,
          learning: post.learning,
          tomorrowMessage: post.tomorrowMessage,
          selfScore: post.selfScore,
          createdAt: post.createdAt,
        }
      }),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({ timeline: timeline.slice(0, 30) })
  } catch (error) {
    console.error('Get timeline error:', error)
    return NextResponse.json({ error: '取得に失敗しました' }, { status: 500 })
  }
}
