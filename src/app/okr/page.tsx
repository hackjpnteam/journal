'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/TopBar'
import { Card, CardTitle } from '@/components/Card'
import { format, addWeeks, subWeeks, addMonths, subMonths, startOfWeek, getISOWeek, getYear } from 'date-fns'
import { ja } from 'date-fns/locale'

type OKRType = 'weekly' | 'monthly'

interface OKRData {
  objective: string
  keyResults: string[]
  focus?: string
  identityFocus?: string
  isShared?: boolean
}

export default function OKRPage() {
  const [viewType, setViewType] = useState<OKRType>('weekly')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const [objective, setObjective] = useState('')
  const [kr1, setKr1] = useState('')
  const [kr2, setKr2] = useState('')
  const [kr3, setKr3] = useState('')
  const [focus, setFocus] = useState('')
  const [identityFocus, setIdentityFocus] = useState('')
  const [isShared, setIsShared] = useState(false)

  const getPeriodKey = () => {
    if (viewType === 'monthly') {
      return format(currentDate, 'yyyy-MM')
    } else {
      const year = getYear(startOfWeek(currentDate, { weekStartsOn: 1 }))
      const week = getISOWeek(currentDate)
      return `${year}-W${String(week).padStart(2, '0')}`
    }
  }

  const getPeriodLabel = () => {
    if (viewType === 'monthly') {
      return format(currentDate, 'yyyy年M月', { locale: ja })
    } else {
      const week = getISOWeek(currentDate)
      return `${format(currentDate, 'yyyy年', { locale: ja })} 第${week}週`
    }
  }

  const goToPrev = () => {
    if (viewType === 'monthly') {
      setCurrentDate(subMonths(currentDate, 1))
    } else {
      setCurrentDate(subWeeks(currentDate, 1))
    }
  }

  const goToNext = () => {
    if (viewType === 'monthly') {
      setCurrentDate(addMonths(currentDate, 1))
    } else {
      setCurrentDate(addWeeks(currentDate, 1))
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError('')

      try {
        const periodKey = getPeriodKey()
        const res = await fetch(`/api/okr?type=${viewType}&periodKey=${periodKey}`)

        if (res.ok) {
          const data: OKRData | null = await res.json()
          if (data) {
            setObjective(data.objective || '')
            setKr1(data.keyResults?.[0] || '')
            setKr2(data.keyResults?.[1] || '')
            setKr3(data.keyResults?.[2] || '')
            setFocus(data.focus || '')
            setIdentityFocus(data.identityFocus || '')
            setIsShared(data.isShared || false)
          } else {
            setObjective('')
            setKr1('')
            setKr2('')
            setKr3('')
            setFocus('')
            setIdentityFocus('')
            setIsShared(false)
          }
        }
      } catch (error) {
        console.error('Failed to fetch OKR:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [viewType, currentDate])

  const handleSave = async () => {
    if (!objective.trim()) {
      setError('目標を入力してください')
      return
    }

    setSaving(true)
    setError('')

    try {
      const res = await fetch('/api/okr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: viewType,
          periodKey: getPeriodKey(),
          objective,
          keyResults: [kr1, kr2, kr3],
          focus: viewType === 'weekly' ? focus : undefined,
          identityFocus: viewType === 'monthly' ? identityFocus : undefined,
          isShared,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || '保存に失敗しました')
      } else {
        setSuccessMessage('保存しました')
        setTimeout(() => setSuccessMessage(''), 3000)
      }
    } catch {
      setError('エラーが発生しました')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f0e8eb]">
      <TopBar />

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="text-center py-4">
          <h1 className="text-xl font-semibold text-[#4a3f42]">OKR</h1>
        </div>

        <div className="flex justify-center">
          <div className="inline-flex bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setViewType('weekly')}
              className={`px-4 py-2 rounded-lg text-sm transition ${
                viewType === 'weekly'
                  ? 'bg-[#d46a7e] text-white'
                  : 'text-[#4a3f42]/60 hover:text-[#4a3f42]'
              }`}
            >
              週間
            </button>
            <button
              onClick={() => setViewType('monthly')}
              className={`px-4 py-2 rounded-lg text-sm transition ${
                viewType === 'monthly'
                  ? 'bg-[#d46a7e] text-white'
                  : 'text-[#4a3f42]/60 hover:text-[#4a3f42]'
              }`}
            >
              月間
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={goToPrev}
            className="p-2 hover:bg-[#d46a7e]/10 rounded-lg transition text-[#d46a7e]"
          >
            ←
          </button>
          <span className="text-lg font-medium text-[#4a3f42]">{getPeriodLabel()}</span>
          <button
            onClick={goToNext}
            className="p-2 hover:bg-[#d46a7e]/10 rounded-lg transition text-[#d46a7e]"
          >
            →
          </button>
        </div>

        {loading ? (
          <Card>
            <div className="text-center text-[#4a3f42]/50">読み込み中...</div>
          </Card>
        ) : (
          <Card>
            <CardTitle>
              {viewType === 'weekly' ? '今週の目標' : '今月の目標'}
            </CardTitle>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#4a3f42]/70 mb-1">目標</label>
                <input
                  type="text"
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder="達成したいこと"
                />
              </div>

              <div>
                <label className="block text-sm text-[#4a3f42]/70 mb-1">
                  Key Results（最大3つ）
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={kr1}
                    onChange={(e) => setKr1(e.target.value)}
                    placeholder="KR 1"
                  />
                  <input
                    type="text"
                    value={kr2}
                    onChange={(e) => setKr2(e.target.value)}
                    placeholder="KR 2"
                  />
                  <input
                    type="text"
                    value={kr3}
                    onChange={(e) => setKr3(e.target.value)}
                    placeholder="KR 3"
                  />
                </div>
              </div>

              {viewType === 'weekly' ? (
                <div>
                  <label className="block text-sm text-[#4a3f42]/70 mb-1">
                    フォーカス
                  </label>
                  <input
                    type="text"
                    value={focus}
                    onChange={(e) => setFocus(e.target.value)}
                    placeholder="今週特に意識すること"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm text-[#4a3f42]/70 mb-1">
                    Identity Focus
                  </label>
                  <input
                    type="text"
                    value={identityFocus}
                    onChange={(e) => setIdentityFocus(e.target.value)}
                    placeholder="なりたい自分像"
                  />
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isShared"
                  checked={isShared}
                  onChange={(e) => setIsShared(e.target.checked)}
                  className="w-4 h-4 text-[#d46a7e] border-[#d46a7e]/30 rounded focus:ring-[#d46a7e]"
                />
                <label htmlFor="isShared" className="text-sm text-[#4a3f42]">
                  みんなに公開する
                </label>
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}

              {successMessage && (
                <div className="text-green-600 text-sm text-center bg-green-50 px-4 py-2 rounded-lg">
                  {successMessage}
                </div>
              )}

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="w-full btn-primary"
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </Card>
        )}
      </main>
    </div>
  )
}
