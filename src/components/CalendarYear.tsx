'use client'

import { useState, useEffect } from 'react'
import { format, startOfYear, endOfYear } from 'date-fns'
import { MOOD_EMOJI, MOODS, type Mood } from '@/lib/constants'

interface DayData {
  dateKey: string
  mood: Mood
}

interface MonthStats {
  total: number
  moodCounts: Record<Mood, number>
}

export function CalendarYear() {
  const [year, setYear] = useState(new Date().getFullYear())
  const [data, setData] = useState<DayData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const from = format(startOfYear(new Date(year, 0, 1)), 'yyyy-MM-dd')
      const to = format(endOfYear(new Date(year, 0, 1)), 'yyyy-MM-dd')

      try {
        const res = await fetch(`/api/calendar?from=${from}&to=${to}`)
        if (res.ok) {
          const result = await res.json()
          setData(result)
        }
      } catch (error) {
        console.error('Failed to fetch calendar data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [year])

  const months = Array.from({ length: 12 }, (_, i) => i + 1)

  const getMonthStats = (month: number): MonthStats => {
    const monthKey = `${year}-${String(month).padStart(2, '0')}`
    const monthData = data.filter((d) => d.dateKey.startsWith(monthKey))

    const moodCounts = MOODS.reduce(
      (acc, mood) => {
        acc[mood] = monthData.filter((d) => d.mood === mood).length
        return acc
      },
      {} as Record<Mood, number>
    )

    return {
      total: monthData.length,
      moodCounts,
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setYear(year - 1)}
          className="p-2 hover:bg-[#d46a7e]/10 rounded-lg transition text-[#d46a7e]"
        >
          ←
        </button>
        <h3 className="text-lg font-semibold text-[#4a3f42]">{year}年</h3>
        <button
          onClick={() => setYear(year + 1)}
          className="p-2 hover:bg-[#d46a7e]/10 rounded-lg transition text-[#d46a7e]"
        >
          →
        </button>
      </div>

      {loading ? (
        <div className="text-center text-[#4a3f42]/50">読み込み中...</div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {months.map((month) => {
            const stats = getMonthStats(month)
            const daysInMonth = new Date(year, month, 0).getDate()
            const rate = Math.round((stats.total / daysInMonth) * 100)

            return (
              <div
                key={month}
                className="bg-[#f0e8eb] rounded-xl p-4"
              >
                <div className="text-sm font-medium text-[#4a3f42] mb-2">{month}月</div>
                <div className="text-2xl font-bold text-[#d46a7e] mb-1">
                  {rate}%
                </div>
                <div className="text-xs text-[#4a3f42]/50 mb-2">
                  {stats.total}日投稿
                </div>
                <div className="flex flex-wrap gap-1">
                  {MOODS.map((mood) =>
                    stats.moodCounts[mood] > 0 ? (
                      <span key={mood} className="text-xs">
                        {MOOD_EMOJI[mood]}{stats.moodCounts[mood]}
                      </span>
                    ) : null
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
