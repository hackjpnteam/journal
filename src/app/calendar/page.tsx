'use client'

import { useState } from 'react'
import { TopBar } from '@/components/TopBar'
import { Card, CardTitle } from '@/components/Card'
import { CalendarMonth } from '@/components/CalendarMonth'
import { CalendarYear } from '@/components/CalendarYear'
import { useTimeTheme, themeColors } from '@/hooks/useTimeTheme'

type ViewMode = 'month' | 'year'

export default function CalendarPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const timeTheme = useTimeTheme()
  const theme = themeColors[timeTheme]
  const isNight = timeTheme === 'night'

  return (
    <div className={`min-h-screen transition-colors duration-500 ${theme.bg}`}>
      <TopBar isNight={isNight} />

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="text-center py-4">
          <h1 className={`text-xl font-semibold ${theme.text}`}>カレンダー</h1>
        </div>

        <div className="flex justify-center">
          <div className={`inline-flex rounded-lg p-1 shadow-sm ${isNight ? 'bg-[#2d2438]' : 'bg-white'}`}>
            <button
              onClick={() => setViewMode('month')}
              className={`px-4 py-2 rounded-lg text-sm transition ${
                viewMode === 'month'
                  ? isNight ? 'bg-[#9b7bb8] text-white' : 'bg-[#d46a7e] text-white'
                  : isNight ? 'text-white/60 hover:text-white' : 'text-[#4a3f42]/60 hover:text-[#4a3f42]'
              }`}
            >
              月表示
            </button>
            <button
              onClick={() => setViewMode('year')}
              className={`px-4 py-2 rounded-lg text-sm transition ${
                viewMode === 'year'
                  ? isNight ? 'bg-[#9b7bb8] text-white' : 'bg-[#d46a7e] text-white'
                  : isNight ? 'text-white/60 hover:text-white' : 'text-[#4a3f42]/60 hover:text-[#4a3f42]'
              }`}
            >
              年表示
            </button>
          </div>
        </div>

        <Card isNight={isNight}>
          {viewMode === 'month' ? <CalendarMonth isNight={isNight} /> : <CalendarYear isNight={isNight} />}
        </Card>

        <Card isNight={isNight}>
          <CardTitle isNight={isNight}>凡例</CardTitle>
          <div className="space-y-3 text-sm">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isNight ? 'bg-[#c9a0dc]' : 'bg-[#d46a7e]'}`} />
                <span className={theme.textMuted}>朝ジャーナル</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isNight ? 'bg-[#9b7bb8]' : 'bg-[#4a3f42]'}`} />
                <span className={theme.textMuted}>夜ジャーナル</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold ${theme.text}`}>8</span>
                <span className={theme.textMuted}>1日の点数</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <span>😵‍💫</span>
                <span className={theme.textMuted}>カオス</span>
              </div>
              <div className="flex items-center gap-2">
                <span>😐</span>
                <span className={theme.textMuted}>フラット</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🙂</span>
                <span className={theme.textMuted}>安定</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🔥</span>
                <span className={theme.textMuted}>燃えてる</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🌱</span>
                <span className={theme.textMuted}>回復中</span>
              </div>
            </div>
            <p className={`text-xs ${theme.textFaint}`}>※ 日付をタップすると詳細が見れます</p>
          </div>
        </Card>
      </main>
    </div>
  )
}
