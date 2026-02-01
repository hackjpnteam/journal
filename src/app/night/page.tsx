'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { TopBar } from '@/components/TopBar'
import { Card, CardTitle } from '@/components/Card'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface MyJournal {
  id: string
  proudChoice?: string
  offChoice?: string
  moodReflection?: string
  learning?: string
  tomorrowMessage?: string
  selfScore?: number
  isShared: boolean
}

interface SharedJournal {
  id: string
  userId: string
  userName: string
  userImage?: string | null
  proudChoice?: string
  offChoice?: string
  moodReflection?: string
  learning?: string
  tomorrowMessage?: string
  selfScore?: number
  createdAt: string
}

// サンプル投稿データ
const SAMPLE_JOURNALS: SharedJournal[] = [
  {
    id: 'sample-1',
    userId: 'sample-1',
    userName: '山田太郎',
    userImage: null,
    proudChoice: '難しい会話を避けずに向き合った',
    learning: '小さな一歩でも進めば気持ちが変わる',
    tomorrowMessage: '焦らなくていい。今日も一歩進んだ。',
    selfScore: 7,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sample-2',
    userId: 'sample-2',
    userName: '佐藤花子',
    userImage: null,
    proudChoice: '朝一番で最も重要なタスクに取り組んだ',
    learning: '朝の時間を有効活用すると1日の充実感が違う',
    tomorrowMessage: '明日も朝イチで集中して取り組もう！',
    selfScore: 8,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sample-3',
    userId: 'sample-3',
    userName: '鈴木一郎',
    userImage: null,
    proudChoice: '体調が悪くても最低限のタスクはこなした',
    learning: '無理しない勇気も大切',
    tomorrowMessage: 'ゆっくり休んで、また明日頑張ろう。',
    selfScore: 6,
    createdAt: new Date().toISOString(),
  },
]

type WindowStatus = 'before' | 'open' | 'after'

