'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { TopBar } from '@/components/TopBar'
import { Card, CardTitle } from '@/components/Card'
import { MOOD_EMOJI, type Mood } from '@/lib/constants'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface TodayShare {
  mood: Mood
  declaration: string
}

interface OKRData {
  objective: string
  keyResults: string[]
  focus?: string
  identityFocus?: string
}

interface CoachingNote {
  redline?: string
  question?: string
}

export default function HomePage() {
  const { data: session } = useSession()
  const [todayShare, setTodayShare] = useState<TodayShare | null>(null)
  const [weeklyOKR, setWeeklyOKR] = useState<OKRData | null>(null)
  const [coachingNote, setCoachingNote] = useState<CoachingNote | null>(null)
  const [loading, setLoading] = useState(true)

  const today = format(new Date(), 'yyyy年M月d日（E）', { locale: ja })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const shareRes = await fetch('/api/share')
        if (shareRes.ok) {
          const shareData = await shareRes.json()
          const myShare = shareData.shares.find(
            (s: { userId: string }) => s.userId === session?.user?.id
          )
          if (myShare) {
            setTodayShare({ mood: myShare.mood, declaration: myShare.declaration })
          }
          setCoachingNote(shareData.myCoachingNote)
        }

        const now = new Date()
        const year = now.getFullYear()
        const weekNum = Math.ceil(
          ((now.getTime() - new Date(year, 0, 1).getTime()) / 86400000 +
            new Date(year, 0, 1).getDay() +
            1) /
            7
        )
        const weeklyPeriodKey = `${year}-W${String(weekNum).padStart(2, '0')}`

        const okrRes = await fetch(
          `/api/okr?type=weekly&periodKey=${weeklyPeriodKey}`
        )
        if (okrRes.ok) {
          const okrData = await okrRes.json()
          if (okrData) {
            setWeeklyOKR(okrData)
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user) {
      fetchData()
    }
  }, [session])

  return (
    <div className="min-h-screen bg-[#f0e8eb]">
      <TopBar />

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="text-center py-4">
          <p className="text-[#4a3f42]/60 text-sm">{today}</p>
          <h1 className="text-xl font-semibold mt-1 text-[#4a3f42]">
            おはようございます、{session?.user?.name}さん
          </h1>
        </div>

        <Card className="text-center">
          <div className="text-4xl mb-2">🌅</div>
          <p className="text-[#4a3f42]/60 mb-4">
            毎朝 7:00〜8:00 に今日の宣言を投稿できます
          </p>
          <Link
            href="/share"
            className="inline-block bg-[#d46a7e] hover:bg-[#c25a6e] text-white font-semibold px-6 py-3 rounded-xl transition"
          >
            共有ページへ
          </Link>
        </Card>

        {loading ? (
          <Card>
            <div className="text-center text-[#4a3f42]/50">読み込み中...</div>
          </Card>
        ) : todayShare ? (
          <Card>
            <CardTitle>今日の宣言</CardTitle>
            <div className="flex items-start gap-4">
              <div className="text-4xl">{MOOD_EMOJI[todayShare.mood]}</div>
              <div className="flex-1">
                <p className="text-lg text-[#4a3f42]">{todayShare.declaration}</p>
              </div>
            </div>
          </Card>
        ) : (
          <Card>
            <div className="text-center text-[#4a3f42]/60">
              今日はまだ宣言していません
            </div>
          </Card>
        )}

        {coachingNote && (coachingNote.redline || coachingNote.question) && (
          <Card className="border-2 border-[#d46a7e]/30">
            <CardTitle>コーチからのフィードバック</CardTitle>
            {coachingNote.redline && (
              <div className="mb-4">
                <p className="text-sm text-[#4a3f42]/60 mb-1">赤入れ</p>
                <p className="text-[#d46a7e]">{coachingNote.redline}</p>
              </div>
            )}
            {coachingNote.question && (
              <div>
                <p className="text-sm text-[#4a3f42]/60 mb-1">問い</p>
                <p className="text-[#c25a6e]">{coachingNote.question}</p>
              </div>
            )}
          </Card>
        )}

        {weeklyOKR && (
          <Card>
            <CardTitle>今週の目標</CardTitle>
            <p className="text-lg mb-3 text-[#4a3f42]">{weeklyOKR.objective}</p>
            {weeklyOKR.keyResults.length > 0 && (
              <ul className="space-y-1 text-[#4a3f42]/70 text-sm mb-3">
                {weeklyOKR.keyResults.map((kr, i) => (
                  <li key={i}>・{kr}</li>
                ))}
              </ul>
            )}
            {weeklyOKR.focus && (
              <p className="text-[#d46a7e] text-sm">
                Focus: {weeklyOKR.focus}
              </p>
            )}
            <Link
              href="/okr"
              className="inline-block mt-4 text-sm text-[#4a3f42]/60 hover:text-[#d46a7e] transition"
            >
              OKRを編集 →
            </Link>
          </Card>
        )}
      </main>
    </div>
  )
}
