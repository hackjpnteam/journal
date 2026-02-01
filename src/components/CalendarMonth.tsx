'use client'

import { useState, useEffect } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  addMonths,
  subMonths,
  getDay,
} from 'date-fns'
import { ja } from 'date-fns/locale'
import { MOOD_EMOJI, type Mood } from '@/lib/constants'

interface DayData {
  dateKey: string
  mood: Mood
  declaration: string
}

interface CalendarMonthProps {
  onMonthChange?: (yearMonth: string) => void
}

export function CalendarMonth({ onMonthChange }: CalendarMonthProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [data, setData] = useState<DayData[]>([])
  const [loading, setLoading] = useState(true)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const startDayOfWeek = getDay(monthStart)
  const emptyDays = Array(startDayOfWeek).fill(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const from = format(monthStart, 'yyyy-MM-dd')
      const to = format(monthEnd, 'yyyy-MM-dd')

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
    onMonthChange?.(format(currentDate, 'yyyy-MM'))
  }, [currentDate])

  const dataMap = new Map(data.map((d) => [d.dateKey, d]))

  const goToPrevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1))

  const weekDays = ['日', '月', '火', '水', '木', '金', '土']

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPrevMonth}
          className="p-2 hover:bg-[#d46a7e]/10 rounded-lg transition text-[#d46a7e]"
        >
          ←
        </button>
        <h3 className="text-lg font-semibold text-[#4a3f42]">
          {format(currentDate, 'yyyy年 M月', { locale: ja })}
        </h3>
        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-[#d46a7e]/10 rounded-lg transition text-[#d46a7e]"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs text-[#4a3f42]/50 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {emptyDays.map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {days.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd')
          const dayData = dataMap.get(dateKey)

          return (
            <div
              key={dateKey}
              className={`
                aspect-square p-1 rounded-lg text-center
                ${isSameMonth(day, currentDate) ? 'bg-[#f0e8eb]' : 'bg-[#f0e8eb]/50'}
                ${dayData ? 'ring-1 ring-[#d46a7e]/30' : ''}
              `}
            >
              <div className="text-xs text-[#4a3f42]/60">{format(day, 'd')}</div>
              {dayData && (
                <div className="text-lg">{MOOD_EMOJI[dayData.mood]}</div>
              )}
              {dayData && (
                <div className="w-1.5 h-1.5 bg-[#d46a7e] rounded-full mx-auto mt-0.5" />
              )}
            </div>
          )
        })}
      </div>

      {loading && (
        <div className="text-center text-[#4a3f42]/50 text-sm mt-4">読み込み中...</div>
      )}
    </div>
  )
}
