import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { DailyShare, MOODS } from '@/models/DailyShare'
import { CoachingNote } from '@/models/CoachingNote'
import { getDateKey, isShareWindowOpen } from '@/lib/time'

const shareSchema = z.object({
  mood: z.enum(MOODS),
  value: z.string().optional(),
  action: z.string().optional(),
  letGo: z.string().optional(),
  declaration: z.string().min(1, '宣言を入力してください'),
})

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const dateKey = searchParams.get('dateKey') || getDateKey()

    await connectDB()

    const shares = await DailyShare.find({ dateKey })
      .populate('userId', 'name avatar')
      .sort({ createdAt: 1 })

    const myCoachingNote = await CoachingNote.findOne({
      userId: session.user.id,
      dateKey,
    })

    return NextResponse.json({
      shares: shares.map((s) => ({
        id: s._id.toString(),
        userId: s.userId._id.toString(),
        userName: (s.userId as unknown as { name: string }).name,
        userAvatar: (s.userId as unknown as { avatar?: string }).avatar || '👤',
        mood: s.mood,
        value: s.value,
        action: s.action,
        letGo: s.letGo,
        declaration: s.declaration,
        createdAt: s.createdAt,
      })),
      myCoachingNote: myCoachingNote
        ? {
            redline: myCoachingNote.redline,
            question: myCoachingNote.question,
          }
        : null,
    })
  } catch (error) {
    console.error('Get share error:', error)
    return NextResponse.json({ error: '取得に失敗しました' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const body = await req.json()
    const { mood, value, action, letGo, declaration } = shareSchema.parse(body)

    await connectDB()

    const dateKey = getDateKey()

    // 既存の投稿があるか確認（編集の場合は時間制限なし）
    const existingShare = await DailyShare.findOne({
      userId: session.user.id,
      dateKey,
    })

    // 新規投稿の場合のみ時間制限をチェック
    if (!existingShare && !isShareWindowOpen()) {
      return NextResponse.json(
        { error: '新規投稿は 7:00〜8:00 の間のみ可能です' },
        { status: 403 }
      )
    }

    const share = await DailyShare.findOneAndUpdate(
      { userId: session.user.id, dateKey },
      {
        userId: session.user.id,
        dateKey,
        mood,
        value: value || undefined,
        action: action || undefined,
        letGo: letGo || undefined,
        declaration
      },
      { upsert: true, new: true }
    )

    return NextResponse.json({
      id: share._id.toString(),
      mood: share.mood,
      value: share.value,
      action: share.action,
      letGo: share.letGo,
      declaration: share.declaration,
      dateKey: share.dateKey,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error('Post share error:', error)
    return NextResponse.json({ error: '投稿に失敗しました' }, { status: 500 })
  }
}
