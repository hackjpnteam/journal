import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { GoogleCalendarSync } from '@/models/GoogleCalendarSync'

// Google Calendar連携状態を取得
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    await connectDB()

    const sync = await GoogleCalendarSync.findOne({ userId: session.user.id })

    return NextResponse.json({
      isConnected: !!sync,
      isEnabled: sync?.isEnabled || false,
      hasCalendar: !!sync?.calendarId,
      hasReminder: !!sync?.reminderEventId,
      // 実装中フラグ
      isImplemented: false,
    })
  } catch (error) {
    console.error('Get Google Calendar sync error:', error)
    return NextResponse.json({ error: '取得に失敗しました' }, { status: 500 })
  }
}

// Google Calendar連携を無効化
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    // TODO: 実装後に有効化
    return NextResponse.json({
      error: 'この機能は現在実装中です',
      isImplemented: false
    }, { status: 501 })

    // await connectDB()
    // await GoogleCalendarSync.findOneAndDelete({ userId: session.user.id })
    // return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete Google Calendar sync error:', error)
    return NextResponse.json({ error: '削除に失敗しました' }, { status: 500 })
  }
}
