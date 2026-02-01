import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { DailyShare } from '@/models/DailyShare'
import { CoachingNote } from '@/models/CoachingNote'
import { getDateKey } from '@/lib/time'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    if (session.user.role !== 'coach') {
      return NextResponse.json({ error: 'コーチのみアクセス可能です' }, { status: 403 })
    }

    await connectDB()

    const dateKey = getDateKey()

    // 今日の全員の宣言を取得
    const shares = await DailyShare.find({ dateKey })
      .populate('userId', 'name email')
      .sort({ createdAt: 1 })

    // 今日のコーチングノートも取得
    const notes = await CoachingNote.find({ dateKey })

    const notesMap = new Map(notes.map((n) => [n.userId.toString(), n]))

    return NextResponse.json(
      shares.map((s) => {
        const note = notesMap.get(s.userId._id.toString())
        return {
          id: s._id.toString(),
          userId: s.userId._id.toString(),
          userName: (s.userId as unknown as { name: string }).name,
          userEmail: (s.userId as unknown as { email: string }).email,
          mood: s.mood,
          value: s.value,
          action: s.action,
          letGo: s.letGo,
          declaration: s.declaration,
          createdAt: s.createdAt,
          coachingNote: note
            ? {
                redline: note.redline,
                question: note.question,
              }
            : null,
        }
      })
    )
  } catch (error) {
    console.error('Get coach today error:', error)
    return NextResponse.json({ error: '取得に失敗しました' }, { status: 500 })
  }
}
