'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { TopBar } from '@/components/TopBar'
import { Card, CardTitle } from '@/components/Card'
import { MoodPicker } from '@/components/MoodPicker'
import { MOOD_EMOJI, type Mood } from '@/lib/constants'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface Share {
  id: string
  userId: string
  userName: string
  mood: Mood
  value?: string
  action?: string
  letGo?: string
  declaration: string
  createdAt: string
}

interface CoachingNote {
  redline?: string
  question?: string
}

type WindowStatus = 'before' | 'open' | 'after'

export default function SharePage() {
  const { data: session } = useSession()
  const [shares, setShares] = useState<Share[]>([])
  const [myCoachingNote, setMyCoachingNote] = useState<CoachingNote | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [selectedMood, setSelectedMood] = useState<Mood | null>(null)
  const [value, setValue] = useState('')
  const [action, setAction] = useState('')
  const [letGo, setLetGo] = useState('')
  const [declaration, setDeclaration] = useState('')
  const [hasPosted, setHasPosted] = useState(false)
  const [windowStatus, setWindowStatus] = useState<WindowStatus>('before')

  const today = format(new Date(), 'yyyy年M月d日（E）', { locale: ja })

  const checkWindowStatus = () => {
    const now = new Date()
    const jstOffset = 9 * 60
    const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes()
    const jstMinutes = (utcMinutes + jstOffset) % (24 * 60)

    const openTime = 7 * 60
    const closeTime = 8 * 60

    if (jstMinutes < openTime) {
      setWindowStatus('before')
    } else if (jstMinutes < closeTime) {
      setWindowStatus('open')
    } else {
      setWindowStatus('after')
    }
  }

  useEffect(() => {
    checkWindowStatus()
    const interval = setInterval(checkWindowStatus, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/share')
        if (res.ok) {
          const data = await res.json()
          setShares(data.shares)
          setMyCoachingNote(data.myCoachingNote)

          const myShare = data.shares.find(
            (s: Share) => s.userId === session?.user?.id
          )
          if (myShare) {
            setHasPosted(true)
            setSelectedMood(myShare.mood)
            setValue(myShare.value || '')
            setAction(myShare.action || '')
            setLetGo(myShare.letGo || '')
            setDeclaration(myShare.declaration)
          }
        }
      } catch (error) {
        console.error('Failed to fetch shares:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user) {
      fetchData()
    }
  }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMood || !declaration.trim()) return

    setError('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood: selectedMood,
          value,
          action,
          letGo,
          declaration
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || '投稿に失敗しました')
        setSubmitting(false)
        return
      }

      setHasPosted(true)
      const refreshRes = await fetch('/api/share')
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json()
        setShares(refreshData.shares)
      }
    } catch {
      setError('エラーが発生しました')
    } finally {
      setSubmitting(false)
    }
  }

  const getWindowMessage = () => {
    switch (windowStatus) {
      case 'before':
        return 'まだ投稿時間ではありません（7:00〜8:00）'
      case 'open':
        return '投稿可能です'
      case 'after':
        return '投稿ウィンドウは終了しました（閲覧のみ）'
    }
  }

  const canPost = windowStatus === 'open'

  return (
    <div className="min-h-screen bg-[#f0e8eb]">
      <TopBar />

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="text-center py-4">
          <p className="text-[#4a3f42]/60 text-sm">{today}</p>
          <h1 className="text-xl font-semibold mt-1 text-[#4a3f42]">Morning Journal</h1>
          <p className="text-sm text-[#4a3f42]/50 mt-1">朝の問い</p>
          <p
            className={`text-sm mt-2 ${
              windowStatus === 'open' ? 'text-green-600' : 'text-[#d46a7e]'
            }`}
          >
            {getWindowMessage()}
          </p>
        </div>

        {!hasPosted && (
          <Card>
            <CardTitle>あなたのMorning Journal</CardTitle>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#4a3f42] mb-2">
                  今日の自分の状態は？
                </label>
                <MoodPicker
                  selected={selectedMood}
                  onChange={setSelectedMood}
                  disabled={!canPost}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4a3f42] mb-1">
                  今日、最も大切にする価値観・判断基準は？
                </label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="例: 丁寧さ、スピード、誠実さ"
                  disabled={!canPost}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4a3f42] mb-1">
                  今日これができたら「前に進んだ」と言える行動は？
                </label>
                <input
                  type="text"
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  placeholder="例: 企画書のドラフトを完成させる"
                  disabled={!canPost}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4a3f42] mb-1">
                  今日、手放す思考・感情は？
                </label>
                <p className="text-xs text-[#4a3f42]/50 mb-2">
                  （不安・焦り・比較・恐れ など）
                </p>
                <input
                  type="text"
                  value={letGo}
                  onChange={(e) => setLetGo(e.target.value)}
                  placeholder="例: 他人との比較"
                  disabled={!canPost}
                />
              </div>

              <div className="border-t border-[#d46a7e]/20 pt-6">
                <label className="block text-sm font-medium text-[#4a3f42] mb-1">
                  今日の宣言（1文）
                </label>
                <p className="text-xs text-[#4a3f42]/50 mb-2">
                  今日の自分は＿＿＿＿＿＿＿＿＿＿。
                </p>
                <input
                  type="text"
                  value={declaration}
                  onChange={(e) => setDeclaration(e.target.value)}
                  placeholder="今日の自分は、集中して成果を出す。"
                  disabled={!canPost}
                  required
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}

              <button
                type="submit"
                disabled={!canPost || submitting || !selectedMood}
                className="w-full"
              >
                {submitting ? '投稿中...' : '宣言する'}
              </button>
            </form>
          </Card>
        )}

        {hasPosted && (
          <Card className="border-2 border-[#d46a7e]/30">
            <CardTitle>あなたのMorning Journal</CardTitle>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{MOOD_EMOJI[selectedMood!]}</span>
                <span className="text-[#4a3f42]/60">今日の状態</span>
              </div>

              {value && (
                <div>
                  <p className="text-xs text-[#4a3f42]/50">大切にする価値観</p>
                  <p className="text-[#4a3f42]">{value}</p>
                </div>
              )}

              {action && (
                <div>
                  <p className="text-xs text-[#4a3f42]/50">前に進む行動</p>
                  <p className="text-[#4a3f42]">{action}</p>
                </div>
              )}

              {letGo && (
                <div>
                  <p className="text-xs text-[#4a3f42]/50">手放すもの</p>
                  <p className="text-[#4a3f42]">{letGo}</p>
                </div>
              )}

              <div className="border-t border-[#d46a7e]/20 pt-4">
                <p className="text-xs text-[#4a3f42]/50">今日の宣言</p>
                <p className="text-lg font-medium text-[#4a3f42]">{declaration}</p>
              </div>
            </div>

            {canPost && (
              <button
                onClick={() => setHasPosted(false)}
                className="mt-4 text-sm text-[#4a3f42]/60 hover:text-[#d46a7e] transition"
              >
                編集する
              </button>
            )}
          </Card>
        )}

        {myCoachingNote && (myCoachingNote.redline || myCoachingNote.question) && (
          <Card className="border-2 border-[#d46a7e]/30">
            <CardTitle>コーチからのフィードバック</CardTitle>
            {myCoachingNote.redline && (
              <div className="mb-4">
                <p className="text-sm text-[#4a3f42]/60 mb-1">赤入れ</p>
                <p className="text-[#d46a7e]">{myCoachingNote.redline}</p>
              </div>
            )}
            {myCoachingNote.question && (
              <div>
                <p className="text-sm text-[#4a3f42]/60 mb-1">問い</p>
                <p className="text-[#c25a6e]">{myCoachingNote.question}</p>
              </div>
            )}
          </Card>
        )}

        <Card>
          <CardTitle>みんなの宣言</CardTitle>
          {loading ? (
            <div className="text-center text-[#4a3f42]/50">読み込み中...</div>
          ) : shares.length === 0 ? (
            <div className="text-center text-[#4a3f42]/50">
              まだ誰も投稿していません
            </div>
          ) : (
            <div className="space-y-4">
              {shares.map((share) => (
                <div
                  key={share.id}
                  className={`p-4 rounded-lg ${
                    share.userId === session?.user?.id
                      ? 'bg-[#d46a7e]/10'
                      : 'bg-[#f0e8eb]'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{MOOD_EMOJI[share.mood]}</span>
                    <span className="text-sm text-[#4a3f42]/60">{share.userName}</span>
                  </div>

                  {(share.value || share.action || share.letGo) && (
                    <div className="text-sm text-[#4a3f42]/70 space-y-1 mb-2 pl-9">
                      {share.value && <p>価値観: {share.value}</p>}
                      {share.action && <p>行動: {share.action}</p>}
                      {share.letGo && <p>手放す: {share.letGo}</p>}
                    </div>
                  )}

                  <p className="text-[#4a3f42] font-medium pl-9">{share.declaration}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>
    </div>
  )
}
