import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { DailyShare } from '@/models/DailyShare'
import { NightJournal } from '@/models/NightJournal'
import { Cheer } from '@/models/Cheer'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    await connectDB()

    const now = new Date()

    // 今週の開始日（月曜日）
    const dayOfWeek = now.getDay()
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const thisWeekStart = new Date(now)
    thisWeekStart.setDate(now.getDate() + mondayOffset)
    thisWeekStart.setHours(0, 0, 0, 0)

    // 今月の開始日
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    // 過去4週間の開始日
    const fourWeeksAgo = new Date(thisWeekStart)
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28)

    // 並列でクエリを実行
    const [
      morningPostsTotal,
      morningPostsThisWeek,
      morningPostsThisMonth,
      nightJournalsThisWeek,
      nightJournalsThisMonth,
      nightJournalsFourWeeks,
      cheersGiven,
      cheersReceived,
    ] = await Promise.all([
      // 朝の投稿数（全体）
      DailyShare.countDocuments({ userId: session.user.id }),
      // 朝の投稿数（今週）
      DailyShare.countDocuments({
        userId: session.user.id,
        createdAt: { $gte: thisWeekStart },
      }),
      // 朝の投稿数（今月）
      DailyShare.countDocuments({
        userId: session.user.id,
        createdAt: { $gte: thisMonthStart },
      }),
      // 夜の投稿（今週）
      NightJournal.find({
        userId: session.user.id,
        createdAt: { $gte: thisWeekStart },
        selfScore: { $exists: true, $ne: null },
      }).select('selfScore createdAt'),
      // 夜の投稿（今月）
      NightJournal.find({
        userId: session.user.id,
        createdAt: { $gte: thisMonthStart },
        selfScore: { $exists: true, $ne: null },
      }).select('selfScore'),
      // 夜の投稿（過去4週間）
      NightJournal.find({
        userId: session.user.id,
        createdAt: { $gte: fourWeeksAgo },
        selfScore: { $exists: true, $ne: null },
      }).select('selfScore createdAt'),
      // 応援した回数
      Cheer.countDocuments({ userId: session.user.id }),
      // 応援された回数（自分の投稿への応援）
      (async () => {
        const myMorningIds = await DailyShare.find({ userId: session.user.id }).select('_id')
        const myNightIds = await NightJournal.find({ userId: session.user.id }).select('_id')
        const allMyPostIds = [
          ...myMorningIds.map(p => p._id),
          ...myNightIds.map(p => p._id),
        ]
        return Cheer.countDocuments({ postId: { $in: allMyPostIds } })
      })(),
    ])

    // 今週の平均スコア
    const weeklyAvgScore = nightJournalsThisWeek.length > 0
      ? nightJournalsThisWeek.reduce((sum, j) => sum + (j.selfScore || 0), 0) / nightJournalsThisWeek.length
      : null

    // 今月の平均スコア
    const monthlyAvgScore = nightJournalsThisMonth.length > 0
      ? nightJournalsThisMonth.reduce((sum, j) => sum + (j.selfScore || 0), 0) / nightJournalsThisMonth.length
      : null

    // 週別のスコア推移（過去4週間）
    const weeklyScores: { week: string; avgScore: number | null; count: number }[] = []
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(thisWeekStart)
      weekStart.setDate(weekStart.getDate() - i * 7)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 7)

      const weekJournals = nightJournalsFourWeeks.filter(j => {
        const createdAt = new Date(j.createdAt)
        return createdAt >= weekStart && createdAt < weekEnd
      })

      const weekLabel = i === 0 ? '今週' : i === 1 ? '先週' : `${i}週前`
      weeklyScores.push({
        week: weekLabel,
        avgScore: weekJournals.length > 0
          ? weekJournals.reduce((sum, j) => sum + (j.selfScore || 0), 0) / weekJournals.length
          : null,
        count: weekJournals.length,
      })
    }

    // 連続投稿日数を計算（朝の投稿）
    const recentMorningPosts = await DailyShare.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .select('dateKey')
      .limit(100)

    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < 100; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(checkDate.getDate() - i)
      const dateKey = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`

      if (recentMorningPosts.some(p => p.dateKey === dateKey)) {
        streak++
      } else if (i > 0) {
        // 今日の投稿がなくても昨日以前からの連続をカウント
        break
      }
    }

    return NextResponse.json({
      morningPosts: {
        total: morningPostsTotal,
        thisWeek: morningPostsThisWeek,
        thisMonth: morningPostsThisMonth,
        streak,
      },
      nightJournals: {
        thisWeek: nightJournalsThisWeek.length,
        thisMonth: nightJournalsThisMonth.length,
      },
      scores: {
        weeklyAvg: weeklyAvgScore,
        monthlyAvg: monthlyAvgScore,
        weeklyTrend: weeklyScores,
      },
      cheers: {
        given: cheersGiven,
        received: cheersReceived,
      },
    })
  } catch (error) {
    console.error('Get stats error:', error)
    return NextResponse.json({ error: '取得に失敗しました' }, { status: 500 })
  }
}
