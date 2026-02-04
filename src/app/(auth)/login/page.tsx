'use client'

import { useState, useEffect, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useTimeTheme, themeColors } from '@/hooks/useTimeTheme'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const timeTheme = useTimeTheme()
  const theme = themeColors[timeTheme]
  const isNight = timeTheme === 'night'

  const [isRegister, setIsRegister] = useState(false)

  // URLパラメータで mode=register の場合は新規登録モードで開く
  useEffect(() => {
    if (searchParams.get('mode') === 'register') {
      setIsRegister(true)
    }
  }, [searchParams])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isRegister) {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        })

        const data = await res.json()
        if (!res.ok) {
          setError(data.error || '登録に失敗しました')
          setLoading(false)
          return
        }
      }

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
        setLoading(false)
        return
      }

      router.push('/')
      router.refresh()
    } catch {
      setError('エラーが発生しました')
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-500 ${theme.bg}`}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${theme.accentText}`}>
            {isNight ? '🌙' : '☀️'} 究極の朝活
          </h1>
          <p className={theme.textMuted}>毎朝7時の宣言で1日を始める</p>
        </div>

        <div className={`rounded-2xl p-8 shadow-sm transition-colors duration-500 ${
          isNight ? 'bg-[#2d2438] border border-[#9b7bb8]/20' : 'bg-white'
        }`}>
          <div className="flex mb-6">
            <button
              type="button"
              onClick={() => setIsRegister(false)}
              className={`flex-1 py-2 text-center rounded-lg transition ${
                !isRegister
                  ? `${theme.accent} text-white`
                  : theme.textMuted
              }`}
            >
              ログイン
            </button>
            <button
              type="button"
              onClick={() => setIsRegister(true)}
              className={`flex-1 py-2 text-center rounded-lg transition ${
                isRegister
                  ? `${theme.accent} text-white`
                  : theme.textMuted
              }`}
            >
              新規登録
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className={`block text-sm mb-1 ${theme.textMuted}`}>名前</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="山田 太郎"
                  required={isRegister}
                  className={isNight ? 'bg-[#1a1625] border-[#9b7bb8]/30 text-white placeholder:text-white/50' : ''}
                />
              </div>
            )}

            <div>
              <label className={`block text-sm mb-1 ${theme.textMuted}`}>メールアドレス</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className={isNight ? 'bg-[#1a1625] border-[#9b7bb8]/30 text-white placeholder:text-white/50' : ''}
              />
            </div>

            <div>
              <label className={`block text-sm mb-1 ${theme.textMuted}`}>パスワード</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6文字以上"
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
              {loading ? '処理中...' : isRegister ? '登録する' : 'ログイン'}
            </button>

            {!isRegister && (
              <div className="text-center mt-4">
                <Link
                  href="/forgot-password"
                  className={`text-sm ${theme.textMuted} hover:underline`}
                >
                  パスワードをお忘れですか？
                </Link>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#f0e8eb]">
        <div className="text-[#4a3f42]/50">読み込み中...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
