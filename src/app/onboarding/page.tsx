'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardTitle } from '@/components/Card'

export default function OnboardingPage() {
  const router = useRouter()
  const { update } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [weeklyObjective, setWeeklyObjective] = useState('')
  const [weeklyKR1, setWeeklyKR1] = useState('')
  const [weeklyKR2, setWeeklyKR2] = useState('')
  const [weeklyKR3, setWeeklyKR3] = useState('')
  const [weeklyFocus, setWeeklyFocus] = useState('')

  const [monthlyObjective, setMonthlyObjective] = useState('')
  const [monthlyKR1, setMonthlyKR1] = useState('')
  const [monthlyKR2, setMonthlyKR2] = useState('')
  const [monthlyKR3, setMonthlyKR3] = useState('')
  const [identityFocus, setIdentityFocus] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weekly: {
            objective: weeklyObjective,
            keyResults: [weeklyKR1, weeklyKR2, weeklyKR3],
            focus: weeklyFocus,
          },
          monthly: {
            objective: monthlyObjective,
            keyResults: [monthlyKR1, monthlyKR2, monthlyKR3],
            identityFocus: identityFocus,
          },
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || '保存に失敗しました')
        setLoading(false)
        return
      }

      await update({ onboardingCompleted: true })
      router.push('/')
      router.refresh()
    } catch {
      setError('エラーが発生しました')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-4 py-8 bg-[#f0e8eb]">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#d46a7e] mb-2">はじめに</h1>
          <p className="text-[#4a3f42]/70">今週と今月の目標を設定しましょう</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardTitle>今週の目標（Weekly Objective）</CardTitle>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#4a3f42]/70 mb-1">目標</label>
                <input
                  type="text"
                  value={weeklyObjective}
                  onChange={(e) => setWeeklyObjective(e.target.value)}
                  placeholder="今週達成したいこと"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-[#4a3f42]/70 mb-1">
                  Key Results（最大3つ）
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={weeklyKR1}
                    onChange={(e) => setWeeklyKR1(e.target.value)}
                    placeholder="KR 1"
                  />
                  <input
                    type="text"
                    value={weeklyKR2}
                    onChange={(e) => setWeeklyKR2(e.target.value)}
                    placeholder="KR 2"
                  />
                  <input
                    type="text"
                    value={weeklyKR3}
                    onChange={(e) => setWeeklyKR3(e.target.value)}
                    placeholder="KR 3"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-[#4a3f42]/70 mb-1">
                  フォーカス（今週特に意識すること）
                </label>
                <input
                  type="text"
                  value={weeklyFocus}
                  onChange={(e) => setWeeklyFocus(e.target.value)}
                  placeholder="例: 早起きを習慣にする"
                />
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle>今月の目標（Monthly Objective）</CardTitle>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#4a3f42]/70 mb-1">目標</label>
                <input
                  type="text"
                  value={monthlyObjective}
                  onChange={(e) => setMonthlyObjective(e.target.value)}
                  placeholder="今月達成したいこと"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-[#4a3f42]/70 mb-1">
                  Key Results（最大3つ）
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={monthlyKR1}
                    onChange={(e) => setMonthlyKR1(e.target.value)}
                    placeholder="KR 1"
                  />
                  <input
                    type="text"
                    value={monthlyKR2}
                    onChange={(e) => setMonthlyKR2(e.target.value)}
                    placeholder="KR 2"
                  />
                  <input
                    type="text"
                    value={monthlyKR3}
                    onChange={(e) => setMonthlyKR3(e.target.value)}
                    placeholder="KR 3"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-[#4a3f42]/70 mb-1">
                  Identity Focus（なりたい自分像）
                </label>
                <input
                  type="text"
                  value={identityFocus}
                  onChange={(e) => setIdentityFocus(e.target.value)}
                  placeholder="例: 毎日成長を実感できる人"
                />
              </div>
            </div>
          </Card>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <button type="submit" disabled={loading} className="w-full">
            {loading ? '保存中...' : '目標を設定して始める'}
          </button>
        </form>
      </div>
    </div>
  )
}
