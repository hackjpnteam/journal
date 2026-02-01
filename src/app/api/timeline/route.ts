import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'
import { DailyShare } from '@/models/DailyShare'
import { NightJournal } from '@/models/NightJournal'
import { OKR } from '@/models/OKR'
import { Cheer } from '@/models/Cheer'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    await connectDB()

    // 実ユーザーのIDを取得（サンプル・テストユーザーを除外）
    const realUsers = await User.find({
      email: { $not: /sample|test|example|demo/i }
    }).select('_id')
    const realUserIds = realUsers.map(u => u._id)

    // 過去7日間の投稿を取得
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    // 朝の投稿を取得（実ユーザーのみ）
    const morningPosts = await DailyShare.find({
      createdAt: { $gte: sevenDaysAgo },
      userId: { $in: realUserIds }
    }).sort({ createdAt: -1 }).limit(50)

    // 夜の投稿を取得（実ユーザーのみ）
    const nightPosts = await NightJournal.find({
      createdAt: { $gte: sevenDaysAgo },
      userId: { $in: realUserIds }
    }).sort({ createdAt: -1 }).limit(50)

    // 公開OKRを取得（実ユーザーのみ）
    const sharedOKRs = await OKR.find({
      isShared: true,
      updatedAt: { $gte: sevenDaysAgo },
      userId: { $in: realUserIds }
    }).sort({ updatedAt: -1 }).limit(30)

    // ユーザー情報を取得
    const userIds = [
      ...new Set([
        ...morningPosts.map(p => p.userId.toString()),
        ...nightPosts.map(p => p.userId.toString()),
        ...sharedOKRs.map(o => o.userId.toString())
      ])
    ]
    const users = await User.find({ _id: { $in: userIds } })
    const userMap = new Map(users.map(u => [u._id.toString(), u]))

    // 全投稿IDを収集して応援データを取得
    const allPostIds = [
      ...morningPosts.map(p => p._id),
      ...nightPosts.filter(p => p.isShared).map(p => p._id),
      ...sharedOKRs.map(o => o._id),
    ]
    const allCheers = await Cheer.find({ postId: { $in: allPostIds } })

    // 投稿IDごとの応援データをマップ化
    const cheersMap = new Map<string, { id: string; userId: string; userName: string; userImage: string | null }[]>()
    allCheers.forEach(cheer => {
      const postId = cheer.postId.toString()
      if (!cheersMap.has(postId)) {
        cheersMap.set(postId, [])
      }
      cheersMap.get(postId)!.push({
        id: cheer._id.toString(),
        userId: cheer.userId.toString(),
        userName: cheer.userName,
        userImage: cheer.userImage || null,
      })
    })

    // タイムライン形式に変換
    const timeline = [
      ...morningPosts.map(post => {
        const user = userMap.get(post.userId.toString())
        const postId = post._id.toString()
        return {
          id: postId,
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
          cheers: cheersMap.get(postId) || [],
        }
      }),
      ...nightPosts.filter(post => post.isShared).map(post => {
        const user = userMap.get(post.userId.toString())
        const postId = post._id.toString()
        return {
          id: postId,
          type: 'night' as const,
          userId: post.userId.toString(),
          userName: user?.name || '不明',
          userImage: user?.profileImage || null,
          proudChoice: post.proudChoice,
          learning: post.learning,
          tomorrowMessage: post.tomorrowMessage,
          selfScore: post.selfScore,
          createdAt: post.createdAt,
          cheers: cheersMap.get(postId) || [],
        }
      }),
      ...sharedOKRs.map(okr => {
        const user = userMap.get(okr.userId.toString())
        const postId = okr._id.toString()
        return {
          id: postId,
          type: 'okr' as const,
          userId: okr.userId.toString(),
          userName: user?.name || '不明',
          userImage: user?.profileImage || null,
          okrType: okr.type,
          periodKey: okr.periodKey,
          objective: okr.objective,
          keyResults: okr.keyResults,
          focus: okr.focus,
          identityFocus: okr.identityFocus,
          createdAt: okr.updatedAt,
          cheers: cheersMap.get(postId) || [],
        }
      }),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({ timeline: timeline.slice(0, 30) })
  } catch (error) {
    console.error('Get timeline error:', error)
    return NextResponse.json({ error: '取得に失敗しました' }, { status: 500 })
  }
}
