'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { TopBar } from '@/components/TopBar'
import { Card, CardTitle } from '@/components/Card'

export default function MyPage() {
  const { data: session, update } = useSession()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile')
        if (res.ok) {
          const data = await res.json()
          setProfileImage(data.profileImage || null)
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 5MB制限
    if (file.size > 5 * 1024 * 1024) {
      setMessage('画像は5MB以下にしてください')
      setMessageType('error')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setProfileImage(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setProfileImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    setMessage('')

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, profileImage: profileImage || '' }),
      })

      const data = await res.json()
      if (res.ok) {
        setMessage('プロフィールを保存しました')
        setMessageType('success')
        if (name !== session?.user?.name) {
          await update({ name })
        }
      } else {
        setMessage(data.error || '保存に失敗しました')
        setMessageType('error')
      }
    } catch {
      setMessage('エラーが発生しました')
      setMessageType('error')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage('新しいパスワードが一致しません')
      setMessageType('error')
      return
    }

    if (newPassword.length < 6) {
      setMessage('パスワードは6文字以上にしてください')
      setMessageType('error')
      return
    }

    setSaving(true)
    setMessage('')

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const data = await res.json()
      if (res.ok) {
        setMessage('パスワードを変更しました')
        setMessageType('success')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setMessage(data.error || 'パスワード変更に失敗しました')
        setMessageType('error')
      }
    } catch {
      setMessage('エラーが発生しました')
      setMessageType('error')
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
          <h1 className="text-xl font-semibold text-[#4a3f42]">マイページ</h1>
        </div>

        {message && (
          <div className={`text-center text-sm p-3 rounded-lg ${
            messageType === 'success'
              ? 'bg-green-50 text-green-600'
              : 'bg-red-50 text-red-500'
          }`}>
            {message}
          </div>
        )}

        <Card>
          <CardTitle>プロフィール画像</CardTitle>
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="プロフィール画像"
                  className="w-24 h-24 rounded-full object-cover border-4 border-[#d46a7e]/20"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-[#d46a7e]/10 flex items-center justify-center border-4 border-[#d46a7e]/20">
                  <svg className="w-12 h-12 text-[#d46a7e]/40" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-white hover:bg-[#d46a7e]/10 text-[#4a3f42] rounded-xl transition text-sm"
              >
                画像を選択
              </button>
              {profileImage && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="px-4 py-2 bg-white hover:bg-red-50 text-red-500 rounded-xl transition text-sm"
                >
                  削除
                </button>
              )}
            </div>
            <p className="text-xs text-[#4a3f42]/50">5MB以下のJPG、PNG、GIF</p>
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

        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="w-full btn-primary"
        >
          {saving ? '保存中...' : 'プロフィールを保存'}
        </button>

        <Card>
          <CardTitle>パスワード変更</CardTitle>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#4a3f42]/60 mb-1">現在のパスワード</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="現在のパスワード"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-[#4a3f42]/60 mb-1">新しいパスワード</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="6文字以上"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-[#4a3f42]/60 mb-1">新しいパスワード（確認）</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="もう一度入力"
                className="w-full"
              />
            </div>
            <button
              type="button"
              onClick={handleChangePassword}
              disabled={saving || !currentPassword || !newPassword || !confirmPassword}
              className="w-full btn-secondary"
            >
              パスワードを変更
            </button>
          </div>
        </Card>

        <Card>
          <CardTitle>アカウント情報</CardTitle>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#4a3f42]/60">メールアドレス</span>
              <span className="text-[#4a3f42]">{session?.user?.email}</span>
            </div>
            <p className="text-xs text-[#4a3f42]/40">※ メールアドレスは変更できません</p>
          </div>
        </Card>

        <Card>
          <CardTitle>その他の設定</CardTitle>
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 text-[#4a3f42]/70 hover:text-[#d46a7e] transition"
          >
            <span>Google Calendar連携などの設定 →</span>
          </Link>
        </Card>

        {(session?.user?.role === 'coach' || session?.user?.role === 'superadmin') && (
          <Card>
            <CardTitle>管理メニュー</CardTitle>
            <div className="space-y-3">
              <Link
                href="/coach"
                className="flex items-center gap-3 p-3 bg-[#f0e8eb] hover:bg-[#d46a7e]/10 rounded-xl transition"
              >
                <span className="text-xl">📝</span>
                <div>
                  <p className="font-medium text-[#4a3f42]">コーチページ</p>
                  <p className="text-xs text-[#4a3f42]/60">メンバーへのフィードバック</p>
                </div>
              </Link>
              {session?.user?.role === 'superadmin' && (
                <Link
                  href="/admin"
                  className="flex items-center gap-3 p-3 bg-[#f0e8eb] hover:bg-[#d46a7e]/10 rounded-xl transition"
                >
                  <span className="text-xl">⚙️</span>
                  <div>
                    <p className="font-medium text-[#4a3f42]">管理者ページ</p>
                    <p className="text-xs text-[#4a3f42]/60">ユーザー管理・統計</p>
                  </div>
                </Link>
              )}
            </div>
          </Card>
        )}
      </main>
    </div>
  )
}
