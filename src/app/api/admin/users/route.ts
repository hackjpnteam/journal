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

    if (session.user.role !== 'superadmin') {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    await connectDB()

    // 全ユーザーを取得（サンプル・テストユーザーを除外）
    const users = await User.find({
      email: { $not: /sample|test|example/i }
    }).sort({ createdAt: -1 })

    // 過去30日間の日付キーを生成
    const last30Days: string[] = []
    for (let i = 0; i < 30; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      last30Days.push(dateKey)
    }

    // 過去7日間の日付キー
    const last7Days = last30Days.slice(0, 7)

    // 各ユーザーの統計を取得
    const userStats = await Promise.all(
      users.map(async (user) => {
        // 総投稿数
        const totalMorning = await DailyShare.countDocuments({ userId: user._id })
        const totalNight = await NightJournal.countDocuments({ userId: user._id })

        // 過去30日の投稿数
        const morning30 = await DailyShare.countDocuments({
          userId: user._id,
          dateKey: { $in: last30Days },
        })
        const night30 = await NightJournal.countDocuments({
          userId: user._id,
          dateKey: { $in: last30Days },
        })

        // 過去7日の投稿数
        const morning7 = await DailyShare.countDocuments({
          userId: user._id,
          dateKey: { $in: last7Days },
        })
        const night7 = await NightJournal.countDocuments({
          userId: user._id,
          dateKey: { $in: last7Days },
        })

        // 最後の投稿日
        const lastMorning = await DailyShare.findOne({ userId: user._id }).sort({ createdAt: -1 })
        const lastNight = await NightJournal.findOne({ userId: user._id }).sort({ createdAt: -1 })

        const lastActivity = [lastMorning?.createdAt, lastNight?.createdAt]
          .filter(Boolean)
          .sort((a, b) => new Date(b!).getTime() - new Date(a!).getTime())[0]

        // カスタマーヘルススコア計算
        // - 過去7日の投稿頻度 (40%)
        // - 過去30日の投稿頻度 (30%)
        // - 継続性 (30%)
        const freq7Score = Math.min(((morning7 + night7) / 14) * 100, 100) * 0.4
        const freq30Score = Math.min(((morning30 + night30) / 60) * 100, 100) * 0.3

        // 最後のアクティビティからの日数
        let recencyScore = 0
        if (lastActivity) {
          const daysSinceLastActivity = Math.floor(
            (Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24)
          )
          if (daysSinceLastActivity === 0) recencyScore = 100
          else if (daysSinceLastActivity === 1) recencyScore = 90
          else if (daysSinceLastActivity <= 3) recencyScore = 70
          else if (daysSinceLastActivity <= 7) recencyScore = 50
          else if (daysSinceLastActivity <= 14) recencyScore = 30
          else recencyScore = 10
        }
        recencyScore *= 0.3

        const healthScore = Math.round(freq7Score + freq30Score + recencyScore)

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
          stats: {
            totalMorning,
            totalNight,
            morning7,
            night7,
            morning30,
            night30,
            lastActivity,
            healthScore,
          },
        }
      })
    )

    // 日別投稿数（過去7日間）
    const dailyStats = await Promise.all(
      last7Days.map(async (dateKey) => {
        const morningCount = await DailyShare.countDocuments({ dateKey })
        const nightCount = await NightJournal.countDocuments({ dateKey })
        return {
          date: dateKey,
          morning: morningCount,
          night: nightCount,
          total: morningCount + nightCount,
        }
      })
    )

    // 今日の統計
    const todayKey = last7Days[0]
    const todayMorning = await DailyShare.countDocuments({ dateKey: todayKey })
    const todayNight = await NightJournal.countDocuments({ dateKey: todayKey })

    // 総投稿数
    const totalMorningPosts = await DailyShare.countDocuments({})
    const totalNightPosts = await NightJournal.countDocuments({})

    // ヘルススコア分布
    const healthDistribution = {
      good: userStats.filter(u => u.stats.healthScore >= 70).length,
      warning: userStats.filter(u => u.stats.healthScore >= 40 && u.stats.healthScore < 70).length,
      risk: userStats.filter(u => u.stats.healthScore < 40).length,
    }

    return NextResponse.json({
      users: userStats,
      summary: {
        totalUsers: users.length,
        todayMorning,
        todayNight,
        totalMorningPosts,
        totalNightPosts,
        healthDistribution,
      },
      dailyStats: dailyStats.reverse(), // 古い順に並べる
    })
  } catch (error) {
    console.error('Get admin users error:', error)
    return NextResponse.json({ error: '取得に失敗しました' }, { status: 500 })
  }
}
