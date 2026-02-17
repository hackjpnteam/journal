import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'
import { DailyShare } from '@/models/DailyShare'
import { TreeWater } from '@/models/TreeWater'
import mongoose from 'mongoose'

// JST基準で今日の開始時刻を取得
function getTodayStartJST(): Date {
  const now = new Date()
  const jstOffset = 9 * 60 * 60 * 1000
  const jstNow = new Date(now.getTime() + jstOffset)
  const jstDate = new Date(jstNow.getFullYear(), jstNow.getMonth(), jstNow.getDate())
  return new Date(jstDate.getTime() - jstOffset)
}

// JST基準で今週の月曜日の開始時刻を取得
function getWeekStartJST(): Date {
  const now = new Date()
  const jstOffset = 9 * 60 * 60 * 1000
  const jstNow = new Date(now.getTime() + jstOffset)
  const day = jstNow.getDay()
  const diffToMonday = day === 0 ? 6 : day - 1
  const monday = new Date(jstNow.getFullYear(), jstNow.getMonth(), jstNow.getDate() - diffToMonday)
  return new Date(monday.getTime() - jstOffset)
}

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

    // 水やりデータを取得
    const todayStart = getTodayStartJST()
    const weekStart = getWeekStartJST()

    // 今月の水やり数（ターゲットごと）→ 成長ボーナス計算用
    const monthlyWaters = await TreeWater.aggregate([
      {
        $match: {
          targetUserId: { $in: userIds },
          createdAt: { $gte: thisMonthStart },
        },
      },
      {
        $group: {
          _id: '$targetUserId',
          count: { $sum: 1 },
        },
      },
    ])
    const monthlyWaterMap = new Map(monthlyWaters.map(w => [w._id.toString(), w.count]))

    // 今日の水やり数（ターゲットごと）
    const todayWaters = await TreeWater.aggregate([
      {
        $match: {
          targetUserId: { $in: userIds },
          createdAt: { $gte: todayStart },
        },
      },
      {
        $group: {
          _id: '$targetUserId',
          count: { $sum: 1 },
        },
      },
    ])
    const todayWaterMap = new Map(todayWaters.map(w => [w._id.toString(), w.count]))

    // 今週の水やり数（ターゲットごと）
    const weeklyWaters = await TreeWater.aggregate([
      {
        $match: {
          targetUserId: { $in: userIds },
          createdAt: { $gte: weekStart },
        },
      },
      {
        $group: {
          _id: '$targetUserId',
          count: { $sum: 1 },
        },
      },
    ])
    const weeklyWaterMap = new Map(weeklyWaters.map(w => [w._id.toString(), w.count]))

    // MVP（今週最多水やりを受けたユーザー）
    let mvpUserId: string | null = null
    let maxWeeklyWater = 0
    for (const [userId, count] of weeklyWaterMap) {
      if (count > maxWeeklyWater) {
        maxWeeklyWater = count
        mvpUserId = userId
      }
    }

    // 自分が今日水やりした相手
    const myWatersToday = await TreeWater.find({
      fromUserId: new mongoose.Types.ObjectId(session.user.id),
      createdAt: { $gte: todayStart },
    }).select('targetUserId').lean()
    const wateredByMeToday = myWatersToday.map(w => w.targetUserId.toString())

    // ユーザーごとの木の状態を計算
    const forest = users.map(user => {
      const uid = user._id.toString()
      const postCount = postCountMap.get(uid) || 0
      const baseProgress = Math.round((postCount / daysInMonth) * 100)
      // 水やりボーナス: 3回もらうごとに+5%（最大+20%）
      const monthlyWaterCount = monthlyWaterMap.get(uid) || 0
      const waterBonus = Math.min(Math.floor(monthlyWaterCount / 3) * 5, 20)
      return {
        userId: uid,
        name: user.name,
        profileImage: user.profileImage || null,
        postCount,
        progress: Math.min(baseProgress + waterBonus, 100),
        waterBonus,
        waterCount: todayWaterMap.get(uid) || 0,
        weeklyWaterCount: weeklyWaterMap.get(uid) || 0,
      }
    })

    // 進捗順でソート（高い順）
    forest.sort((a, b) => b.progress - a.progress)

    return NextResponse.json({
      forest,
      daysInMonth,
      currentDay: now.getDate(),
      mvpUserId: maxWeeklyWater > 0 ? mvpUserId : null,
      wateredByMeToday,
    })
  } catch (error) {
    console.error('Get forest error:', error)
    return NextResponse.json({ error: '取得に失敗しました' }, { status: 500 })
  }
}
