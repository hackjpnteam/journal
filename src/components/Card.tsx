'use client'

import { useTimeTheme } from '@/hooks/useTimeTheme'

interface CardProps {
  children: React.ReactNode
  className?: string
  isNight?: boolean
}

export function Card({ children, className = '', isNight: isNightProp }: CardProps) {
  const timeTheme = useTimeTheme()
  const isNight = isNightProp ?? (timeTheme === 'night')

  return (
    <div className={`rounded-2xl p-6 shadow-sm transition-colors duration-500 ${
      isNight
        ? 'bg-[#2d2438] border border-[#9b7bb8]/20'
        : 'bg-white border border-[#d46a7e]/10'
    } ${className}`}>
      {children}
    </div>
  )
}

interface CardTitleProps {
  children: React.ReactNode
  className?: string
  isNight?: boolean
}

export function CardTitle({ children, className = '', isNight: isNightProp }: CardTitleProps) {
  const timeTheme = useTimeTheme()
  const isNight = isNightProp ?? (timeTheme === 'night')

  return (
    <h2 className={`text-lg font-semibold mb-4 transition-colors duration-500 ${
      isNight ? 'text-white' : 'text-[#4a3f42]'
    } ${className}`}>
      {children}
    </h2>
  )
}
