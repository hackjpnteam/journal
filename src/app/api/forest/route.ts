import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'
import { DailyShare } from '@/models/DailyShare'
import { TreeWater } from '@/models/TreeWater'
import mongoose from 'mongoose'

function getTodayStartJST(): Date {
  const now = new Date()
  const jstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  const jstDate = new Date(jstNow.getFullYear(), jstNow.getMonth(), jstNow.getDate())
  return new Date(jstDate.getTime() - 9 * 60 * 60 * 1000)
}

function getWeekStartJST(): Date {
  const now = new Date()
  const jstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  const day = jstNow.getDay()
  const diffToMonday = day === 0 ? 6 : day - 1
  const monday = new Date(jstNow.getFullYear(), jstNow.getMonth(), jstNow.getDate() - diffToMonday)
  return new Date(monday.getTime() - 9 * 60 * 60 * 1000)
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    await connectDB()

    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const currentDay = now.getDate()
    const todayStart = getTodayStartJST()
    const weekStart = getWeekStartJST()

    const users = await User.find({
      email: { $not: /sample|test|example|demo/i },
    }).select('_id name profileImage').lean()

    const userIds = users.map(u => u._id)

    // 全クエリを並列実行
    const [
      posts,
      lastPosts,
      waterStats,
      weeklyGivers,
      myWatersToday,
    ] = await Promise.all([
      // 今月の投稿数
      DailyShare.aggregate([
        { $match: { userId: { $in: userIds }, createdAt: { $gte: thisMonthStart } } },
        { $group: { _id: '$userId', count: { $sum: 1 } } },
      ]),
      // 最終投稿日
      DailyShare.aggregate([
        { $match: { userId: { $in: userIds } } },
        { $group: { _id: '$userId', lastDate: { $max: '$createdAt' } } },
      ]),
      // 水やり統計を1クエリで（今月の全水やりレコード取得→クライアント側で集計）
      TreeWater.find({
        targetUserId: { $in: userIds },
        createdAt: { $gte: thisMonthStart },
      }).select('targetUserId fromUserId fromUserName createdAt').lean(),
      // MVP計算用（今週の水やり実行者）
      TreeWater.aggregate([
        { $match: { fromUserId: { $in: userIds }, createdAt: { $gte: weekStart } } },
        { $group: { _id: '$fromUserId', count: { $sum: 1 } } },
      ]),
      // 自分が今日水やりした相手
      TreeWater.find({
        fromUserId: new mongoose.Types.ObjectId(session.user.id),
        createdAt: { $gte: todayStart },
      }).select('targetUserId').lean(),
    ])

    const postCountMap = new Map(posts.map(p => [p._id.toString(), p.count]))
    const lastPostMap = new Map(lastPosts.map(p => [p._id.toString(), p.lastDate as Date]))

    // 水やり統計をメモリ内で集計
    const monthlyWaterMap = new Map<string, number>()
    const todayWaterMap = new Map<string, number>()
    const weeklyWaterMap = new Map<string, number>()
    const lastWaterReceivedMap = new Map<string, Date>()
    const wateredByMap = new Map<string, { userId: string; name: string }[]>()

    for (const w of waterStats) {
      const tid = w.targetUserId.toString()
      const fid = w.fromUserId.toString()
      const createdAt = new Date(w.createdAt)

      // 今月合計
      monthlyWaterMap.set(tid, (monthlyWaterMap.get(tid) || 0) + 1)

      // 今日
      if (createdAt >= todayStart) {
        todayWaterMap.set(tid, (todayWaterMap.get(tid) || 0) + 1)
      }

      // 今週
      if (createdAt >= weekStart) {
        weeklyWaterMap.set(tid, (weeklyWaterMap.get(tid) || 0) + 1)
      }

      // 最終水やり受取日
      const prev = lastWaterReceivedMap.get(tid)
      if (!prev || createdAt > prev) {
        lastWaterReceivedMap.set(tid, createdAt)
      }

      // 水やりしてくれた人（重複除去）
      if (!wateredByMap.has(tid)) wateredByMap.set(tid, [])
      const list = wateredByMap.get(tid)!
      if (!list.find(u => u.userId === fid)) {
        list.push({ userId: fid, name: w.fromUserName })
      }
    }

    // MVP
    let mvpUserId: string | null = null
    let maxGiven = 0
    for (const g of weeklyGivers) {
      if (g.count > maxGiven) {
        maxGiven = g.count
        mvpUserId = g._id.toString()
      }
    }

    const wateredByMeToday = myWatersToday.map(w => w.targetUserId.toString())

    const forest = users.map(user => {
      const uid = user._id.toString()
      const postCount = postCountMap.get(uid) || 0
      const baseProgress = Math.round((postCount / daysInMonth) * 100)
      const monthlyWaterCount = monthlyWaterMap.get(uid) || 0
      const waterBonus = Math.min(Math.floor(monthlyWaterCount / 3) * 5, 20)

      // 枯れ度
      const lastPost = lastPostMap.get(uid)
      const lastWater = lastWaterReceivedMap.get(uid)
      const lastActivity = lastPost && lastWater
        ? new Date(Math.max(lastPost.getTime(), lastWater.getTime()))
        : lastPost || lastWater || null
      const daysSinceActivity = lastActivity
        ? Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
        : currentDay

      const witherPenalty = daysSinceActivity >= 3
        ? Math.min((daysSinceActivity - 2) * 5, 30)
        : 0

      const rawProgress = baseProgress + waterBonus - witherPenalty
      const progress = Math.max(Math.min(rawProgress, 100), -30)

      return {
        userId: uid,
        name: user.name,
        profileImage: user.profileImage || null,
        postCount,
        progress,
        waterBonus,
        witherPenalty,
        daysSinceActivity,
        waterCount: todayWaterMap.get(uid) || 0,
        weeklyWaterCount: weeklyWaterMap.get(uid) || 0,
        wateredBy: wateredByMap.get(uid) || [],
      }
    })

    forest.sort((a, b) => b.progress - a.progress)

    return NextResponse.json({
      forest,
      daysInMonth,
      currentDay,
      mvpUserId: maxGiven > 0 ? mvpUserId : null,
      wateredByMeToday,
    })
  } catch (error) {
    console.error('Get forest error:', error)
    return NextResponse.json({ error: '取得に失敗しました' }, { status: 500 })
  }
}
