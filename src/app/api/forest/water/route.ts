import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'
import { TreeWater } from '@/models/TreeWater'

// JST基準で今日の開始時刻を取得
function getTodayStartJST(): Date {
  const now = new Date()
  const jstOffset = 9 * 60 * 60 * 1000
  const jstNow = new Date(now.getTime() + jstOffset)
  const jstDate = new Date(jstNow.getFullYear(), jstNow.getMonth(), jstNow.getDate())
  return new Date(jstDate.getTime() - jstOffset)
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { targetUserId } = await request.json()

    if (!targetUserId) {
      return NextResponse.json({ error: '対象ユーザーが必要です' }, { status: 400 })
    }

    // 自分の木には水やりできない
    if (targetUserId === session.user.id) {
      return NextResponse.json({ error: '自分の木には水やりできません' }, { status: 400 })
    }

    await connectDB()

    // 対象ユーザーの存在確認
    const targetUser = await User.findById(targetUserId)
    if (!targetUser) {
      return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 })
    }

    // 今日（JST基準）の水やり済みチェック
    const todayStart = getTodayStartJST()
    const existing = await TreeWater.findOne({
      fromUserId: session.user.id,
      targetUserId,
      createdAt: { $gte: todayStart },
    })

    if (existing) {
      return NextResponse.json({ error: '今日はすでにこの木に水やりしました' }, { status: 409 })
    }

    // 水やり実行
    await TreeWater.create({
      fromUserId: session.user.id,
      targetUserId,
      fromUserName: session.user.name || '',
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Water tree error:', error)
    return NextResponse.json({ error: '水やりに失敗しました' }, { status: 500 })
  }
}
