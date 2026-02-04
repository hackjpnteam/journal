'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTimeTheme, themeColors } from '@/hooks/useTimeTheme'

export default function ForgotPasswordPage() {
  const timeTheme = useTimeTheme()
  const theme = themeColors[timeTheme]
  const isNight = timeTheme === 'night'

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'エラーが発生しました')
      } else {
        setMessage(data.message)
        setEmail('')
      }
    } catch {
      setError('エラーが発生しました。しばらくしてからお試しください。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-500 ${theme.bg}`}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${theme.accentText}`}>
            {isNight ? '🌙' : '☀️'} パスワードをお忘れですか？
          </h1>
          <p className={theme.textMuted}>
            登録したメールアドレスを入力してください
          </p>
        </div>

        <div className={`rounded-2xl p-8 shadow-sm transition-colors duration-500 ${
          isNight ? 'bg-[#2d2438] border border-[#9b7bb8]/20' : 'bg-white'
        }`}>
          {message ? (
            <div className="text-center">
              <div className={`text-green-600 mb-4 p-4 rounded-lg ${
                isNight ? 'bg-green-900/20' : 'bg-green-50'
              }`}>
                {message}
              </div>
              <Link
                href="/login"
                className={`inline-block ${theme.accentText} hover:underline`}
              >
                ログインページに戻る
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm mb-1 ${theme.textMuted}`}>
                  メールアドレス
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className={isNight ? 'bg-[#1a1625] border-[#9b7bb8]/30 text-white placeholder:text-white/50' : ''}
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-xl font-semibold text-white transition ${
                  isNight
                    ? 'bg-[#9b7bb8] hover:bg-[#8a6aa7]'
                    : 'bg-[#d46a7e] hover:bg-[#c25a6e]'
                } disabled:opacity-50`}
              >
                {loading ? '送信中...' : 'リセットメールを送信'}
              </button>

              <div className="text-center mt-4">
                <Link
                  href="/login"
                  className={`text-sm ${theme.textMuted} hover:underline`}
                >
                  ログインページに戻る
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
