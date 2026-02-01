'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/TopBar'
import { Card, CardTitle } from '@/components/Card'
import { MOOD_EMOJI, type Mood } from '@/lib/constants'
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
    <div className="min-h-screen bg-[#f0e8eb]">
      <TopBar />

      <main className="max-w-3xl mx-auto p-4 space-y-6">
        <div className="text-center py-4">
          <p className="text-[#d46a7e] text-sm font-medium">Coach Dashboard</p>
          <h1 className="text-xl font-semibold mt-1 text-[#4a3f42]">{today}</h1>
          {successMessage && (
            <p className="text-sm mt-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg inline-block">
              {successMessage}
            </p>
          )}
        </div>

        {loading ? (
          <Card>
            <div className="text-center text-[#4a3f42]/50">読み込み中...</div>
          </Card>
        ) : shares.length === 0 ? (
          <Card>
            <div className="text-center text-[#4a3f42]/50">
              今日の投稿はまだありません
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {shares.map((share) => (
              <Card key={share.id}>
                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{MOOD_EMOJI[share.mood]}</span>
                    <div>
                      <span className="font-medium text-[#4a3f42]">{share.userName}</span>
                      <span className="text-sm text-[#4a3f42]/50 ml-2">
                        {share.userEmail}
                      </span>
                    </div>
                  </div>

                  {(share.value || share.action || share.letGo) && (
                    <div className="bg-[#f0e8eb] rounded-lg p-3 mb-3 space-y-2 text-sm">
                      {share.value && (
                        <div>
                          <span className="text-[#4a3f42]/50">価値観: </span>
                          <span className="text-[#4a3f42]">{share.value}</span>
                        </div>
                      )}
                      {share.action && (
                        <div>
                          <span className="text-[#4a3f42]/50">行動: </span>
                          <span className="text-[#4a3f42]">{share.action}</span>
                        </div>
                      )}
                      {share.letGo && (
                        <div>
                          <span className="text-[#4a3f42]/50">手放す: </span>
                          <span className="text-[#4a3f42]">{share.letGo}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="border-l-4 border-[#d46a7e] pl-3">
                    <p className="text-xs text-[#4a3f42]/50 mb-1">宣言</p>
                    <p className="text-lg text-[#4a3f42] font-medium">{share.declaration}</p>
                  </div>
                </div>

                {editingNote?.userId === share.userId ? (
                  <div className="border-t border-[#d46a7e]/20 pt-4 mt-4 space-y-4">
                    <div>
                      <label className="block text-sm text-[#4a3f42]/70 mb-1">
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
                      <label className="block text-sm text-[#4a3f42]/70 mb-1">
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
                        className="px-4 py-2 bg-[#f0e8eb] hover:bg-[#d46a7e]/10 rounded-xl transition text-[#4a3f42]"
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                ) : share.coachingNote?.redline || share.coachingNote?.question ? (
                  <div className="border-t border-[#d46a7e]/20 pt-4 mt-4">
                    {share.coachingNote.redline && (
                      <div className="mb-2">
                        <span className="text-sm text-[#4a3f42]/60">赤入れ: </span>
                        <span className="text-[#d46a7e]">
                          {share.coachingNote.redline}
                        </span>
                      </div>
                    )}
                    {share.coachingNote.question && (
                      <div className="mb-2">
                        <span className="text-sm text-[#4a3f42]/60">問い: </span>
                        <span className="text-[#c25a6e]">
                          {share.coachingNote.question}
                        </span>
                      </div>
                    )}
                    <button
                      onClick={() => startEditing(share)}
                      className="text-sm text-[#4a3f42]/60 hover:text-[#d46a7e] transition mt-2"
                    >
                      編集する
                    </button>
                  </div>
                ) : (
                  <div className="border-t border-[#d46a7e]/20 pt-4 mt-4">
                    <button
                      onClick={() => startEditing(share)}
                      className="text-sm text-[#d46a7e] hover:text-[#c25a6e] transition"
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
