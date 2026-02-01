'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { TopBar } from '@/components/TopBar'
import { Card, CardTitle } from '@/components/Card'
import { MOOD_EMOJI, type Mood } from '@/lib/constants'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface TimelineItem {
  id: string
  type: 'morning' | 'night'
  userId: string
  userName: string
  userImage: string | null
  createdAt: string
  // Morning fields
  mood?: Mood
  declaration?: string
  value?: string
  action?: string
  letGo?: string
  // Night fields
  proudChoice?: string
  learning?: string
  tomorrowMessage?: string
  selfScore?: number
}

interface CoachingNote {
  redline?: string
  question?: string
}

export default function HomePage() {
  const { data: session } = useSession()
  const [timeline, setTimeline] = useState<TimelineItem[]>([])
  const [coachingNote, setCoachingNote] = useState<CoachingNote | null>(null)
  const [loading, setLoading] = useState(true)

  const today = format(new Date(), 'yyyy年M月d日（E）', { locale: ja })
  const currentHour = new Date().getHours()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // タイムラインを取得
        const timelineRes = await fetch('/api/timeline')
        if (timelineRes.ok) {
          const timelineData = await timelineRes.json()
          setTimeline(timelineData.timeline || [])
        }

        // コーチングノートを取得
        const shareRes = await fetch('/api/share')
        if (shareRes.ok) {
          const shareData = await shareRes.json()
          setCoachingNote(shareData.myCoachingNote)
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

  const getGreeting = () => {
    if (currentHour < 12) return 'おはようございます'
    if (currentHour < 18) return 'こんにちは'
    return 'こんばんは'
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'たった今'
    if (diffMins < 60) return `${diffMins}分前`
    if (diffHours < 24) return `${diffHours}時間前`
    if (diffDays < 7) return `${diffDays}日前`
    return format(date, 'M/d', { locale: ja })
  }

  return (
    <div className="min-h-screen bg-[#f0e8eb]">
      <TopBar />

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="text-center py-4">
          <p className="text-[#4a3f42]/60 text-sm">{today}</p>
          <h1 className="text-xl font-semibold mt-1 text-[#4a3f42]">
            {getGreeting()}、{session?.user?.name}さん
          </h1>
        </div>

        {/* アクションボタン */}
        <div className="flex gap-3">
          <Link
            href="/share"
            className="flex-1 flex items-center justify-center gap-2 bg-[#d46a7e] hover:bg-[#c25a6e] text-white font-semibold px-4 py-3 rounded-xl transition"
          >
            <span>☀️</span>
            <span>朝の投稿</span>
          </Link>
          <Link
            href="/night"
            className="flex-1 flex items-center justify-center gap-2 bg-[#4a3f42] hover:bg-[#3a2f32] text-white font-semibold px-4 py-3 rounded-xl transition"
          >
            <span>🌙</span>
            <span>夜の投稿</span>
          </Link>
        </div>

        {/* コーチからのフィードバック */}
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

        {/* タイムライン */}
        <div>
          <h2 className="text-lg font-semibold text-[#4a3f42] mb-4">みんなの投稿</h2>

          {loading ? (
            <Card>
              <div className="text-center text-[#4a3f42]/50">読み込み中...</div>
            </Card>
          ) : timeline.length === 0 ? (
            <Card>
              <div className="text-center text-[#4a3f42]/50">
                まだ投稿がありません
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {timeline.map((item) => (
                <Card
                  key={item.id}
                  className={item.userId === session?.user?.id ? 'border-2 border-[#d46a7e]/30' : ''}
                >
                  {/* ヘッダー */}
                  <div className="flex items-center gap-3 mb-3">
                    {item.userImage ? (
                      <img
                        src={item.userImage}
                        alt={item.userName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#d46a7e]/20 flex items-center justify-center">
                        <span className="text-lg">
                          {item.type === 'morning' ? '☀️' : '🌙'}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#4a3f42]">{item.userName}</span>
                        {item.type === 'morning' && item.mood && (
                          <span className="text-lg">{MOOD_EMOJI[item.mood]}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#4a3f42]/50">
                        <span className={item.type === 'morning' ? 'text-[#d46a7e]' : 'text-[#4a3f42]'}>
                          {item.type === 'morning' ? '朝の投稿' : '夜の投稿'}
                        </span>
                        <span>•</span>
                        <span>{formatTimeAgo(item.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* コンテンツ */}
                  {item.type === 'morning' ? (
                    <div className="space-y-2">
                      {item.declaration && (
                        <p className="text-[#4a3f42] font-medium">{item.declaration}</p>
                      )}
                      {(item.value || item.action || item.letGo) && (
                        <div className="text-sm text-[#4a3f42]/70 space-y-1 pl-2 border-l-2 border-[#d46a7e]/30">
                          {item.value && <p>価値観: {item.value}</p>}
                          {item.action && <p>行動: {item.action}</p>}
                          {item.letGo && <p>手放す: {item.letGo}</p>}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {item.proudChoice && (
                        <div>
                          <p className="text-xs text-[#4a3f42]/50">誇れる選択</p>
                          <p className="text-[#4a3f42]">{item.proudChoice}</p>
                        </div>
                      )}
                      {item.learning && (
                        <div>
                          <p className="text-xs text-[#4a3f42]/50">学び</p>
                          <p className="text-[#4a3f42]">{item.learning}</p>
                        </div>
                      )}
                      {item.tomorrowMessage && (
                        <div className="bg-[#f0e8eb] rounded-lg p-3 mt-2">
                          <p className="text-xs text-[#4a3f42]/50 mb-1">明日の自分へ</p>
                          <p className="text-[#4a3f42] font-medium">{item.tomorrowMessage}</p>
                        </div>
                      )}
                      {item.selfScore && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm text-[#4a3f42]/50">今日の点数:</span>
                          <span className="text-lg font-bold text-[#d46a7e]">{item.selfScore}/10</span>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
