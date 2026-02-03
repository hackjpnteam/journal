import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { OKR } from '@/models/OKR'

const okrSchema = z.object({
  type: z.enum(['monthly', 'weekly']),
  periodKey: z.string().min(1),
  objective: z.string().min(1, '目標を入力してください'),
  keyResults: z.array(z.string()).max(3),
  keyResultsProgress: z.array(z.number().min(0).max(100)).max(3).optional(),
  focus: z.string().optional(),
  identityFocus: z.string().optional(),
  isShared: z.boolean().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const periodKey = searchParams.get('periodKey')

    if (!type || !periodKey) {
      return NextResponse.json({ error: 'type と periodKey が必要です' }, { status: 400 })
    }

    await connectDB()

    const okr = await OKR.findOne({
      userId: session.user.id,
      type,
      periodKey,
    })

    return NextResponse.json(okr || null)
  } catch (error) {
    console.error('Get OKR error:', error)
    return NextResponse.json({ error: 'OKRの取得に失敗しました' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const body = await req.json()
    const data = okrSchema.parse(body)

    await connectDB()

    const filteredKeyResults = data.keyResults.filter((kr) => kr.trim())
    const progress = data.keyResultsProgress || [0, 0, 0]

    const okr = await OKR.findOneAndUpdate(
      {
        userId: session.user.id,
        type: data.type,
        periodKey: data.periodKey,
      },
      {
        $set: {
          userId: session.user.id,
          type: data.type,
          periodKey: data.periodKey,
          objective: data.objective,
          keyResults: filteredKeyResults,
          keyResultsProgress: progress,
          focus: data.focus,
          identityFocus: data.identityFocus,
          isShared: data.isShared || false,
        }
      },
      { upsert: true, new: true }
    )

    return NextResponse.json(okr)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error('Save OKR error:', error)
    return NextResponse.json({ error: 'OKRの保存に失敗しました' }, { status: 500 })
  }
}
