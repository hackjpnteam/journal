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

    // 過去7日間の投稿を取得
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    // 並列でクエリ実行 + .lean() で高速化
    const [morningPosts, nightPosts, sharedOKRs] = await Promise.all([
      // 朝の投稿
      DailyShare.find({ createdAt: { $gte: sevenDaysAgo } })
        .select('userId mood declaration value action letGo createdAt')
        .sort({ createdAt: -1 })
        .limit(30)
        .lean(),
      // 夜の投稿（公開のみ）
      NightJournal.find({ createdAt: { $gte: sevenDaysAgo }, isShared: true })
        .select('userId proudChoice learning tomorrowMessage selfScore createdAt')
        .sort({ createdAt: -1 })
        .limit(30)
        .lean(),
      // 公開OKR
      OKR.find({ isShared: true, updatedAt: { $gte: sevenDaysAgo } })
        .select('userId type periodKey objective keyResults keyResultsProgress focus identityFocus updatedAt')
        .sort({ updatedAt: -1 })
        .limit(20)
        .lean(),
    ])

    // ユーザー情報を取得
    const userIds = [
      ...new Set([
        ...morningPosts.map(p => p.userId.toString()),
        ...nightPosts.map(p => p.userId.toString()),
        ...sharedOKRs.map(o => o.userId.toString())
      ])
    ]
    const users = await User.find({ _id: { $in: userIds } })
      .select('name profileImage email')
      .lean()

    // テスト/サンプルユーザーを除外
    const realUserMap = new Map(
      users
        .filter(u => !/sample|test|example|demo/i.test(u.email || ''))
        .map(u => [u._id.toString(), u])
    )

    // 実ユーザーの投稿のみフィルタリング
    const filteredMorning = morningPosts.filter(p => realUserMap.has(p.userId.toString()))
    const filteredNight = nightPosts.filter(p => realUserMap.has(p.userId.toString()))
    const filteredOKRs = sharedOKRs.filter(o => realUserMap.has(o.userId.toString()))

    // 全投稿IDを収集して応援データを取得
    const allPostIds = [
      ...filteredMorning.map(p => p._id),
      ...filteredNight.map(p => p._id),
      ...filteredOKRs.map(o => o._id),
    ]
    const allCheers = await Cheer.find({ postId: { $in: allPostIds } })
      .select('postId userId userName')
      .lean()

    // 応援したユーザーの最新情報を取得
    const cheerUserIds = [...new Set(allCheers.map(c => c.userId.toString()))]
    const cheerUsers = await User.find({ _id: { $in: cheerUserIds } })
      .select('name profileImage')
      .lean()
    const cheerUserMap = new Map(cheerUsers.map(u => [u._id.toString(), u]))

    // 投稿IDごとの応援データをマップ化（最新のユーザー情報を使用）
    const cheersMap = new Map<string, { id: string; userId: string; userName: string; userImage: string | null }[]>()
    allCheers.forEach(cheer => {
      const postId = cheer.postId.toString()
      const cheerUser = cheerUserMap.get(cheer.userId.toString())
      if (!cheersMap.has(postId)) {
        cheersMap.set(postId, [])
      }
      cheersMap.get(postId)!.push({
        id: cheer._id.toString(),
        userId: cheer.userId.toString(),
        userName: cheerUser?.name || cheer.userName,
        userImage: cheerUser?.profileImage || null,
      })
    })

    // タイムライン形式に変換
    const timeline = [
      ...filteredMorning.map(post => {
        const user = realUserMap.get(post.userId.toString())
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
      ...filteredNight.map(post => {
        const user = realUserMap.get(post.userId.toString())
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
      ...filteredOKRs.map(okr => {
        const user = realUserMap.get(okr.userId.toString())
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
          keyResultsProgress: okr.keyResultsProgress,
          focus: okr.focus,
          identityFocus: okr.identityFocus,
          createdAt: okr.updatedAt,
          cheers: cheersMap.get(postId) || [],
        }
      }),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // キャッシュヘッダー付きで返却（10秒キャッシュ）
    return NextResponse.json(
      { timeline: timeline.slice(0, 30) },
      { headers: { 'Cache-Control': 'private, max-age=10, stale-while-revalidate=30' } }
    )
  } catch (error) {
    console.error('Get timeline error:', error)
    return NextResponse.json({ error: '取得に失敗しました' }, { status: 500 })
  }
}