export default function NightPage() {
  const { data: session } = useSession()
  const [myJournal, setMyJournal] = useState<MyJournal | null>(null)
  const [sharedJournals, setSharedJournals] = useState<SharedJournal[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [proudChoice, setProudChoice] = useState('')
  const [offChoice, setOffChoice] = useState('')
  const [moodReflection, setMoodReflection] = useState('')
  const [learning, setLearning] = useState('')
  const [tomorrowMessage, setTomorrowMessage] = useState('')
  const [selfScore, setSelfScore] = useState<number | undefined>(undefined)
  const [isShared, setIsShared] = useState(false)
  const [hasPosted, setHasPosted] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [windowStatus, setWindowStatus] = useState<WindowStatus>('before')
  const [successMessage, setSuccessMessage] = useState('')

  const today = format(new Date(), 'yyyy年M月d日（E）', { locale: ja })

  const checkWindowStatus = () => {
    const now = new Date()
    const jstOffset = 9 * 60
    const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes()
    const jstMinutes = (utcMinutes + jstOffset) % (24 * 60)

    const openTime = 20 * 60  // 20:00
    const closeTime = 23 * 60 + 59 // 23:59

    if (jstMinutes < openTime) {
      setWindowStatus('before')
    } else if (jstMinutes <= closeTime) {
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
        const res = await fetch('/api/night')
        if (res.ok) {
          const data = await res.json()
          setSharedJournals(data.sharedJournals)

          if (data.myJournal) {
            setMyJournal(data.myJournal)
            setHasPosted(true)
            setProudChoice(data.myJournal.proudChoice || '')
            setOffChoice(data.myJournal.offChoice || '')
            setMoodReflection(data.myJournal.moodReflection || '')
            setLearning(data.myJournal.learning || '')
            setTomorrowMessage(data.myJournal.tomorrowMessage || '')
            setSelfScore(data.myJournal.selfScore)
            setIsShared(data.myJournal.isShared)
          }
        }
      } catch (error) {
        console.error('Failed to fetch night journal:', error)
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

    setError('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/night', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proudChoice,
          offChoice,
          moodReflection,
          learning,
          tomorrowMessage,
          selfScore,
          isShared,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || '投稿に失敗しました')
        setSubmitting(false)
        return
      }

      setMyJournal(data)
      setHasPosted(true)
      setIsEditing(false)
      setSuccessMessage('保存しました')
      setTimeout(() => setSuccessMessage(''), 3000)

      const refreshRes = await fetch('/api/night')
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json()
        setSharedJournals(refreshData.sharedJournals)
      }
    } catch {
      setError('エラーが発生しました')
    } finally {
      setSubmitting(false)
    }
  }

  const getWindowMessage = () => {
    if (hasPosted) {
      return '編集はいつでも可能です'
    }
    switch (windowStatus) {
      case 'before':
        return '新規投稿は 20:00〜23:59 の間のみ可能です'
      case 'open':
        return '投稿可能です'
      case 'after':
        return '新規投稿は 20:00〜23:59 の間のみ可能です'
    }
  }

  // 新規投稿は時間制限あり、編集はいつでも可能
  const canPost = windowStatus === 'open'
  const canEdit = hasPosted

  return (
    <div className="min-h-screen bg-[#f0e8eb]">
      <TopBar />

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="text-center py-4">
          <p className="text-[#4a3f42]/60 text-sm">{today}</p>
          <h1 className="text-xl font-semibold mt-1 text-[#4a3f42]">Night Journal</h1>
          <p className="text-sm text-[#4a3f42]/50 mt-1">夜の問い</p>
          <p
            className={`text-sm mt-2 ${
              windowStatus === 'open' || hasPosted ? 'text-green-600' : 'text-[#d46a7e]'
            }`}
          >
            {getWindowMessage()}
          </p>
          {successMessage && (
            <p className="text-sm mt-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg inline-block">
              {successMessage}
            </p>
          )}
        </div>

        {(!hasPosted || isEditing) && (
          <Card>
            <CardTitle>あなたのNight Journal</CardTitle>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#4a3f42] mb-1">
                  今日、自分を誇れる選択は何だったか？
                </label>
                <input
                  type="text"
                  value={proudChoice}
                  onChange={(e) => setProudChoice(e.target.value)}
                  placeholder="例: 難しい会話を避けずに向き合った"
                  disabled={!canPost && !isEditing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4a3f42] mb-1">
                  ズレた選択はあったか？ なぜ起きたか？
                </label>
                <input
                  type="text"
                  value={offChoice}
                  onChange={(e) => setOffChoice(e.target.value)}
                  placeholder="例: SNSを見すぎた。疲れて逃げたかった"
                  disabled={!canPost && !isEditing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4a3f42] mb-1">
                  今日の状態（朝の顔マーク）は正しかったか？
                </label>
                <input
                  type="text"
                  value={moodReflection}
                  onChange={(e) => setMoodReflection(e.target.value)}
                  placeholder="例: 思ったより調子が良かった"
                  disabled={!canPost && !isEditing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4a3f42] mb-1">
                  今日の学びは何だったか？
                </label>
                <input
                  type="text"
                  value={learning}
                  onChange={(e) => setLearning(e.target.value)}
                  placeholder="例: 小さな一歩でも進めば気持ちが変わる"
                  disabled={!canPost && !isEditing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4a3f42] mb-1">
                  明日の自分に一言メッセージを書くとしたら？
                </label>
                <input
                  type="text"
                  value={tomorrowMessage}
                  onChange={(e) => setTomorrowMessage(e.target.value)}
                  placeholder="例: 焦らなくていい。今日も一歩進んだ。"
                  disabled={!canPost && !isEditing}
                />
              </div>

              <div className="border-t border-[#d46a7e]/20 pt-6">
                <label className="block text-sm font-medium text-[#4a3f42] mb-2">
                  今日の自分を点数つけるとしたら？（1〜10点）
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => setSelfScore(score)}
                      disabled={!canPost && !isEditing}
                      className={`w-10 h-10 rounded-full text-sm font-medium transition ${
                        selfScore === score
                          ? 'bg-[#d46a7e] text-white'
                          : 'bg-white text-[#4a3f42] hover:bg-[#d46a7e]/10'
                      } ${(!canPost && !isEditing) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isShared"
                  checked={isShared}
                  onChange={(e) => setIsShared(e.target.checked)}
                  disabled={!canPost && !isEditing}
                  className="w-4 h-4 text-[#d46a7e] border-[#d46a7e]/30 rounded focus:ring-[#d46a7e]"
                />
                <label htmlFor="isShared" className="text-sm text-[#4a3f42]">
                  みんなに共有する
                </label>
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={(!canPost && !isEditing) || submitting}
                  className="flex-1"
                >
                  {submitting ? '保存中...' : isEditing ? '更新する' : '保存する'}
                </button>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-[#f0e8eb] hover:bg-[#d46a7e]/10 rounded-xl transition text-[#4a3f42]"
                  >
                    キャンセル
                  </button>
                )}
              </div>
            </form>
          </Card>
        )}

        {hasPosted && !isEditing && (
          <Card className="border-2 border-[#d46a7e]/30">
            <CardTitle>あなたのNight Journal</CardTitle>
            <div className="space-y-4">
              {proudChoice && (
                <div>
                  <p className="text-xs text-[#4a3f42]/50">誇れる選択</p>
                  <p className="text-[#4a3f42]">{proudChoice}</p>
                </div>
              )}

              {offChoice && (
                <div>
                  <p className="text-xs text-[#4a3f42]/50">ズレた選択</p>
                  <p className="text-[#4a3f42]">{offChoice}</p>
                </div>
              )}

              {moodReflection && (
                <div>
                  <p className="text-xs text-[#4a3f42]/50">状態の振り返り</p>
                  <p className="text-[#4a3f42]">{moodReflection}</p>
                </div>
              )}

              {learning && (
                <div>
                  <p className="text-xs text-[#4a3f42]/50">今日の学び</p>
                  <p className="text-[#4a3f42]">{learning}</p>
                </div>
              )}

              {tomorrowMessage && (
                <div>
                  <p className="text-xs text-[#4a3f42]/50">明日の自分へ</p>
                  <p className="text-lg font-medium text-[#4a3f42]">{tomorrowMessage}</p>
                </div>
              )}

              {selfScore && (
                <div className="border-t border-[#d46a7e]/20 pt-4">
                  <p className="text-xs text-[#4a3f42]/50">今日の自分の点数</p>
                  <p className="text-2xl font-bold text-[#d46a7e]">{selfScore}<span className="text-sm font-normal text-[#4a3f42]/50">/10</span></p>
                </div>
              )}

              <div className="text-sm text-[#4a3f42]/60">
                {isShared ? '🌙 共有中' : '🔒 非公開'}
              </div>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="mt-4 text-sm text-[#4a3f42]/60 hover:text-[#d46a7e] transition"
            >
              編集する
            </button>
          </Card>
        )}

        <Card>
          <CardTitle>みんなのNight Journal</CardTitle>
          {loading ? (
            <div className="text-center text-[#4a3f42]/50">読み込み中...</div>
          ) : (
            <div className="space-y-4">
              {sharedJournals.length === 0 && (
                <div className="text-center text-[#4a3f42]/50 mb-4 pb-4 border-b border-[#4a3f42]/20">
                  <p>まだ今日の投稿はありません</p>
                  <p className="text-xs mt-1">以下はサンプル表示です</p>
                </div>
              )}
              {(sharedJournals.length > 0 ? sharedJournals : SAMPLE_JOURNALS).map((journal) => (
                <div
                  key={journal.id}
                  className={`p-4 rounded-lg ${
                    journal.userId === session?.user?.id
                      ? 'bg-[#d46a7e]/10'
                      : 'bg-[#f0e8eb]'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      {journal.userImage ? (
                        <img
                          src={journal.userImage}
                          alt={journal.userName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#4a3f42]/20 flex items-center justify-center">
                          <svg className="w-4 h-4 text-[#4a3f42]/60" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                          </svg>
                        </div>
                      )}
                      <span className="text-sm font-medium text-[#4a3f42]">{journal.userName}</span>
                    </div>
                    <span className="text-xl">🌙</span>
                  </div>

                  <div className="text-sm text-[#4a3f42]/70 space-y-1 mb-2 pl-9">
                    {journal.proudChoice && <p>誇れる選択: {journal.proudChoice}</p>}
                    {journal.learning && <p>学び: {journal.learning}</p>}
                  </div>

                  {journal.tomorrowMessage && (
                    <p className="text-[#4a3f42] font-medium pl-9">
                      💬 {journal.tomorrowMessage}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>
    </div>
  )
}
