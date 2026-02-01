'use client'

import { useState } from 'react'
import { TopBar } from '@/components/TopBar'
import { Card, CardTitle } from '@/components/Card'
import { CalendarMonth } from '@/components/CalendarMonth'
import { CalendarYear } from '@/components/CalendarYear'

type ViewMode = 'month' | 'year'

export default function CalendarPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('month')

  return (
    <div className="min-h-screen bg-[#f0e8eb]">
      <TopBar />

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="text-center py-4">
          <h1 className="text-xl font-semibold text-[#4a3f42]">カレンダー</h1>
        </div>

        <div className="flex justify-center">
          <div className="inline-flex bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setViewMode('month')}
              className={`px-4 py-2 rounded-lg text-sm transition ${
                viewMode === 'month'
                  ? 'bg-[#d46a7e] text-white'
                  : 'text-[#4a3f42]/60 hover:text-[#4a3f42]'
              }`}
            >
              月表示
            </button>
            <button
              onClick={() => setViewMode('year')}
              className={`px-4 py-2 rounded-lg text-sm transition ${
                viewMode === 'year'
                  ? 'bg-[#d46a7e] text-white'
                  : 'text-[#4a3f42]/60 hover:text-[#4a3f42]'
              }`}
            >
              年表示
            </button>
          </div>
        </div>

        <Card>
          {viewMode === 'month' ? <CalendarMonth /> : <CalendarYear />}
        </Card>

        <Card>
          <CardTitle>凡例</CardTitle>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#d46a7e] rounded-full" />
              <span className="text-[#4a3f42]/60">宣言投稿済み</span>
            </div>
            <div className="flex items-center gap-2">
              <span>😵‍💫</span>
              <span className="text-[#4a3f42]/60">カオス</span>
            </div>
            <div className="flex items-center gap-2">
              <span>😐</span>
              <span className="text-[#4a3f42]/60">フラット</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🙂</span>
              <span className="text-[#4a3f42]/60">安定</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🔥</span>
              <span className="text-[#4a3f42]/60">燃えてる</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🌱</span>
              <span className="text-[#4a3f42]/60">回復中</span>
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}
