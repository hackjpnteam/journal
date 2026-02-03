import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'
import { DailyShare } from '@/models/DailyShare'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    await connectDB()

    // 今月の開始日
    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()

    // アクティブなユーザーを取得（テスト/サンプルユーザーを除外）
    const users = await User.find({
      email: { $not: /sample|test|example|demo/i },
    })
      .select('_id name profileImage')
      .lean()

    // 今月の朝の投稿数をユーザーごとにカウント
    const userIds = users.map(u => u._id)
    const posts = await DailyShare.aggregate([
      {
        $match: {
          userId: { $in: userIds },
          createdAt: { $gte: thisMonthStart },
        },
      },
      {
        $group: {
          _id: '$userId',
          count: { $sum: 1 },
        },
      },
    ])

    const postCountMap = new Map(posts.map(p => [p._id.toString(), p.count]))

    // ユーザーごとの木の状態を計算
    const forest = users.map(user => {
      const postCount = postCountMap.get(user._id.toString()) || 0
      const progress = Math.round((postCount / daysInMonth) * 100)
      return {
        userId: user._id.toString(),
        name: user.name,
        profileImage: user.profileImage || null,
        postCount,
        progress: Math.min(progress, 100),
      }
    })

    // 進捗順でソート（高い順）
    forest.sort((a, b) => b.progress - a.progress)

    return NextResponse.json({
      forest,
      daysInMonth,
      currentDay: now.getDate(),
    })
  } catch (error) {
    console.error('Get forest error:', error)
    return NextResponse.json({ error: '取得に失敗しました' }, { status: 500 })
  }
}
