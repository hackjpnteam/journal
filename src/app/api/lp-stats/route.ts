import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'
import { DailyShare } from '@/models/DailyShare'

export async function GET() {
  try {
    await connectDB()

    // 総ユーザー数（テスト/サンプルを除外）
    const totalUsers = await User.countDocuments({
      email: { $not: /sample|test|example|demo/i },
    })

    // 総朝の投稿数
    const totalMorningPosts = await DailyShare.countDocuments()

    // 1回の朝活で節約される時間（時間）の想定
    // 朝の投稿1回につき、1日2時間の生産性向上
    const hoursSavedPerPost = 2

    // 合計節約時間（時間）
    const totalHoursSaved = totalMorningPosts * hoursSavedPerPost

    // 合計節約日数
    const totalDaysSaved = Math.round(totalHoursSaved / 24)

    return NextResponse.json({
      totalUsers,
      totalMorningPosts,
      totalHoursSaved,
      totalDaysSaved,
    })
  } catch (error) {
    console.error('LP stats error:', error)
    // エラー時はデフォルト値を返す
    return NextResponse.json({
      totalUsers: 0,
      totalMorningPosts: 0,
      totalHoursSaved: 0,
      totalDaysSaved: 0,
    })
  }
}
