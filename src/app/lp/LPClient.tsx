'use client'

import { useState, useEffect, useRef } from 'react'

// 成長ステージの木を描画するコンポーネント
export function GrowthTreeLP({ stage, isNight }: { stage: number; isNight: boolean }) {
  const leafColor = isNight ? '#3d5a40' : '#4F6F52'
  const leafLight = isNight ? '#4a6a4d' : '#5a8055'
  const leafLighter = isNight ? '#567058' : '#6a9060'

  return (
    <svg viewBox="0 0 200 300" className="w-full h-full">
      <ellipse cx="100" cy="280" rx="60" ry="15" fill={leafColor} opacity="0.3" />
      {stage === 0 && (
        <g className="animate-pulse">
          <line x1="100" y1="280" x2="100" y2="250" stroke={leafColor} strokeWidth="4" />
          <ellipse cx="92" cy="245" rx="8" ry="15" fill={leafColor} transform="rotate(-20 92 245)" />
          <ellipse cx="108" cy="245" rx="8" ry="15" fill={leafLight} transform="rotate(20 108 245)" />
        </g>
      )}
      {stage === 1 && (
        <g>
          <rect x="95" y="200" width="10" height="80" fill="#5D4037" rx="2" />
          <ellipse cx="100" cy="190" rx="30" ry="25" fill={leafColor} />
          <ellipse cx="85" cy="200" rx="20" ry="15" fill={leafLight} />
          <ellipse cx="115" cy="200" rx="20" ry="15" fill={leafLight} />
        </g>
      )}
      {stage === 2 && (
        <g>
          <rect x="93" y="160" width="14" height="120" fill="#5D4037" rx="3" />
          <line x1="100" y1="200" x2="70" y2="180" stroke="#5D4037" strokeWidth="6" strokeLinecap="round" />
          <line x1="100" y1="200" x2="130" y2="175" stroke="#5D4037" strokeWidth="6" strokeLinecap="round" />
          <ellipse cx="100" cy="140" rx="45" ry="40" fill={leafColor} />
          <ellipse cx="70" cy="165" rx="25" ry="20" fill={leafLight} />
          <ellipse cx="130" cy="160" rx="25" ry="20" fill={leafLight} />
          <ellipse cx="100" cy="120" rx="30" ry="25" fill={leafLighter} />
        </g>
      )}
      {stage === 3 && (
        <g>
          <rect x="92" y="140" width="16" height="140" fill="#5D4037" rx="3" />
          <line x1="100" y1="190" x2="60" y2="160" stroke="#5D4037" strokeWidth="8" strokeLinecap="round" />
          <line x1="100" y1="190" x2="140" y2="155" stroke="#5D4037" strokeWidth="8" strokeLinecap="round" />
          <ellipse cx="100" cy="100" rx="55" ry="50" fill={leafColor} />
          <ellipse cx="60" cy="140" rx="30" ry="25" fill={leafLight} />
          <ellipse cx="140" cy="135" rx="30" ry="25" fill={leafLight} />
          <ellipse cx="100" cy="70" rx="40" ry="35" fill={leafLighter} />
          {[{ cx: 75, cy: 90 }, { cx: 125, cy: 85 }, { cx: 100, cy: 60 }, { cx: 60, cy: 120 }, { cx: 140, cy: 115 }].map((pos, i) => (
            <g key={i}>
              <circle cx={pos.cx} cy={pos.cy} r="8" fill={isNight ? '#e8c0c8' : '#fce4ec'} opacity="0.9">
                <animate attributeName="r" values="7;9;7" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
              </circle>
              <circle cx={pos.cx} cy={pos.cy} r="3" fill={isNight ? '#c9a0dc' : '#d46a7e'} />
            </g>
          ))}
        </g>
      )}
      {stage === 4 && (
        <g>
          <rect x="90" y="120" width="20" height="160" fill="#5D4037" rx="4" />
          <line x1="100" y1="180" x2="50" y2="140" stroke="#5D4037" strokeWidth="10" strokeLinecap="round" />
          <line x1="100" y1="180" x2="150" y2="135" stroke="#5D4037" strokeWidth="10" strokeLinecap="round" />
          <ellipse cx="100" cy="80" rx="65" ry="60" fill={leafColor} />
          <ellipse cx="50" cy="120" rx="35" ry="30" fill={leafLight} />
          <ellipse cx="150" cy="115" rx="35" ry="30" fill={leafLight} />
          <ellipse cx="100" cy="45" rx="50" ry="40" fill={leafLighter} />
          {[{ cx: 65, cy: 70 }, { cx: 135, cy: 65 }, { cx: 100, cy: 40 }, { cx: 50, cy: 100 }, { cx: 150, cy: 95 }, { cx: 80, cy: 110 }, { cx: 120, cy: 105 }].map((pos, i) => (
            <g key={i}>
              <circle cx={pos.cx} cy={pos.cy} r="12" fill="#c62828">
                <animate attributeName="opacity" values="0.9;1;0.9" dur={`${2 + i * 0.2}s`} repeatCount="indefinite" />
              </circle>
              <ellipse cx={pos.cx - 3} cy={pos.cy - 4} rx="3" ry="2" fill="#ef5350" opacity="0.6" />
            </g>
          ))}
          {[{ cx: 40, cy: 50 }, { cx: 160, cy: 45 }, { cx: 100, cy: 15 }].map((pos, i) => (
            <circle key={`sparkle-${i}`} cx={pos.cx} cy={pos.cy} r="3" fill={isNight ? '#c9a0dc' : '#d46a7e'}>
              <animate attributeName="opacity" values="0;1;0" dur={`${1.5 + i * 0.5}s`} repeatCount="indefinite" />
              <animate attributeName="r" values="2;4;2" dur={`${1.5 + i * 0.5}s`} repeatCount="indefinite" />
            </circle>
          ))}
        </g>
      )}
    </svg>
  )
}

export function FadeInSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const timer = setTimeout(() => setIsVisible(true), delay)
          observer.disconnect()
          return () => clearTimeout(timer)
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])
  return (
    <div ref={ref} className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      {children}
    </div>
  )
}

// 数字のカウントアップアニメーション
export function CountUp({ end, duration = 2000, suffix = '' }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (end === 0) return
    let start = 0
    const increment = end / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [end, duration])
  return <>{count.toLocaleString()}{suffix}</>
}

// アニメーションする木（ステージが自動で切り替わる）
export function AnimatedTree({ isNight }: { isNight: boolean }) {
  const [currentStage, setCurrentStage] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => setCurrentStage((prev) => (prev + 1) % 5), 3000)
    return () => clearInterval(interval)
  }, [])
  return <GrowthTreeLP stage={currentStage} isNight={isNight} />
}
