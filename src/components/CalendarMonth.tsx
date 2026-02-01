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
  isToday,
} from 'date-fns'
import { ja } from 'date-fns/locale'
import { MOOD_EMOJI, type Mood } from '@/lib/constants'

interface DayData {
  dateKey: string
  morning?: {
    mood: Mood
    declaration: string
    value?: string
    action?: string
    letGo?: string
  }
  night?: {
    proudChoice?: string
    learning?: string
    tomorrowMessage?: string
    selfScore?: number
  }
}

interface CalendarMonthProps {
  onMonthChange?: (yearMonth: string) => void
}

export function CalendarMonth({ onMonthChange }: CalendarMonthProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [data, setData] = useState<DayData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null)

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
          const hasMorning = !!dayData?.morning
          const hasNight = !!dayData?.night

          return (
            <div
              key={dateKey}
              onClick={() => dayData && setSelectedDay(dayData)}
              className={`
                aspect-square p-1 rounded-lg text-center cursor-pointer transition
                ${isSameMonth(day, currentDate) ? 'bg-[#f0e8eb]' : 'bg-[#f0e8eb]/50'}
                ${isToday(day) ? 'ring-2 ring-[#d46a7e]' : ''}
                ${dayData ? 'hover:bg-[#d46a7e]/10' : ''}
              `}
            >
              <div className="text-xs text-[#4a3f42]/60">{format(day, 'd')}</div>
              {hasMorning && (
                <div className="text-base leading-none">{MOOD_EMOJI[dayData.morning!.mood]}</div>
              )}
              <div className="flex justify-center gap-0.5 mt-0.5">
                {hasMorning && (
                  <div className="w-1.5 h-1.5 bg-[#d46a7e] rounded-full" title="朝" />
                )}
                {hasNight && (
                  <div className="w-1.5 h-1.5 bg-[#4a3f42] rounded-full" title="夜" />
                )}
              </div>
            </div>
          )
        })}
      </div>

      {loading && (
        <div className="text-center text-[#4a3f42]/50 text-sm mt-4">読み込み中...</div>
      )}

      {/* 選択した日の詳細 */}
      {selectedDay && (
        <div className="mt-6 p-4 bg-white rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-[#4a3f42]">
              {format(new Date(selectedDay.dateKey), 'M月d日（E）', { locale: ja })}
            </h4>
            <button
              onClick={() => setSelectedDay(null)}
              className="text-[#4a3f42]/50 hover:text-[#4a3f42]"
            >
              ✕
            </button>
          </div>

          {selectedDay.morning && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{MOOD_EMOJI[selectedDay.morning.mood]}</span>
                <span className="text-sm font-medium text-[#d46a7e]">Morning Journal</span>
              </div>
              <div className="space-y-2 text-sm pl-7">
                {selectedDay.morning.value && (
                  <p><span className="text-[#4a3f42]/50">価値観:</span> {selectedDay.morning.value}</p>
                )}
                {selectedDay.morning.action && (
                  <p><span className="text-[#4a3f42]/50">行動:</span> {selectedDay.morning.action}</p>
                )}
                {selectedDay.morning.letGo && (
                  <p><span className="text-[#4a3f42]/50">手放す:</span> {selectedDay.morning.letGo}</p>
                )}
                <p className="font-medium text-[#4a3f42]">{selectedDay.morning.declaration}</p>
              </div>
            </div>
          )}

          {selectedDay.night && (
            <div className={selectedDay.morning ? 'border-t border-[#d46a7e]/20 pt-4' : ''}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🌙</span>
                <span className="text-sm font-medium text-[#4a3f42]">Night Journal</span>
                {selectedDay.night.selfScore && (
                  <span className="ml-auto text-[#d46a7e] font-bold">{selectedDay.night.selfScore}/10</span>
                )}
              </div>
              <div className="space-y-2 text-sm pl-7">
                {selectedDay.night.proudChoice && (
                  <p><span className="text-[#4a3f42]/50">誇れる選択:</span> {selectedDay.night.proudChoice}</p>
                )}
                {selectedDay.night.learning && (
                  <p><span className="text-[#4a3f42]/50">学び:</span> {selectedDay.night.learning}</p>
                )}
                {selectedDay.night.tomorrowMessage && (
                  <p className="font-medium text-[#4a3f42]">💬 {selectedDay.night.tomorrowMessage}</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
