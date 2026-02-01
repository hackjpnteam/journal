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
  type: 'morning' | 'night' | 'okr'
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
  // OKR fields
  okrType?: 'weekly' | 'monthly'
  periodKey?: string
  objective?: string
  keyResults?: string[]
  focus?: string
  identityFocus?: string
}

interface CoachingNote {
  redline?: string
  question?: string
}

interface OKRData {
  objective: string
  keyResults: string[]
  focus?: string
}

export default function HomePage() {
  const { data: session } = useSession()
  const [timeline, setTimeline] = useState<TimelineItem[]>([])
  const [coachingNote, setCoachingNote] = useState<CoachingNote | null>(null)
  const [weeklyOKR, setWeeklyOKR] = useState<OKRData | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

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

        // 今週のOKRを取得
        const now = new Date()
        const year = now.getFullYear()
        const weekNum = Math.ceil(
          ((now.getTime() - new Date(year, 0, 1).getTime()) / 86400000 +
            new Date(year, 0, 1).getDay() +
            1) /
            7
        )
        const weeklyPeriodKey = `${year}-W${String(weekNum).padStart(2, '0')}`
        const okrRes = await fetch(`/api/okr?type=weekly&periodKey=${weeklyPeriodKey}`)
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

  const handleDeletePost = async (postId: string, postType: string) => {
    if (!confirm('この投稿を削除しますか？')) return

    setDeleting(postId)
    try {
      const res = await fetch(`/api/admin/delete-post?id=${postId}&type=${postType}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setTimeline(prev => prev.filter(item => item.id !== postId))
      } else {
        const data = await res.json()
        alert(data.error || '削除に失敗しました')
      }
    } catch {
      alert('エラーが発生しました')
    } finally {
      setDeleting(null)
    }
  }

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

        {/* 今週のOKR */}
        {weeklyOKR && (
          <Card>
            <div className="flex items-center justify-between mb-2">
              <CardTitle>今週の目標</CardTitle>
              <Link
                href="/okr"
                className="text-xs text-[#d46a7e] hover:underline"
              >
                編集 →
              </Link>
            </div>
            <p className="text-[#4a3f42] font-medium mb-2">{weeklyOKR.objective}</p>
            {weeklyOKR.keyResults && weeklyOKR.keyResults.filter(kr => kr).length > 0 && (
              <ul className="space-y-1 text-sm text-[#4a3f42]/70 mb-2">
                {weeklyOKR.keyResults.filter(kr => kr).map((kr, i) => (
                  <li key={i}>• {kr}</li>
                ))}
              </ul>
            )}
            {weeklyOKR.focus && (
              <p className="text-sm text-[#d46a7e]">
                Focus: {weeklyOKR.focus}
              </p>
            )}
          </Card>
        )}

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
                          {item.type === 'morning' ? '☀️' : item.type === 'night' ? '🌙' : '🎯'}
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
                        <span className={
                          item.type === 'morning' ? 'text-[#d46a7e]' :
                          item.type === 'okr' ? 'text-blue-600' : 'text-[#4a3f42]'
                        }>
                          {item.type === 'morning' ? '朝の投稿' :
                           item.type === 'night' ? '夜の投稿' :
                           item.okrType === 'weekly' ? '週間OKR' : '月間OKR'}
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
                  ) : item.type === 'night' ? (
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
                  ) : (
                    <div className="space-y-2">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-xs text-blue-600/70 mb-1">
                          {item.okrType === 'weekly' ? '今週の目標' : '今月の目標'}
                        </p>
                        <p className="text-[#4a3f42] font-medium">{item.objective}</p>
                      </div>
                      {item.keyResults && item.keyResults.filter(kr => kr).length > 0 && (
                        <ul className="text-sm text-[#4a3f42]/70 space-y-1 pl-2 border-l-2 border-blue-300">
                          {item.keyResults.filter(kr => kr).map((kr, i) => (
                            <li key={i}>• {kr}</li>
                          ))}
                        </ul>
                      )}
                      {item.focus && (
                        <p className="text-sm text-blue-600">Focus: {item.focus}</p>
                      )}
                      {item.identityFocus && (
                        <p className="text-sm text-blue-600">Identity: {item.identityFocus}</p>
                      )}
                    </div>
                  )}

                  {/* superadmin用削除ボタン */}
                  {session?.user?.role === 'superadmin' && (
                    <div className="mt-3 pt-3 border-t border-[#d46a7e]/20">
                      <button
                        onClick={() => handleDeletePost(item.id, item.type)}
                        disabled={deleting === item.id}
                        className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
                      >
                        {deleting === item.id ? '削除中...' : '🗑️ この投稿を削除'}
                      </button>
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
