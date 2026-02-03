'use client'

import { useState, useMemo } from 'react'

interface ForestUser {
  userId: string
  name: string
  profileImage: string | null
  postCount: number
  progress: number
}

interface ForestProps {
  users: ForestUser[]
  currentUserId?: string
  weather?: 'clear' | 'partly_cloudy' | 'cloudy' | 'rain' | 'drizzle' | 'snow' | 'thunderstorm' | 'fog'
  isNight?: boolean
}

// シード付き乱数生成（同じユーザーは同じ位置に）
function seededRandom(seed: number) {
  const x = Math.sin(seed * 9999) * 10000
  return x - Math.floor(x)
}

export function Forest({ users, currentUserId, weather = 'clear', isNight = false }: ForestProps) {
  const [hoveredUser, setHoveredUser] = useState<ForestUser | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  // 0%のユーザーは非表示
  const activeUsers = users.filter(u => u.progress > 0)

  // 木の位置を計算（ユーザーIDに基づいてランダムだが固定）
  const treePositions = useMemo(() => {
    return activeUsers.map((user, index) => {
      // ユーザーIDからシードを生成
      const seed = user.userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + index

      // ランダムな位置（ただし重ならないように調整）
      const randomX = seededRandom(seed) * 260 + 30
      const randomDepth = seededRandom(seed + 100) // 0-1で奥行き

      return {
        user,
        x: randomX,
        depth: randomDepth,
      }
    })
    // 奥行きでソート（奥から描画）
    .sort((a, b) => a.depth - b.depth)
  }, [activeUsers])

  // 誰もいない場合
  if (activeUsers.length === 0) {
    return (
      <div className="text-center py-6 text-[#4a3f42]/50 text-sm">
        まだ今月の投稿がありません。<br />
        最初の木を育てよう!
      </div>
    )
  }

  const fruitColor = '#e53935'
  const svgHeight = 160

  // 天気と時間帯に応じた背景色
  const getSkyGradient = () => {
    if (isNight) {
      // 夜の空
      switch (weather) {
        case 'clear':
          return { top: '#0a1628', bottom: '#1a2a4a' }
        case 'partly_cloudy':
          return { top: '#0f1e35', bottom: '#1f3050' }
        case 'cloudy':
          return { top: '#1a2535', bottom: '#2a3545' }
        case 'rain':
        case 'drizzle':
          return { top: '#151f2e', bottom: '#252f3e' }
        case 'thunderstorm':
          return { top: '#0a0f18', bottom: '#1a1f28' }
        case 'snow':
          return { top: '#1a2535', bottom: '#2a3a4a' }
        case 'fog':
          return { top: '#1f2a3a', bottom: '#2f3a4a' }
        default:
          return { top: '#0a1628', bottom: '#1a2a4a' }
      }
    }
    // 昼の空
    switch (weather) {
      case 'clear':
        return { top: '#87ceeb', bottom: '#e8f5e9' }
      case 'partly_cloudy':
        return { top: '#a8d4e6', bottom: '#e8f5e9' }
      case 'cloudy':
        return { top: '#9eb4c0', bottom: '#d5e0d8' }
      case 'rain':
      case 'drizzle':
        return { top: '#6b8ba4', bottom: '#c5d5c8' }
      case 'thunderstorm':
        return { top: '#4a5568', bottom: '#718096' }
      case 'snow':
        return { top: '#e2e8f0', bottom: '#f7fafc' }
      case 'fog':
        return { top: '#cbd5e0', bottom: '#e2e8f0' }
      default:
        return { top: '#87ceeb', bottom: '#e8f5e9' }
    }
  }

  const skyColors = getSkyGradient()

  // 星の生成（夜のみ）
  const renderStars = () => {
    if (!isNight) return null
    const stars = []
    for (let i = 0; i < 30; i++) {
      const x = seededRandom(i * 7) * 300 + 10
      const y = seededRandom(i * 11) * 60 + 5
      const size = seededRandom(i * 3) * 1.5 + 0.5
      const delay = seededRandom(i * 5) * 3
      stars.push(
        <circle
          key={`star-${i}`}
          cx={x}
          cy={y}
          r={size}
          fill="white"
        >
          <animate
            attributeName="opacity"
            values="0.4;1;0.4"
            dur={`${2 + delay}s`}
            repeatCount="indefinite"
          />
        </circle>
      )
    }
    return <g>{stars}</g>
  }

  // 雨粒の生成
  const renderRain = () => {
    if (weather !== 'rain' && weather !== 'drizzle' && weather !== 'thunderstorm') return null
    const raindrops = []
    const count = weather === 'drizzle' ? 20 : 40
    for (let i = 0; i < count; i++) {
      const x = (i * 8) % 320
      const delay = (i * 0.1) % 2
      raindrops.push(
        <line
          key={`rain-${i}`}
          x1={x}
          y1={-10}
          x2={x - 5}
          y2={0}
          stroke="#7ca8c6"
          strokeWidth={weather === 'drizzle' ? 1 : 1.5}
          opacity={0.6}
        >
          <animate
            attributeName="y1"
            values="-10;170"
            dur={weather === 'drizzle' ? '1.5s' : '0.8s'}
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="y2"
            values="0;180"
            dur={weather === 'drizzle' ? '1.5s' : '0.8s'}
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
        </line>
      )
    }
    return <g opacity="0.7">{raindrops}</g>
  }

  // 雪の生成
  const renderSnow = () => {
    if (weather !== 'snow') return null
    const snowflakes = []
    for (let i = 0; i < 30; i++) {
      const x = (i * 11) % 320
      const delay = (i * 0.2) % 4
      const size = 2 + (i % 3)
      snowflakes.push(
        <circle
          key={`snow-${i}`}
          cx={x}
          cy={-10}
          r={size}
          fill="white"
          opacity={0.8}
        >
          <animate
            attributeName="cy"
            values="-10;170"
            dur="4s"
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="cx"
            values={`${x};${x + 20};${x};${x - 20};${x}`}
            dur="4s"
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
        </circle>
      )
    }
    return <g>{snowflakes}</g>
  }

  const renderTree = (user: ForestUser, x: number, depth: number) => {
    const progress = user.progress
    const isCurrentUser = user.userId === currentUserId

    // 奥行きに応じたスケールとY位置
    const scale = 0.4 + depth * 0.6
    const baseY = 70 + depth * 60

    return (
      <g
        key={user.userId}
        transform={`translate(${x}, ${baseY}) scale(${scale})`}
        style={{ cursor: 'pointer' }}
        onMouseEnter={(e) => {
          setHoveredUser(user)
          const rect = e.currentTarget.getBoundingClientRect()
          setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top })
        }}
        onMouseLeave={() => setHoveredUser(null)}
      >
        {/* 木の影 */}
        <ellipse cx="0" cy="5" rx={6 + progress / 15} ry="3" fill="#2e5016" opacity="0.3" />

        {/* ハイライト（自分の木） */}
        {isCurrentUser && (
          <ellipse cx="0" cy="3" rx="20" ry="8" fill="#d46a7e" opacity="0.5" />
        )}

        {/* 芽（1-19%） */}
        {progress > 0 && progress < 20 && (
          <g>
            <line x1="0" y1="0" x2="0" y2="-8" stroke="#6d4c41" strokeWidth="2" />
            <ellipse cx="-3" cy="-10" rx="4" ry="6" fill="#7cb342" transform="rotate(-20 -3 -10)" />
            <ellipse cx="3" cy="-10" rx="4" ry="6" fill="#8bc34a" transform="rotate(20 3 -10)" />
          </g>
        )}

        {/* 小さな木（20-39%） */}
        {progress >= 20 && progress < 40 && (
          <g>
            <rect x="-2" y="-20" width="4" height="20" fill="#6d4c41" rx="1" />
            <ellipse cx="0" cy="-24" rx="12" ry="10" fill="#558b2f" />
            <ellipse cx="-6" cy="-20" rx="8" ry="6" fill="#7cb342" />
            <ellipse cx="6" cy="-20" rx="8" ry="6" fill="#689f38" />
            <ellipse cx="0" cy="-28" rx="8" ry="6" fill="#8bc34a" />
          </g>
        )}

        {/* 成長した木（40-59%） */}
        {progress >= 40 && progress < 60 && (
          <g>
            <rect x="-3" y="-30" width="6" height="30" fill="#5d4037" rx="2" />
            <ellipse cx="0" cy="-36" rx="16" ry="14" fill="#33691e" />
            <ellipse cx="-10" cy="-30" rx="10" ry="8" fill="#558b2f" />
            <ellipse cx="10" cy="-30" rx="10" ry="8" fill="#558b2f" />
            <ellipse cx="0" cy="-44" rx="12" ry="10" fill="#689f38" />
            <ellipse cx="-5" cy="-38" rx="6" ry="5" fill="#7cb342" />
            <ellipse cx="6" cy="-40" rx="6" ry="5" fill="#8bc34a" />
          </g>
        )}

        {/* 立派な木（60%以上） */}
        {progress >= 60 && (
          <g>
            {/* 幹 */}
            <rect x="-4" y="-40" width="8" height="40" fill="#4e342e" rx="2" />
            <rect x="-2" y="-38" width="3" height="36" fill="#5d4037" rx="1" />

            {/* 枝 */}
            <line x1="-2" y1="-25" x2="-12" y2="-30" stroke="#5d4037" strokeWidth="3" strokeLinecap="round" />
            <line x1="2" y1="-28" x2="12" y2="-32" stroke="#5d4037" strokeWidth="3" strokeLinecap="round" />

            {/* 葉の塊 */}
            <ellipse cx="0" cy="-50" rx="20" ry="16" fill="#2e7d32" />
            <ellipse cx="-14" cy="-40" rx="12" ry="10" fill="#388e3c" />
            <ellipse cx="14" cy="-42" rx="12" ry="10" fill="#388e3c" />
            <ellipse cx="0" cy="-60" rx="14" ry="12" fill="#43a047" />
            <ellipse cx="-8" cy="-52" rx="8" ry="7" fill="#66bb6a" />
            <ellipse cx="8" cy="-55" rx="8" ry="7" fill="#66bb6a" />
            <ellipse cx="0" cy="-46" rx="10" ry="8" fill="#4caf50" />

            {/* 果物（80%以上） */}
            {progress >= 80 && (
              <g>
                <circle cx="-10" cy="-42" r="5" fill={fruitColor} />
                <circle cx="-12" cy="-44" r="1.5" fill="#ffcdd2" opacity="0.7" />
              </g>
            )}
            {progress >= 90 && (
              <g>
                <circle cx="10" cy="-48" r="5" fill={fruitColor} />
                <circle cx="8" cy="-50" r="1.5" fill="#ffcdd2" opacity="0.7" />
              </g>
            )}
            {progress >= 100 && (
              <g>
                <circle cx="0" cy="-38" r="5" fill={fruitColor} />
                <circle cx="-2" cy="-40" r="1.5" fill="#ffcdd2" opacity="0.7" />
                <circle cx="-6" cy="-55" r="4" fill={fruitColor} />
                <circle cx="7" cy="-40" r="4" fill={fruitColor} />
                {/* キラキラ */}
                <g>
                  <circle cx="-5" cy="-65" r="2" fill="#fff59d">
                    <animate attributeName="opacity" values="1;0.2;1" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="10" cy="-58" r="2" fill="#fff59d">
                    <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="0" cy="-70" r="2.5" fill="#fff59d">
                    <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1.8s" repeatCount="indefinite" />
                  </circle>
                </g>
              </g>
            )}
          </g>
        )}
      </g>
    )
  }

  return (
    <div className="w-full relative">
      <svg width="100%" viewBox={`0 0 320 ${svgHeight}`} className="rounded-xl overflow-hidden">
        <defs>
          <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={skyColors.top} />
            <stop offset="100%" stopColor={skyColors.bottom} />
          </linearGradient>
        </defs>

        {/* 空 */}
        <rect width="320" height={svgHeight} fill="url(#skyGrad)" />

        {/* 星（夜のみ） */}
        {renderStars()}

        {/* 太陽/月（晴れ・一部曇りの時のみ） */}
        {(weather === 'clear' || weather === 'partly_cloudy') && (
          isNight ? (
            // 月
            <g>
              <circle cx="280" cy="25" r="14" fill="#f5f5dc" opacity="0.95" />
              <circle cx="274" cy="22" r="12" fill={skyColors.top} />
              {/* 月の光 */}
              <circle cx="280" cy="25" r="20" fill="#f5f5dc" opacity="0.1">
                <animate attributeName="r" values="20;24;20" dur="4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.1;0.2;0.1" dur="4s" repeatCount="indefinite" />
              </circle>
            </g>
          ) : (
            // 太陽
            <g>
              <circle cx="280" cy="25" r="18" fill="#fff9c4" opacity="0.9" />
              <circle cx="280" cy="25" r="14" fill="#ffee58" opacity="0.8" />
            </g>
          )
        )}

        {/* 雲（アニメーション付き） */}
        <g opacity={weather === 'clear' ? (isNight ? 0.4 : 0.9) : weather === 'cloudy' || weather === 'rain' || weather === 'thunderstorm' ? 0.95 : 0.85}>
          {/* 雲1 - 左から右へ */}
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              values="-80,0;340,0;-80,0"
              dur="60s"
              repeatCount="indefinite"
            />
            <ellipse cx="50" cy="30" rx="25" ry="10" fill={isNight ? '#4a5568' : 'white'} />
            <ellipse cx="70" cy="26" rx="18" ry="8" fill={isNight ? '#4a5568' : 'white'} />
            <ellipse cx="35" cy="26" rx="15" ry="7" fill={isNight ? '#4a5568' : 'white'} />
          </g>
          {/* 雲2 - ゆっくり */}
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0;100,0;0,0"
              dur="80s"
              repeatCount="indefinite"
            />
            <ellipse cx="180" cy="40" rx="20" ry="8" fill={isNight ? '#4a5568' : 'white'} />
            <ellipse cx="195" cy="36" rx="14" ry="6" fill={isNight ? '#4a5568' : 'white'} />
          </g>
          {/* 曇りや雨の時は追加の雲 */}
          {(weather === 'cloudy' || weather === 'rain' || weather === 'drizzle' || weather === 'thunderstorm') && (
            <>
              <g>
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="50,0;-50,0;50,0"
                  dur="45s"
                  repeatCount="indefinite"
                />
                <ellipse cx="100" cy="20" rx="30" ry="12" fill={isNight ? '#3a4555' : '#e8e8e8'} />
                <ellipse cx="125" cy="16" rx="22" ry="10" fill={isNight ? '#4a5568' : '#f0f0f0'} />
                <ellipse cx="80" cy="16" rx="18" ry="8" fill={isNight ? '#3a4555' : '#e8e8e8'} />
              </g>
              <g>
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="-30,0;70,0;-30,0"
                  dur="55s"
                  repeatCount="indefinite"
                />
                <ellipse cx="250" cy="25" rx="28" ry="11" fill={isNight ? '#2a3545' : '#e0e0e0'} />
                <ellipse cx="275" cy="21" rx="20" ry="9" fill={isNight ? '#3a4555' : '#e8e8e8'} />
                <ellipse cx="230" cy="21" rx="16" ry="7" fill={isNight ? '#2a3545' : '#e0e0e0'} />
              </g>
            </>
          )}
        </g>

        {/* 霧 */}
        {weather === 'fog' && (
          <g opacity="0.5">
            <rect x="0" y="60" width="320" height="100" fill="white">
              <animate attributeName="opacity" values="0.3;0.6;0.3" dur="5s" repeatCount="indefinite" />
            </rect>
          </g>
        )}

        {/* 遠くの山 */}
        <path d="M0 90 Q40 50 80 85 Q120 60 160 80 Q200 55 240 75 Q280 50 320 85 L320 100 L0 100 Z" fill={isNight ? '#2a3a2a' : '#a5d6a7'} opacity="0.5" />

        {/* 草原（奥から手前へ） */}
        <path d="M0 95 Q80 80 160 90 Q240 75 320 88 L320 160 L0 160 Z" fill={isNight ? '#1a3020' : '#7cb342'} />
        <path d="M0 105 Q100 92 200 100 Q280 90 320 98 L320 160 L0 160 Z" fill={isNight ? '#1f3525' : '#8bc34a'} />
        <path d="M0 120 Q60 110 160 118 Q260 108 320 115 L320 160 L0 160 Z" fill={isNight ? '#243a2a' : '#9ccc65'} />
        <path d="M0 135 Q80 128 160 133 Q240 126 320 132 L320 160 L0 160 Z" fill={isNight ? '#2a4030' : '#aed581'} />

        {/* 木を描画 */}
        {treePositions.map(({ user, x, depth }) => renderTree(user, x, depth))}

        {/* 手前の草 */}
        <g opacity="0.8">
          {[10, 35, 60, 95, 125, 160, 195, 230, 265, 295].map((gx, i) => (
            <g key={`grass-${i}`}>
              <path d={`M${gx} 160 Q${gx - 2} 150 ${gx} 145 Q${gx + 2} 150 ${gx} 160`} fill={isNight ? '#1a3020' : '#7cb342'} />
              <path d={`M${gx + 8} 160 Q${gx + 5} 148 ${gx + 8} 140 Q${gx + 11} 148 ${gx + 8} 160`} fill={isNight ? '#153018' : '#689f38'} />
            </g>
          ))}
        </g>

        {/* 花（夜は光る） */}
        <circle cx="25" cy="152" r="3" fill={isNight ? '#ffe082' : '#ffeb3b'} opacity={isNight ? 0.6 : 1} />
        <circle cx="80" cy="148" r="2.5" fill={isNight ? '#f8bbd0' : '#f48fb1'} opacity={isNight ? 0.5 : 1} />
        <circle cx="150" cy="150" r="3" fill={isNight ? '#fff59d' : '#fff176'} opacity={isNight ? 0.6 : 1} />
        <circle cx="220" cy="147" r="2.5" fill={isNight ? '#e1bee7' : '#ce93d8'} opacity={isNight ? 0.5 : 1} />
        <circle cx="290" cy="151" r="3" fill={isNight ? '#ffcc80' : '#ffcc80'} opacity={isNight ? 0.6 : 1} />

        {/* 雨・雪のエフェクト */}
        {renderRain()}
        {renderSnow()}

        {/* 雷（雷雨の時） */}
        {weather === 'thunderstorm' && (
          <g>
            <polygon points="150,0 145,30 155,30 140,60 160,25 150,25" fill="#ffeb3b">
              <animate attributeName="opacity" values="0;0;1;0;0;0;0;0;1;0" dur="3s" repeatCount="indefinite" />
            </polygon>
          </g>
        )}
      </svg>

      {/* ツールチップ */}
      {hoveredUser && (
        <div
          className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full"
          style={{ left: tooltipPos.x, top: tooltipPos.y - 8 }}
        >
          <div className={`px-3 py-2 rounded-lg text-white text-xs whitespace-nowrap shadow-lg ${
            hoveredUser.userId === currentUserId ? 'bg-[#d46a7e]' : 'bg-[#4a3f42]'
          }`}>
            <p className="font-bold text-sm">{hoveredUser.name}</p>
            <p className="opacity-80">{hoveredUser.progress}%</p>
          </div>
          <div
            className={`w-0 h-0 mx-auto border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent ${
              hoveredUser.userId === currentUserId ? 'border-t-[#d46a7e]' : 'border-t-[#4a3f42]'
            }`}
          />
        </div>
      )}

      {/* 参加者数 */}
      <div className={`text-center text-xs mt-2 ${isNight ? 'text-white/70' : 'text-[#4a3f42]/60'}`}>
        🌳 {activeUsers.length}本の木が育っています
      </div>
    </div>
  )
}
