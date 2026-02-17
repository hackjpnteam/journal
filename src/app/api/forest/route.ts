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

    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const currentDay = now.getDate()

    const users = await User.find({
      email: { $not: /sample|test|example|demo/i },
    })
      .select('_id name profileImage')
      .lean()

    const userIds = users.map(u => u._id)
    const userNameMap = new Map(users.map(u => [u._id.toString(), u.name]))

    // 今月の投稿数
    const posts = await DailyShare.aggregate([
      { $match: { userId: { $in: userIds }, createdAt: { $gte: thisMonthStart } } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
    ])
    const postCountMap = new Map(posts.map(p => [p._id.toString(), p.count]))

    // 最終投稿日（枯れ判定用）
    const lastPosts = await DailyShare.aggregate([
      { $match: { userId: { $in: userIds } } },
      { $group: { _id: '$userId', lastDate: { $max: '$createdAt' } } },
    ])
    const lastPostMap = new Map(lastPosts.map(p => [p._id.toString(), p.lastDate as Date]))

    const todayStart = getTodayStartJST()
    const weekStart = getWeekStartJST()

    // 今月の水やり数（ターゲットごと）
    const monthlyWaters = await TreeWater.aggregate([
      { $match: { targetUserId: { $in: userIds }, createdAt: { $gte: thisMonthStart } } },
      { $group: { _id: '$targetUserId', count: { $sum: 1 } } },
    ])
    const monthlyWaterMap = new Map(monthlyWaters.map(w => [w._id.toString(), w.count]))

    // 今日の水やり数
    const todayWaters = await TreeWater.aggregate([
      { $match: { targetUserId: { $in: userIds }, createdAt: { $gte: todayStart } } },
      { $group: { _id: '$targetUserId', count: { $sum: 1 } } },
    ])
    const todayWaterMap = new Map(todayWaters.map(w => [w._id.toString(), w.count]))

    // 今週の水やり数
    const weeklyWaters = await TreeWater.aggregate([
      { $match: { targetUserId: { $in: userIds }, createdAt: { $gte: weekStart } } },
      { $group: { _id: '$targetUserId', count: { $sum: 1 } } },
    ])
    const weeklyWaterMap = new Map(weeklyWaters.map(w => [w._id.toString(), w.count]))

    // 最終水やり受け取り日（枯れ判定用）
    const lastWatersReceived = await TreeWater.aggregate([
      { $match: { targetUserId: { $in: userIds } } },
      { $group: { _id: '$targetUserId', lastDate: { $max: '$createdAt' } } },
    ])
    const lastWaterReceivedMap = new Map(lastWatersReceived.map(w => [w._id.toString(), w.lastDate as Date]))

    // 水やりしてくれた人（今月、ターゲットごと）
    const waterers = await TreeWater.find({
      targetUserId: { $in: userIds },
      createdAt: { $gte: thisMonthStart },
    }).select('targetUserId fromUserId fromUserName').lean()

    const wateredByMap = new Map<string, { userId: string; name: string }[]>()
    for (const w of waterers) {
      const targetId = w.targetUserId.toString()
      if (!wateredByMap.has(targetId)) wateredByMap.set(targetId, [])
      const list = wateredByMap.get(targetId)!
      // 重複除去
      if (!list.find(u => u.userId === w.fromUserId.toString())) {
        list.push({ userId: w.fromUserId.toString(), name: w.fromUserName })
      }
    }

    // MVP（今週一番多く他人に水やりした人）
    const weeklyGivers = await TreeWater.aggregate([
      { $match: { fromUserId: { $in: userIds }, createdAt: { $gte: weekStart } } },
      { $group: { _id: '$fromUserId', count: { $sum: 1 } } },
    ])
    let mvpUserId: string | null = null
    let maxGiven = 0
    for (const g of weeklyGivers) {
      if (g.count > maxGiven) {
        maxGiven = g.count
        mvpUserId = g._id.toString()
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
      const monthlyWaterCount = monthlyWaterMap.get(uid) || 0
      const waterBonus = Math.min(Math.floor(monthlyWaterCount / 3) * 5, 20)

      // 枯れ度計算: 最終投稿 or 最終水やり受取から何日経ったか
      const lastPost = lastPostMap.get(uid)
      const lastWater = lastWaterReceivedMap.get(uid)
      const lastActivity = lastPost && lastWater
        ? new Date(Math.max(lastPost.getTime(), lastWater.getTime()))
        : lastPost || lastWater || null
      const daysSinceActivity = lastActivity
        ? Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
        : currentDay // 一度も投稿してない場合は今月の日数分

      // 3日以上放置で枯れ始める（1日あたり-5%、最大-30%）
      const witherPenalty = daysSinceActivity >= 3
        ? Math.min((daysSinceActivity - 2) * 5, 30)
        : 0

      const rawProgress = baseProgress + waterBonus - witherPenalty
      const progress = Math.max(Math.min(rawProgress, 100), -30) // マイナスも許容（枯れ表現用）

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
