'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useTimeTheme, themeColors } from '@/hooks/useTimeTheme'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const timeTheme = useTimeTheme()
  const theme = themeColors[timeTheme]
  const isNight = timeTheme === 'night'

  const token = searchParams.get('token') || ''
  const email = searchParams.get('email') || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(true)
  const [isValid, setIsValid] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const validateToken = async () => {
      if (!token || !email) {
        setValidating(false)
        setIsValid(false)
        return
      }

      try {
        const res = await fetch(
          `/api/auth/validate-reset-token?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`
        )
        const data = await res.json()
        setIsValid(data.valid)
      } catch {
        setIsValid(false)
      } finally {
        setValidating(false)
      }
    }

    validateToken()
  }, [token, email])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('パスワードが一致しません')
      return
    }

    if (password.length < 6) {
      setError('パスワードは6文字以上必要です')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'エラーが発生しました')
      } else {
        setSuccess(true)
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      }
    } catch {
      setError('エラーが発生しました。しばらくしてからお試しください。')
    } finally {
      setLoading(false)
    }
  }

  if (validating) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${theme.bg}`}>
        <div className={theme.textMuted}>確認中...</div>
      </div>
    )
  }

  if (!isValid) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-500 ${theme.bg}`}>
        <div className="w-full max-w-md text-center">
          <div className={`rounded-2xl p-8 shadow-sm ${
            isNight ? 'bg-[#2d2438] border border-[#9b7bb8]/20' : 'bg-white'
          }`}>
            <div className="text-red-500 mb-4">
              リセットリンクが無効か、有効期限が切れています。
            </div>
            <Link
              href="/forgot-password"
              className={`inline-block ${theme.accentText} hover:underline`}
            >
              新しいリセットリンクを取得
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-500 ${theme.bg}`}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${theme.accentText}`}>
            {isNight ? '🌙' : '☀️'} 新しいパスワードを設定
          </h1>
          <p className={theme.textMuted}>
            新しいパスワードを入力してください
          </p>
        </div>

        <div className={`rounded-2xl p-8 shadow-sm transition-colors duration-500 ${
          isNight ? 'bg-[#2d2438] border border-[#9b7bb8]/20' : 'bg-white'
        }`}>
          {success ? (
            <div className="text-center">
              <div className={`text-green-600 mb-4 p-4 rounded-lg ${
                isNight ? 'bg-green-900/20' : 'bg-green-50'
              }`}>
                パスワードが正常にリセットされました。<br />
                ログインページに移動します...
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm mb-1 ${theme.textMuted}`}>
                  新しいパスワード
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="6文字以上"
                  required
                  className={isNight ? 'bg-[#1a1625] border-[#9b7bb8]/30 text-white placeholder:text-white/50' : ''}
                />
              </div>

              <div>
                <label className={`block text-sm mb-1 ${theme.textMuted}`}>
                  パスワード（確認）
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="もう一度入力"
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
                {loading ? '処理中...' : 'パスワードを変更'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  const timeTheme = useTimeTheme()
  const theme = themeColors[timeTheme]

  return (
    <Suspense fallback={
      <div className={`min-h-screen flex items-center justify-center ${theme.bg}`}>
        <div className={theme.textMuted}>読み込み中...</div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
