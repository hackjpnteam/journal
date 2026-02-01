import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'
import { OKR } from '@/models/OKR'
import { getMonthlyPeriodKey, getWeeklyPeriodKey } from '@/lib/time'

const onboardingSchema = z.object({
  weekly: z.object({
    objective: z.string().min(1, '今週の目標を入力してください'),
    keyResults: z.array(z.string()).max(3),
    focus: z.string().optional(),
  }),
  monthly: z.object({
    objective: z.string().min(1, '今月の目標を入力してください'),
    keyResults: z.array(z.string()).max(3),
    identityFocus: z.string().optional(),
  }),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const body = await req.json()
    const { weekly, monthly } = onboardingSchema.parse(body)

    await connectDB()

    const userId = session.user.id
    const monthlyPeriodKey = getMonthlyPeriodKey()
    const weeklyPeriodKey = getWeeklyPeriodKey()

    // Monthly OKR を作成/更新
    await OKR.findOneAndUpdate(
      { userId, type: 'monthly', periodKey: monthlyPeriodKey },
      {
        userId,
        type: 'monthly',
        periodKey: monthlyPeriodKey,
        objective: monthly.objective,
        keyResults: monthly.keyResults.filter((kr) => kr.trim()),
        identityFocus: monthly.identityFocus,
      },
      { upsert: true, new: true }
    )

    // Weekly OKR を作成/更新
    await OKR.findOneAndUpdate(
      { userId, type: 'weekly', periodKey: weeklyPeriodKey },
      {
        userId,
        type: 'weekly',
        periodKey: weeklyPeriodKey,
        objective: weekly.objective,
        keyResults: weekly.keyResults.filter((kr) => kr.trim()),
        focus: weekly.focus,
      },
      { upsert: true, new: true }
    )

    // onboardingCompleted を true に
    await User.findByIdAndUpdate(userId, { onboardingCompleted: true })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error('Onboarding error:', error)
    return NextResponse.json({ error: 'オンボーディングに失敗しました' }, { status: 500 })
  }
}
