'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { TopBar } from '@/components/TopBar'
import { Card, CardTitle } from '@/components/Card'
import { GrowthTree } from '@/components/GrowthTree'
import { useTimeTheme, themeColors } from '@/hooks/useTimeTheme'

interface Stats {
  morningPosts: {
    total: number
    thisWeek: number
    thisMonth: number
    streak: number
  }
  nightJournals: {
    thisWeek: number
    thisMonth: number
  }
  scores: {
    weeklyAvg: number | null
    monthlyAvg: number | null
    weeklyTrend: { week: string; avgScore: number | null; count: number }[]
  }
  cheers: {
    given: number
    received: number
  }
}

export default function MyPage() {
  const { data: session, update } = useSession()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const timeTheme = useTimeTheme()
  const theme = themeColors[timeTheme]
  const isNight = timeTheme === 'night'

  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [stats, setStats] = useState<Stats | null>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, statsRes] = await Promise.all([
          fetch('/api/profile'),
          fetch('/api/stats'),
        ])

        if (profileRes.ok) {
          const data = await profileRes.json()
          setProfileImage(data.profileImage || null)
          setName(data.name || '')
        }

        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStats(statsData)
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
      <div className={`min-h-screen transition-colors duration-500 ${theme.bg}`}>
        <TopBar isNight={isNight} />
        <main className="max-w-2xl mx-auto p-4">
          <div className={`text-center ${theme.textFaint}`}>読み込み中...</div>
        </main>
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${theme.bg}`}>
      <TopBar isNight={isNight} />

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="text-center py-4">
          <h1 className={`text-xl font-semibold ${theme.text}`}>マイページ</h1>
        </div>

        {message && (
          <div className={`text-center text-sm p-3 rounded-lg ${
            messageType === 'success'
              ? isNight ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-600'
              : isNight ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-500'
          }`}>
            {message}
          </div>
        )}

        {/* 統計セクション */}
        {stats && (
          <>
            {/* 成長する木 */}
            <Card isNight={isNight}>
              <CardTitle isNight={isNight}>今月の成長</CardTitle>
              {(() => {
                const now = new Date()
                const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
                const progress = Math.round((stats.morningPosts.thisMonth / daysInMonth) * 100)
                return (
                  <GrowthTree
                    progress={progress}
                    postsCount={stats.morningPosts.thisMonth}
                    daysInMonth={daysInMonth}
                    isNight={isNight}
                  />
                )
              })()}
            </Card>

            {/* スコア概要 */}
            <Card isNight={isNight}>
              <CardTitle isNight={isNight}>今の頑張り</CardTitle>
              <div className="grid grid-cols-2 gap-4">
                <div className={`rounded-xl p-4 text-center ${isNight ? 'bg-[#1a1625]' : 'bg-[#f0e8eb]'}`}>
                  <p className={`text-xs mb-1 ${theme.textMuted}`}>今週の点数</p>
                  <p className={`text-3xl font-bold ${theme.accentText}`}>
                    {stats.scores.weeklyAvg !== null ? stats.scores.weeklyAvg.toFixed(1) : '-'}
                    <span className={`text-sm font-normal ${theme.textMuted}`}>/10</span>
                  </p>
                </div>
                <div className={`rounded-xl p-4 text-center ${isNight ? 'bg-[#1a1625]' : 'bg-[#f0e8eb]'}`}>
                  <p className={`text-xs mb-1 ${theme.textMuted}`}>今月の点数</p>
                  <p className={`text-3xl font-bold ${theme.accentText}`}>
                    {stats.scores.monthlyAvg !== null ? stats.scores.monthlyAvg.toFixed(1) : '-'}
                    <span className={`text-sm font-normal ${theme.textMuted}`}>/10</span>
                  </p>
                </div>
              </div>
            </Card>

            {/* 週別推移 */}
            <Card isNight={isNight}>
              <CardTitle isNight={isNight}>週別スコア推移</CardTitle>
              <div className="flex items-end justify-between gap-2 h-32">
                {stats.scores.weeklyTrend.map((week, i) => {
                  const maxHeight = 100
                  const height = week.avgScore !== null ? (week.avgScore / 10) * maxHeight : 0
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <span className={`text-xs ${theme.textMuted}`}>
                        {week.avgScore !== null ? week.avgScore.toFixed(1) : '-'}
                      </span>
                      <div className={`w-full rounded-t-lg relative ${isNight ? 'bg-[#1a1625]' : 'bg-[#f0e8eb]'}`} style={{ height: `${maxHeight}px` }}>
                        <div
                          className={`absolute bottom-0 w-full rounded-t-lg transition-all duration-500 ${
                            i === 3
                              ? isNight ? 'bg-[#9b7bb8]' : 'bg-[#d46a7e]'
                              : isNight ? 'bg-[#9b7bb8]/50' : 'bg-[#d46a7e]/50'
                          }`}
                          style={{ height: `${height}px` }}
                        />
                      </div>
                      <span className={`text-xs ${theme.textMuted}`}>{week.week}</span>
                      <span className={`text-xs ${theme.textFaint}`}>{week.count}日</span>
                    </div>
                  )
                })}
              </div>
            </Card>

            {/* 活動サマリー */}
            <Card isNight={isNight}>
              <CardTitle isNight={isNight}>活動サマリー</CardTitle>
              <div className="space-y-4">
                {/* 投稿数 */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className={`rounded-xl p-3 ${isNight ? 'bg-[#3d2438]' : 'bg-[#fff5f7]'}`}>
                    <p className={`text-2xl font-bold ${isNight ? 'text-[#c9a0dc]' : 'text-[#d46a7e]'}`}>{stats.morningPosts.streak}</p>
                    <p className={`text-xs ${theme.textMuted}`}>連続投稿日</p>
                  </div>
                  <div className={`rounded-xl p-3 ${isNight ? 'bg-[#3d2438]' : 'bg-[#fff5f7]'}`}>
                    <p className={`text-2xl font-bold ${isNight ? 'text-[#c9a0dc]' : 'text-[#d46a7e]'}`}>{stats.morningPosts.thisMonth}</p>
                    <p className={`text-xs ${theme.textMuted}`}>今月の朝投稿</p>
                  </div>
                  <div className={`rounded-xl p-3 ${isNight ? 'bg-[#2d2848]' : 'bg-[#f5f0ff]'}`}>
                    <p className="text-2xl font-bold text-[#9b7bb8]">{stats.nightJournals.thisMonth}</p>
                    <p className={`text-xs ${theme.textMuted}`}>今月の夜投稿</p>
                  </div>
                </div>

                {/* 応援 */}
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className={`rounded-xl p-3 ${isNight ? 'bg-[#3d2838]' : 'bg-pink-50'}`}>
                    <p className={`text-2xl font-bold ${isNight ? 'text-pink-300' : 'text-pink-500'}`}>{stats.cheers.given}</p>
                    <p className={`text-xs ${theme.textMuted}`}>応援した回数</p>
                  </div>
                  <div className={`rounded-xl p-3 ${isNight ? 'bg-[#3d2838]' : 'bg-pink-50'}`}>
                    <p className={`text-2xl font-bold ${isNight ? 'text-pink-300' : 'text-pink-500'}`}>{stats.cheers.received}</p>
                    <p className={`text-xs ${theme.textMuted}`}>応援された回数</p>
                  </div>
                </div>

                {/* 累計 */}
                <div className={`text-center text-sm pt-2 border-t ${theme.textMuted} ${isNight ? 'border-[#9b7bb8]/10' : 'border-[#d46a7e]/10'}`}>
                  累計投稿数: <span className={`font-medium ${theme.text}`}>{stats.morningPosts.total}</span> 回
                </div>
              </div>
            </Card>
          </>
        )}

        {/* 設定を開くボタン */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl transition ${
            isNight
              ? 'bg-[#2d2438] hover:bg-[#3d3448] text-white/70'
              : 'bg-white hover:bg-[#f0e8eb] text-[#4a3f42]/70'
          }`}
        >
          <span>⚙️</span>
          <span>{showSettings ? '設定を閉じる' : 'プロフィール・設定を変更'}</span>
          <span className={`transition-transform ${showSettings ? 'rotate-180' : ''}`}>▼</span>
        </button>

        {/* 設定セクション（折りたたみ） */}
        {showSettings && (
          <>
            <Card isNight={isNight}>
              <CardTitle isNight={isNight}>プロフィール画像</CardTitle>
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="プロフィール画像"
                      className={`w-24 h-24 rounded-full object-cover border-4 ${isNight ? 'border-[#9b7bb8]/20' : 'border-[#d46a7e]/20'}`}
                    />
                  ) : (
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center border-4 ${
                      isNight ? 'bg-[#9b7bb8]/10 border-[#9b7bb8]/20' : 'bg-[#d46a7e]/10 border-[#d46a7e]/20'
                    }`}>
                      <svg className={`w-12 h-12 ${isNight ? 'text-[#9b7bb8]/40' : 'text-[#d46a7e]/40'}`} fill="currentColor" viewBox="0 0 24 24">
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
                    className={`px-4 py-2 rounded-xl transition text-sm ${
                      isNight
                        ? 'bg-[#1a1625] hover:bg-[#9b7bb8]/10 text-white'
                        : 'bg-white hover:bg-[#d46a7e]/10 text-[#4a3f42]'
                    }`}
                  >
                    画像を選択
                  </button>
                  {profileImage && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className={`px-4 py-2 rounded-xl transition text-sm ${
                        isNight
                          ? 'bg-[#1a1625] hover:bg-red-900/30 text-red-400'
                          : 'bg-white hover:bg-red-50 text-red-500'
                      }`}
                    >
                      削除
                    </button>
                  )}
                </div>
                <p className={`text-xs ${theme.textFaint}`}>5MB以下のJPG、PNG、GIF</p>
              </div>
            </Card>

            <Card isNight={isNight}>
              <CardTitle isNight={isNight}>名前</CardTitle>
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

            <Card isNight={isNight}>
              <CardTitle isNight={isNight}>パスワード変更</CardTitle>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm mb-1 ${theme.textMuted}`}>現在のパスワード</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="現在のパスワード"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className={`block text-sm mb-1 ${theme.textMuted}`}>新しいパスワード</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="6文字以上"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className={`block text-sm mb-1 ${theme.textMuted}`}>新しいパスワード（確認）</label>
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

            <Card isNight={isNight}>
              <CardTitle isNight={isNight}>アカウント情報</CardTitle>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className={theme.textMuted}>メールアドレス</span>
                  <span className={theme.text}>{session?.user?.email}</span>
                </div>
                <p className={`text-xs ${theme.textFaint}`}>※ メールアドレスは変更できません</p>
              </div>
            </Card>

            <Card isNight={isNight}>
              <CardTitle isNight={isNight}>その他の設定</CardTitle>
              <Link
                href="/settings"
                className={`inline-flex items-center gap-2 transition ${
                  isNight
                    ? 'text-white/70 hover:text-[#c9a0dc]'
                    : 'text-[#4a3f42]/70 hover:text-[#d46a7e]'
                }`}
              >
                <span>Google Calendar連携などの設定 →</span>
              </Link>
            </Card>
          </>
        )}

        {(session?.user?.role === 'coach' || session?.user?.role === 'superadmin') && (
          <Card isNight={isNight}>
            <CardTitle isNight={isNight}>管理メニュー</CardTitle>
            <div className="space-y-3">
              <Link
                href="/coach"
                className={`flex items-center gap-3 p-3 rounded-xl transition ${
                  isNight
                    ? 'bg-[#1a1625] hover:bg-[#9b7bb8]/10'
                    : 'bg-[#f0e8eb] hover:bg-[#d46a7e]/10'
                }`}
              >
                <span className="text-xl">📝</span>
                <div>
                  <p className={`font-medium ${theme.text}`}>コーチページ</p>
                  <p className={`text-xs ${theme.textMuted}`}>メンバーへのフィードバック</p>
                </div>
              </Link>
              {session?.user?.role === 'superadmin' && (
                <Link
                  href="/admin"
                  className={`flex items-center gap-3 p-3 rounded-xl transition ${
                    isNight
                      ? 'bg-[#1a1625] hover:bg-[#9b7bb8]/10'
                      : 'bg-[#f0e8eb] hover:bg-[#d46a7e]/10'
                  }`}
                >
                  <span className="text-xl">⚙️</span>
                  <div>
                    <p className={`font-medium ${theme.text}`}>管理者ページ</p>
                    <p className={`text-xs ${theme.textMuted}`}>ユーザー管理・統計</p>
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
