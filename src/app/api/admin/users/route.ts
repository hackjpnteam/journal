import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'
import { DailyShare } from '@/models/DailyShare'
import { NightJournal } from '@/models/NightJournal'

// サービス開始日
const SERVICE_START_DATE = new Date('2026-02-02')

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

    // サービス開始からの日数を計算
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const daysSinceLaunch = Math.max(1, Math.floor((today.getTime() - SERVICE_START_DATE.getTime()) / (1000 * 60 * 60 * 24)) + 1)

    // 全ユーザーを取得（サンプル・テストユーザーを除外）
    const users = await User.find({
      email: { $not: /sample|test|example/i }
    }).sort({ createdAt: -1 })

    // サービス開始日以降の日付キーを生成（最大30日）
    const effectiveDays = Math.min(daysSinceLaunch, 30)
    const last30Days: string[] = []
    for (let i = 0; i < effectiveDays; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      // サービス開始日より前の日付はスキップ
      if (date >= SERVICE_START_DATE) {
        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
        last30Days.push(dateKey)
      }
    }

    // 過去7日間またはサービス開始からの日数（どちらか短い方）
    const effective7Days = Math.min(daysSinceLaunch, 7)
    const last7Days = last30Days.slice(0, effective7Days)

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

        // カスタマーヘルススコア計算（サービス開始日を考慮）
        // - 投稿頻度スコア (50%): サービス開始からの日数に対する投稿率
        // - 継続性スコア (50%): 最後のアクティビティからの日数

        // ユーザー登録日とサービス開始日のどちらか遅い方からの日数
        const userStartDate = new Date(user.createdAt) > SERVICE_START_DATE
          ? new Date(user.createdAt)
          : SERVICE_START_DATE
        userStartDate.setHours(0, 0, 0, 0)
        const userDays = Math.max(1, Math.floor((today.getTime() - userStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1)

        // 投稿頻度スコア: ユーザーの有効日数に対する投稿率
        // 1日2回（朝・夜）が満点
        const maxPossiblePosts = userDays * 2
        const actualPosts = totalMorning + totalNight
        const frequencyScore = Math.min((actualPosts / maxPossiblePosts) * 100, 100) * 0.5

        // 継続性スコア: 最後のアクティビティからの日数
        let recencyScore = 0
        if (lastActivity) {
          const daysSinceLastActivity = Math.floor(
            (Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24)
          )
          // サービス開始から日が浅い場合は寛容に
          if (daysSinceLaunch <= 3) {
            // 開始3日以内: アクティビティがあれば高スコア
            if (daysSinceLastActivity === 0) recencyScore = 100
            else if (daysSinceLastActivity === 1) recencyScore = 80
            else recencyScore = 50
          } else {
            // 通常時
            if (daysSinceLastActivity === 0) recencyScore = 100
            else if (daysSinceLastActivity === 1) recencyScore = 90
            else if (daysSinceLastActivity <= 3) recencyScore = 70
            else if (daysSinceLastActivity <= 7) recencyScore = 50
            else if (daysSinceLastActivity <= 14) recencyScore = 30
            else recencyScore = 10
          }
        } else {
          // 一度も投稿がない場合でも、登録直後なら猶予を与える
          if (userDays <= 1) recencyScore = 50
          else if (userDays <= 3) recencyScore = 30
          else recencyScore = 0
        }
        recencyScore *= 0.5

        const healthScore = Math.round(frequencyScore + recencyScore)

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

    // 実ユーザーのIDリストを取得（サンプル・テストユーザーを除外）
    const realUserIds = users.map(u => u._id)

    // 日別投稿数（過去7日間）- 実ユーザーのみ
    const dailyStats = await Promise.all(
      last7Days.map(async (dateKey) => {
        const morningCount = await DailyShare.countDocuments({
          dateKey,
          userId: { $in: realUserIds }
        })
        const nightCount = await NightJournal.countDocuments({
          dateKey,
          userId: { $in: realUserIds }
        })
        return {
          date: dateKey,
          morning: morningCount,
          night: nightCount,
          total: morningCount + nightCount,
        }
      })
    )

    // 今日の統計 - 実ユーザーのみ
    const todayKey = last7Days[0]
    const todayMorning = await DailyShare.countDocuments({
      dateKey: todayKey,
      userId: { $in: realUserIds }
    })
    const todayNight = await NightJournal.countDocuments({
      dateKey: todayKey,
      userId: { $in: realUserIds }
    })

    // 総投稿数 - 実ユーザーのみ
    const totalMorningPosts = await DailyShare.countDocuments({ userId: { $in: realUserIds } })
    const totalNightPosts = await NightJournal.countDocuments({ userId: { $in: realUserIds } })

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
