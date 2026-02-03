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
  isNight?: boolean
}

export function CalendarMonth({ onMonthChange, isNight = false }: CalendarMonthProps) {
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
          className={`p-2 rounded-lg transition ${
            isNight
              ? 'hover:bg-[#9b7bb8]/10 text-[#c9a0dc]'
              : 'hover:bg-[#d46a7e]/10 text-[#d46a7e]'
          }`}
        >
          ←
        </button>
        <h3 className={`text-lg font-semibold ${isNight ? 'text-white' : 'text-[#4a3f42]'}`}>
          {format(currentDate, 'yyyy年 M月', { locale: ja })}
        </h3>
        <button
          onClick={goToNextMonth}
          className={`p-2 rounded-lg transition ${
            isNight
              ? 'hover:bg-[#9b7bb8]/10 text-[#c9a0dc]'
              : 'hover:bg-[#d46a7e]/10 text-[#d46a7e]'
          }`}
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className={`text-center text-xs py-2 ${isNight ? 'text-white/50' : 'text-[#4a3f42]/50'}`}
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
                ${isSameMonth(day, currentDate)
                  ? isNight ? 'bg-[#1a1625]' : 'bg-[#f0e8eb]'
                  : isNight ? 'bg-[#1a1625]/50' : 'bg-[#f0e8eb]/50'}
                ${isToday(day) ? isNight ? 'ring-2 ring-[#9b7bb8]' : 'ring-2 ring-[#d46a7e]' : ''}
                ${dayData ? isNight ? 'hover:bg-[#9b7bb8]/10' : 'hover:bg-[#d46a7e]/10' : ''}
              `}
            >
              <div className={`text-xs ${isNight ? 'text-white/60' : 'text-[#4a3f42]/60'}`}>{format(day, 'd')}</div>
              {hasMorning && (
                <div className="text-base leading-none">{MOOD_EMOJI[dayData.morning!.mood]}</div>
              )}
              {hasNight && dayData.night?.selfScore && (
                <div className={`text-xs font-bold ${isNight ? 'text-white' : 'text-[#4a3f42]'}`}>{dayData.night.selfScore}</div>
              )}
              <div className="flex justify-center gap-0.5 mt-0.5">
                {hasMorning && (
                  <div className={`w-1.5 h-1.5 rounded-full ${isNight ? 'bg-[#c9a0dc]' : 'bg-[#d46a7e]'}`} title="朝" />
                )}
                {hasNight && (
                  <div className={`w-1.5 h-1.5 rounded-full ${isNight ? 'bg-[#9b7bb8]' : 'bg-[#4a3f42]'}`} title="夜" />
                )}
              </div>
            </div>
          )
        })}
      </div>

      {loading && (
        <div className={`text-center text-sm mt-4 ${isNight ? 'text-white/50' : 'text-[#4a3f42]/50'}`}>読み込み中...</div>
      )}

      {/* 選択した日の詳細 */}
      {selectedDay && (
        <div className={`mt-6 p-4 rounded-xl ${isNight ? 'bg-[#1a1625]' : 'bg-white'}`}>
          <div className="flex items-center justify-between mb-4">
            <h4 className={`font-medium ${isNight ? 'text-white' : 'text-[#4a3f42]'}`}>
              {format(new Date(selectedDay.dateKey), 'M月d日（E）', { locale: ja })}
            </h4>
            <button
              onClick={() => setSelectedDay(null)}
              className={isNight ? 'text-white/50 hover:text-white' : 'text-[#4a3f42]/50 hover:text-[#4a3f42]'}
            >
              ✕
            </button>
          </div>

          {selectedDay.morning && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{MOOD_EMOJI[selectedDay.morning.mood]}</span>
                <span className={`text-sm font-medium ${isNight ? 'text-[#c9a0dc]' : 'text-[#d46a7e]'}`}>Morning Journal</span>
              </div>
              <div className={`space-y-2 text-sm pl-7 ${isNight ? 'text-white' : ''}`}>
                {selectedDay.morning.value && (
                  <p><span className={isNight ? 'text-white/50' : 'text-[#4a3f42]/50'}>価値観:</span> {selectedDay.morning.value}</p>
                )}
                {selectedDay.morning.action && (
                  <p><span className={isNight ? 'text-white/50' : 'text-[#4a3f42]/50'}>行動:</span> {selectedDay.morning.action}</p>
                )}
                {selectedDay.morning.letGo && (
                  <p><span className={isNight ? 'text-white/50' : 'text-[#4a3f42]/50'}>手放す:</span> {selectedDay.morning.letGo}</p>
                )}
                <p className={`font-medium ${isNight ? 'text-white' : 'text-[#4a3f42]'}`}>{selectedDay.morning.declaration}</p>
              </div>
            </div>
          )}

          {selectedDay.night && (
            <div className={selectedDay.morning ? `border-t pt-4 ${isNight ? 'border-[#9b7bb8]/20' : 'border-[#d46a7e]/20'}` : ''}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🌙</span>
                <span className={`text-sm font-medium ${isNight ? 'text-white' : 'text-[#4a3f42]'}`}>Night Journal</span>
                {selectedDay.night.selfScore && (
                  <span className={`ml-auto font-bold ${isNight ? 'text-[#c9a0dc]' : 'text-[#d46a7e]'}`}>{selectedDay.night.selfScore}/10</span>
                )}
              </div>
              <div className={`space-y-2 text-sm pl-7 ${isNight ? 'text-white' : ''}`}>
                {selectedDay.night.proudChoice && (
                  <p><span className={isNight ? 'text-white/50' : 'text-[#4a3f42]/50'}>誇れる選択:</span> {selectedDay.night.proudChoice}</p>
                )}
                {selectedDay.night.learning && (
                  <p><span className={isNight ? 'text-white/50' : 'text-[#4a3f42]/50'}>学び:</span> {selectedDay.night.learning}</p>
                )}
                {selectedDay.night.tomorrowMessage && (
                  <p className={`font-medium ${isNight ? 'text-white' : 'text-[#4a3f42]'}`}>💬 {selectedDay.night.tomorrowMessage}</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
