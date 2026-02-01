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
  userImage?: string | null
  mood: Mood
  value?: string
  action?: string
  letGo?: string
  declaration: string
  createdAt: string
}

// サンプル投稿データ
const SAMPLE_SHARES: Share[] = [
  {
    id: 'sample-1',
    userId: 'sample-1',
    userName: '山田太郎',
    userImage: null,
    mood: 'stable',
    value: '誠実さ',
    action: '企画書を完成させる',
    letGo: '完璧主義',
    declaration: '今日の自分は、一歩ずつ着実に前に進む。',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sample-2',
    userId: 'sample-2',
    userName: '佐藤花子',
    userImage: null,
    mood: 'fire',
    value: 'チャレンジ精神',
    action: '新しいプロジェクトの提案をする',
    letGo: '失敗への恐れ',
    declaration: '今日の自分は、挑戦を楽しむ！',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sample-3',
    userId: 'sample-3',
    userName: '鈴木一郎',
    userImage: null,
    mood: 'recover',
    value: '自分へのやさしさ',
    action: '無理せず休憩を取りながら仕事する',
    letGo: '焦り',
    declaration: '今日の自分は、自分のペースを大切にする。',
    createdAt: new Date().toISOString(),
  },
]

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
  const [isEditing, setIsEditing] = useState(false)
  const [windowStatus, setWindowStatus] = useState<WindowStatus>('before')
  const [successMessage, setSuccessMessage] = useState('')

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
      setIsEditing(false)
      setSuccessMessage('保存しました')
      setTimeout(() => setSuccessMessage(''), 3000)
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
    if (hasPosted) {
      return '編集はいつでも可能です'
    }
    switch (windowStatus) {
      case 'before':
        return '新規投稿は 7:00〜8:00 の間のみ可能です'
      case 'open':
        return '投稿可能です'
      case 'after':
        return '新規投稿は 7:00〜8:00 の間のみ可能です'
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
          <h1 className="text-xl font-semibold mt-1 text-[#4a3f42]">Morning Journal</h1>
          <p className="text-sm text-[#4a3f42]/50 mt-1">朝の問い</p>
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
            <CardTitle>あなたのMorning Journal</CardTitle>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#4a3f42] mb-2">
                  今日の自分の状態は？
                </label>
                <MoodPicker
                  selected={selectedMood}
                  onChange={setSelectedMood}
                  disabled={!canPost && !isEditing}
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
                  disabled={!canPost && !isEditing}
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
                  disabled={!canPost && !isEditing}
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
                  disabled={!canPost && !isEditing}
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
                  disabled={!canPost && !isEditing}
                  required
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={(!canPost && !isEditing) || submitting || !selectedMood}
                  className="flex-1"
                >
                  {submitting ? '保存中...' : isEditing ? '更新する' : '宣言する'}
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

            <button
              onClick={() => setIsEditing(true)}
              className="mt-4 text-sm text-[#4a3f42]/60 hover:text-[#d46a7e] transition"
            >
              編集する
            </button>
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
          ) : (
            <div className="space-y-4">
              {shares.length === 0 && (
                <div className="text-center text-[#4a3f42]/50 mb-4 pb-4 border-b border-[#d46a7e]/20">
                  <p>まだ今日の投稿はありません</p>
                  <p className="text-xs mt-1">以下はサンプル表示です</p>
                </div>
              )}
              {(shares.length > 0 ? shares : SAMPLE_SHARES).map((share) => (
                <div
                  key={share.id}
                  className={`p-4 rounded-lg ${
                    share.userId === session?.user?.id
                      ? 'bg-[#d46a7e]/10'
                      : 'bg-[#f0e8eb]'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      {share.userImage ? (
                        <img
                          src={share.userImage}
                          alt={share.userName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#d46a7e]/20 flex items-center justify-center">
                          <svg className="w-4 h-4 text-[#d46a7e]/60" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                          </svg>
                        </div>
                      )}
                      <span className="text-sm font-medium text-[#4a3f42]">{share.userName}</span>
                    </div>
                    <span className="text-2xl">{MOOD_EMOJI[share.mood]}</span>
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
