import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { CoachingNote } from '@/models/CoachingNote'
import { getDateKey } from '@/lib/time'

const noteSchema = z.object({
  userId: z.string().min(1, 'ユーザーIDが必要です'),
  redline: z.string().optional(),
  question: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    if (session.user.role !== 'coach') {
      return NextResponse.json({ error: 'コーチのみアクセス可能です' }, { status: 403 })
    }

    const body = await req.json()
    const { userId, redline, question } = noteSchema.parse(body)

    await connectDB()

    const dateKey = getDateKey()

    const note = await CoachingNote.findOneAndUpdate(
      { userId, dateKey },
      {
        userId,
        coachId: session.user.id,
        dateKey,
        redline: redline || undefined,
        question: question || undefined,
      },
      { upsert: true, new: true }
    )

    return NextResponse.json({
      id: note._id.toString(),
      redline: note.redline,
      question: note.question,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error('Post coach note error:', error)
    return NextResponse.json({ error: '保存に失敗しました' }, { status: 500 })
  }
}
