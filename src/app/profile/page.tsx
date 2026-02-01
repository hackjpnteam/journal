'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { TopBar } from '@/components/TopBar'
import { Card, CardTitle } from '@/components/Card'

const AVATAR_OPTIONS = [
  '👤', '😊', '😎', '🤓', '🧑‍💻', '👨‍💼', '👩‍💼', '🦊', '🐱', '🐶',
  '🐻', '🐼', '🦁', '🐯', '🐨', '🐸', '🦄', '🐲', '🌸', '🌻',
  '🌺', '🍀', '⭐', '🌙', '☀️', '🔥', '💎', '🎯', '🚀', '💪',
]

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const [avatar, setAvatar] = useState('👤')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile')
        if (res.ok) {
          const data = await res.json()
          setAvatar(data.avatar || '👤')
          setName(data.name || '')
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user) {
      fetchProfile()
    }
  }, [session])

  const handleSave = async () => {
    setSaving(true)
    setMessage('')

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar, name }),
      })

      if (res.ok) {
        setMessage('保存しました')
        // Update session with new name if changed
        if (name !== session?.user?.name) {
          await update({ name })
        }
      } else {
        const data = await res.json()
        setMessage(data.error || '保存に失敗しました')
      }
    } catch {
      setMessage('エラーが発生しました')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0e8eb]">
        <TopBar />
        <main className="max-w-2xl mx-auto p-4">
          <div className="text-center text-[#4a3f42]/50">読み込み中...</div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f0e8eb]">
      <TopBar />

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="text-center py-4">
          <h1 className="text-xl font-semibold text-[#4a3f42]">プロフィール設定</h1>
        </div>

        <Card>
          <CardTitle>アイコン</CardTitle>
          <div className="text-center mb-4">
            <span className="text-6xl">{avatar}</span>
          </div>
          <div className="grid grid-cols-6 gap-2">
            {AVATAR_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setAvatar(emoji)}
                className={`text-2xl p-2 rounded-lg transition ${
                  avatar === emoji
                    ? 'bg-[#d46a7e] scale-110'
                    : 'bg-white hover:bg-[#d46a7e]/10'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <CardTitle>名前</CardTitle>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="表示名"
            className="w-full"
          />
        </Card>

        <Card>
          <CardTitle>メールアドレス</CardTitle>
          <p className="text-[#4a3f42]/60">{session?.user?.email}</p>
          <p className="text-xs text-[#4a3f42]/40 mt-1">※ メールアドレスは変更できません</p>
        </Card>

        {message && (
          <div className={`text-center text-sm ${message.includes('失敗') || message.includes('エラー') ? 'text-red-500' : 'text-green-600'}`}>
            {message}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full"
        >
          {saving ? '保存中...' : '保存する'}
        </button>
      </main>
    </div>
  )
}
