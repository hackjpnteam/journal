'use client'

import { useState, useEffect } from 'react'

export type TimeTheme = 'day' | 'night'

export function useTimeTheme(): TimeTheme {
  const [theme, setTheme] = useState<TimeTheme>('day')

  useEffect(() => {
    const checkTime = () => {
      const hour = new Date().getHours()
      // 17:00〜翌5:59はナイトモード
      if (hour >= 17 || hour < 6) {
        setTheme('night')
      } else {
        setTheme('day')
      }
    }

    // 初回チェック
    checkTime()

    // 1分ごとにチェック
    const interval = setInterval(checkTime, 60000)

    return () => clearInterval(interval)
  }, [])

  return theme
}

// テーマに応じた色を取得するヘルパー
export const themeColors = {
  day: {
    bg: 'bg-[#f0e8eb]',
    cardBg: 'bg-white',
    text: 'text-[#4a3f42]',
    textMuted: 'text-[#4a3f42]/60',
    textFaint: 'text-[#4a3f42]/50',
    accent: 'bg-[#d46a7e]',
    accentHover: 'hover:bg-[#c25a6e]',
    accentText: 'text-[#d46a7e]',
    border: 'border-[#d46a7e]',
    borderLight: 'border-[#d46a7e]/20',
    secondary: 'bg-[#4a3f42]',
    secondaryHover: 'hover:bg-[#3a2f32]',
  },
  night: {
    bg: 'bg-[#1a1625]',
    cardBg: 'bg-[#2d2438]',
    text: 'text-white',
    textMuted: 'text-white/80',
    textFaint: 'text-white/60',
    accent: 'bg-[#9b7bb8]',
    accentHover: 'hover:bg-[#8a6aa7]',
    accentText: 'text-[#c9a0dc]',
    border: 'border-[#9b7bb8]',
    borderLight: 'border-[#9b7bb8]/30',
    secondary: 'bg-[#3d3248]',
    secondaryHover: 'hover:bg-[#4d4258]',
  },
}
