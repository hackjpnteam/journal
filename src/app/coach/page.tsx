'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/TopBar'
import { Card, CardTitle } from '@/components/Card'
import { MOOD_EMOJI, type Mood } from '@/lib/constants'
import { useTimeTheme, themeColors } from '@/hooks/useTimeTheme'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface Share {
  id: string
  userId: string
  userName: string
  userEmail: string
  mood: Mood
  value?: string
  action?: string
  letGo?: string
  declaration: string
  createdAt: string
  coachingNote: {
    redline?: string
    question?: string
  } | null
}

export default function CoachPage() {
  const timeTheme = useTimeTheme()
  const theme = themeColors[timeTheme]
  const isNight = timeTheme === 'night'

  const [shares, setShares] = useState<Share[]>([])
  const [loading, setLoading] = useState(true)
  const [savingFor, setSavingFor] = useState<string | null>(null)

  const [editingNote, setEditingNote] = useState<{
    userId: string
    redline: string
    question: string
  } | null>(null)
  const [successMessage, setSuccessMessage] = useState('')

  const today = format(new Date(), 'yyyy年M月d日（E）', { locale: ja })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/coach/today')
        if (res.ok) {
          const data = await res.json()
          setShares(data)
        }
      } catch (error) {
        console.error('Failed to fetch shares:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const startEditing = (share: Share) => {
    setEditingNote({
      userId: share.userId,
      redline: share.coachingNote?.redline || '',
      question: share.coachingNote?.question || '',
    })
  }

  const cancelEditing = () => {
    setEditingNote(null)
  }

  const saveNote = async () => {
    if (!editingNote) return

    setSavingFor(editingNote.userId)

    try {
      const res = await fetch('/api/coach/note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editingNote.userId,
          redline: editingNote.redline,
          question: editingNote.question,
        }),
      })

      if (res.ok) {
        setShares((prev) =>
          prev.map((s) =>
            s.userId === editingNote.userId
              ? {
                  ...s,
                  coachingNote: {
                    redline: editingNote.redline,
                    question: editingNote.question,
                  },
                }
              : s
          )
        )
        setEditingNote(null)
        setSuccessMessage('保存しました')
        setTimeout(() => setSuccessMessage(''), 3000)
      }
    } catch (error) {
      console.error('Failed to save note:', error)
    } finally {
      setSavingFor(null)
    }
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${theme.bg}`}>
      <TopBar isNight={isNight} />

      <main className="max-w-3xl mx-auto p-4 space-y-6">
        <div className="text-center py-4">
          <p className={`text-sm font-medium ${theme.accentText}`}>Coach Dashboard</p>
          <h1 className={`text-xl font-semibold mt-1 ${theme.text}`}>{today}</h1>
          {successMessage && (
            <p className={`text-sm mt-2 text-green-600 px-4 py-2 rounded-lg inline-block ${isNight ? 'bg-green-900/30' : 'bg-green-50'}`}>
              {successMessage}
            </p>
          )}
        </div>

        {loading ? (
          <Card isNight={isNight}>
            <div className={`text-center ${theme.textFaint}`}>読み込み中...</div>
          </Card>
        ) : shares.length === 0 ? (
          <Card isNight={isNight}>
            <div className={`text-center ${theme.textFaint}`}>
              今日の投稿はまだありません
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {shares.map((share) => (
              <Card key={share.id} isNight={isNight}>
                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{MOOD_EMOJI[share.mood]}</span>
                    <div>
                      <span className={`font-medium ${theme.text}`}>{share.userName}</span>
                      <span className={`text-sm ml-2 ${theme.textFaint}`}>
                        {share.userEmail}
                      </span>
                    </div>
                  </div>

                  {(share.value || share.action || share.letGo) && (
                    <div className={`rounded-lg p-3 mb-3 space-y-2 text-sm ${isNight ? 'bg-[#1a1625]' : 'bg-[#f0e8eb]'}`}>
                      {share.value && (
                        <div>
                          <span className={theme.textFaint}>価値観: </span>
                          <span className={theme.text}>{share.value}</span>
                        </div>
                      )}
                      {share.action && (
                        <div>
                          <span className={theme.textFaint}>行動: </span>
                          <span className={theme.text}>{share.action}</span>
                        </div>
                      )}
                      {share.letGo && (
                        <div>
                          <span className={theme.textFaint}>手放す: </span>
                          <span className={theme.text}>{share.letGo}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className={`border-l-4 pl-3 ${isNight ? 'border-[#9b7bb8]' : 'border-[#d46a7e]'}`}>
                    <p className={`text-xs mb-1 ${theme.textFaint}`}>宣言</p>
                    <p className={`text-lg font-medium ${theme.text}`}>{share.declaration}</p>
                  </div>
                </div>

                {editingNote?.userId === share.userId ? (
                  <div className={`border-t pt-4 mt-4 space-y-4 ${isNight ? 'border-[#9b7bb8]/20' : 'border-[#d46a7e]/20'}`}>
                    <div>
                      <label className={`block text-sm mb-1 ${theme.textMuted}`}>
                        赤入れ（短文）
                      </label>
                      <input
                        type="text"
                        value={editingNote.redline}
                        onChange={(e) =>
                          setEditingNote({
                            ...editingNote,
                            redline: e.target.value,
                          })
                        }
                        placeholder="改善点や気づき"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm mb-1 ${theme.textMuted}`}>
                        問い（1つ）
                      </label>
                      <input
                        type="text"
                        value={editingNote.question}
                        onChange={(e) =>
                          setEditingNote({
                            ...editingNote,
                            question: e.target.value,
                          })
                        }
                        placeholder="考えてほしい質問"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={saveNote}
                        disabled={savingFor === share.userId}
                        className="flex-1 btn-primary"
                      >
                        {savingFor === share.userId ? '保存中...' : '保存'}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditing}
                        className={`px-4 py-2 rounded-xl transition ${
                          isNight
                            ? 'bg-[#2d2438] hover:bg-[#3d3448] text-white'
                            : 'bg-[#f0e8eb] hover:bg-[#d46a7e]/10 text-[#4a3f42]'
                        }`}
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                ) : share.coachingNote?.redline || share.coachingNote?.question ? (
                  <div className={`border-t pt-4 mt-4 ${isNight ? 'border-[#9b7bb8]/20' : 'border-[#d46a7e]/20'}`}>
                    {share.coachingNote.redline && (
                      <div className="mb-2">
                        <span className={`text-sm ${theme.textMuted}`}>赤入れ: </span>
                        <span className={isNight ? 'text-[#c9a0dc]' : 'text-[#d46a7e]'}>
                          {share.coachingNote.redline}
                        </span>
                      </div>
                    )}
                    {share.coachingNote.question && (
                      <div className="mb-2">
                        <span className={`text-sm ${theme.textMuted}`}>問い: </span>
                        <span className={isNight ? 'text-[#b890cc]' : 'text-[#c25a6e]'}>
                          {share.coachingNote.question}
                        </span>
                      </div>
                    )}
                    <button
                      onClick={() => startEditing(share)}
                      className={`text-sm transition mt-2 ${
                        isNight
                          ? 'text-white/70 hover:text-[#c9a0dc]'
                          : 'text-[#4a3f42]/60 hover:text-[#d46a7e]'
                      }`}
                    >
                      編集する
                    </button>
                  </div>
                ) : (
                  <div className={`border-t pt-4 mt-4 ${isNight ? 'border-[#9b7bb8]/20' : 'border-[#d46a7e]/20'}`}>
                    <button
                      onClick={() => startEditing(share)}
                      className={`text-sm transition ${
                        isNight
                          ? 'text-[#c9a0dc] hover:text-[#b890cc]'
                          : 'text-[#d46a7e] hover:text-[#c25a6e]'
                      }`}
                    >
                      + フィードバックを追加
                    </button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
