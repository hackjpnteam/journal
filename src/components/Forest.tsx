'use client'

import { useState, useMemo, useEffect, useCallback, useRef } from 'react'

interface ForestUser {
  userId: string
  name: string
  profileImage: string | null
  postCount: number
  progress: number
  waterCount?: number
  weeklyWaterCount?: number
  waterBonus?: number
}

interface ForestProps {
  users: ForestUser[]
  currentUserId?: string
  weather?: 'clear' | 'partly_cloudy' | 'cloudy' | 'rain' | 'drizzle' | 'snow' | 'thunderstorm' | 'fog'
  isNight?: boolean
  mvpUserId?: string | null
  wateredByMeToday?: string[]
  onWaterTree?: (targetUserId: string) => void
}

// シード付き乱数生成（同じユーザーは同じ位置に）
function seededRandom(seed: number) {
  const x = Math.sin(seed * 9999) * 10000
  return x - Math.floor(x)
}

export function Forest({ users, currentUserId, weather = 'clear', isNight = false, mvpUserId, wateredByMeToday = [], onWaterTree }: ForestProps) {
  const [hoveredUser, setHoveredUser] = useState<ForestUser | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [wateringUserId, setWateringUserId] = useState<string | null>(null)
  const [waterAnimPos, setWaterAnimPos] = useState<{ x: number; y: number } | null>(null)

  // アンビエントサウンド用ref
  const audioCtxRef = useRef<AudioContext | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const oscillatorsRef = useRef<OscillatorNode[]>([])
  const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null)

  const startAmbientSound = useCallback(() => {
    try {
      const ctx = new AudioContext()
      audioCtxRef.current = ctx

      const masterGain = ctx.createGain()
      masterGain.gain.setValueAtTime(0, ctx.currentTime)
      masterGain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 3) // 3秒かけてフェードイン
      masterGain.connect(ctx.destination)
      gainNodeRef.current = masterGain

      // 和音パッド（C, E, G, B のドローン）
      const frequencies = [130.81, 164.81, 196.00, 246.94] // C3, E3, G3, B3
      const oscs: OscillatorNode[] = []

      frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, ctx.currentTime)

        // 微妙にデチューンして有機的な響きに
        osc.detune.setValueAtTime((i - 1.5) * 4, ctx.currentTime)

        // 各音のゲインをゆっくり揺らす（LFO的な効果）
        const oscGain = ctx.createGain()
        oscGain.gain.setValueAtTime(0.08, ctx.currentTime)

        // 低域フィルターで柔らかくする
        const filter = ctx.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(400 + i * 100, ctx.currentTime)
        filter.Q.setValueAtTime(0.5, ctx.currentTime)

        osc.connect(filter)
        filter.connect(oscGain)
        oscGain.connect(masterGain)
        osc.start()
        oscs.push(osc)

        // ゆっくり周波数を揺らす
        const lfoFreq = 0.05 + i * 0.02
        const lfo = ctx.createOscillator()
        lfo.frequency.setValueAtTime(lfoFreq, ctx.currentTime)
        const lfoGain = ctx.createGain()
        lfoGain.gain.setValueAtTime(2, ctx.currentTime)
        lfo.connect(lfoGain)
        lfoGain.connect(osc.frequency)
        lfo.start()
        oscs.push(lfo)
      })

      // 高音のきらきら音（ランダムなベルトーン）
      const bellInterval = setInterval(() => {
        if (!audioCtxRef.current) return
        const bellCtx = audioCtxRef.current
        const bellFreqs = [523.25, 659.25, 783.99, 987.77, 1046.50, 1318.51] // C5, E5, G5, B5, C6, E6
        const freq = bellFreqs[Math.floor(Math.random() * bellFreqs.length)]

        const bell = bellCtx.createOscillator()
        bell.type = 'sine'
        bell.frequency.setValueAtTime(freq, bellCtx.currentTime)

        const bellGain = bellCtx.createGain()
        bellGain.gain.setValueAtTime(0, bellCtx.currentTime)
        bellGain.gain.linearRampToValueAtTime(0.04, bellCtx.currentTime + 0.5)
        bellGain.gain.exponentialRampToValueAtTime(0.001, bellCtx.currentTime + 4)

        const bellFilter = bellCtx.createBiquadFilter()
        bellFilter.type = 'lowpass'
        bellFilter.frequency.setValueAtTime(2000, bellCtx.currentTime)

        bell.connect(bellFilter)
        bellFilter.connect(bellGain)
        bellGain.connect(masterGain)
        bell.start()
        bell.stop(bellCtx.currentTime + 4)
      }, 3000 + Math.random() * 4000)

      // 自然音（フィルタードノイズで風の音）
      const bufferSize = ctx.sampleRate * 2
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const output = noiseBuffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1
      }
      const noise = ctx.createBufferSource()
      noise.buffer = noiseBuffer
      noise.loop = true

      const noiseFilter = ctx.createBiquadFilter()
      noiseFilter.type = 'lowpass'
      noiseFilter.frequency.setValueAtTime(300, ctx.currentTime)
      noiseFilter.Q.setValueAtTime(0.1, ctx.currentTime)

      // 風のフィルターを揺らす
      const windLfo = ctx.createOscillator()
      windLfo.frequency.setValueAtTime(0.1, ctx.currentTime)
      const windLfoGain = ctx.createGain()
      windLfoGain.gain.setValueAtTime(150, ctx.currentTime)
      windLfo.connect(windLfoGain)
      windLfoGain.connect(noiseFilter.frequency)
      windLfo.start()
      oscs.push(windLfo)

      const noiseGain = ctx.createGain()
      noiseGain.gain.setValueAtTime(0.06, ctx.currentTime)

      noise.connect(noiseFilter)
      noiseFilter.connect(noiseGain)
      noiseGain.connect(masterGain)
      noise.start()
      noiseNodeRef.current = noise

      oscillatorsRef.current = oscs

      // bellIntervalをcleanup用に保存
      ;(masterGain as unknown as Record<string, unknown>)._bellInterval = bellInterval
    } catch {
      // Web Audio APIが使えない環境ではスキップ
    }
  }, [])

  const stopAmbientSound = useCallback(() => {
    const ctx = audioCtxRef.current
    const gain = gainNodeRef.current
    if (ctx && gain) {
      // bellIntervalをクリア
      const interval = (gain as unknown as Record<string, unknown>)._bellInterval as ReturnType<typeof setInterval> | undefined
      if (interval) clearInterval(interval)

      // 2秒かけてフェードアウト
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 2)
      setTimeout(() => {
        oscillatorsRef.current.forEach(osc => {
          try { osc.stop() } catch { /* already stopped */ }
        })
        if (noiseNodeRef.current) {
          try { noiseNodeRef.current.stop() } catch { /* already stopped */ }
        }
        ctx.close()
        audioCtxRef.current = null
        gainNodeRef.current = null
        oscillatorsRef.current = []
        noiseNodeRef.current = null
      }, 2100)
    }
  }, [])

  // ミュートトグル
  const toggleMute = useCallback(() => {
    const gain = gainNodeRef.current
    const ctx = audioCtxRef.current
    if (gain && ctx) {
      if (isMuted) {
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.5)
      } else {
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5)
      }
    }
    setIsMuted(prev => !prev)
  }, [isMuted])

  // ESCキーで閉じる
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setIsExpanded(false)
  }, [])

  useEffect(() => {
    if (isExpanded) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
      startAmbientSound()
    } else {
      document.body.style.overflow = ''
      stopAmbientSound()
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isExpanded, handleKeyDown, startAmbientSound, stopAmbientSound])

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

  const forestSvg = (expanded: boolean) => {
    const h = expanded ? 400 : svgHeight
    const w = expanded ? 640 : 320
    const gradId = expanded ? 'skyGradExpanded' : 'skyGrad'

    // 拡大時は木の位置をスケールアップ
    const scaleX = w / 320
    const scaleY = h / svgHeight

    return (
      <svg width="100%" height={expanded ? '100%' : undefined} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio={expanded ? 'xMidYMid meet' : undefined} className={`overflow-hidden ${expanded ? '' : 'rounded-xl'}`}>
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={skyColors.top} />
            <stop offset="100%" stopColor={skyColors.bottom} />
          </linearGradient>
        </defs>

        {/* 空 */}
        <rect width={w} height={h} fill={`url(#${gradId})`} />

        {/* 星（夜のみ） */}
        {isNight && (
          <g>
            {Array.from({ length: expanded ? 60 : 30 }, (_, i) => {
              const x = seededRandom(i * 7) * (w - 20) + 10
              const y = seededRandom(i * 11) * (h * 0.4) + 5
              const size = seededRandom(i * 3) * 1.5 + 0.5
              const delay = seededRandom(i * 5) * 3
              return (
                <circle key={`star-${i}`} cx={x} cy={y} r={size} fill="white">
                  <animate attributeName="opacity" values="0.4;1;0.4" dur={`${2 + delay}s`} repeatCount="indefinite" />
                </circle>
              )
            })}
          </g>
        )}

        {/* 太陽/月 */}
        {(weather === 'clear' || weather === 'partly_cloudy') && (
          isNight ? (
            <g>
              <circle cx={w * 0.875} cy={h * 0.15} r={expanded ? 20 : 14} fill="#f5f5dc" opacity="0.95" />
              <circle cx={w * 0.875 - 6} cy={h * 0.15 - 3} r={expanded ? 17 : 12} fill={skyColors.top} />
              <circle cx={w * 0.875} cy={h * 0.15} r={expanded ? 28 : 20} fill="#f5f5dc" opacity="0.1">
                <animate attributeName="r" values={expanded ? '28;34;28' : '20;24;20'} dur="4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.1;0.2;0.1" dur="4s" repeatCount="indefinite" />
              </circle>
            </g>
          ) : (
            <g>
              <circle cx={w * 0.875} cy={h * 0.15} r={expanded ? 24 : 18} fill="#fff9c4" opacity="0.9" />
              <circle cx={w * 0.875} cy={h * 0.15} r={expanded ? 20 : 14} fill="#ffee58" opacity="0.8" />
            </g>
          )
        )}

        {/* 雲 */}
        <g opacity={weather === 'clear' ? (isNight ? 0.4 : 0.9) : weather === 'cloudy' || weather === 'rain' || weather === 'thunderstorm' ? 0.95 : 0.85}>
          <g>
            <animateTransform attributeName="transform" type="translate" values={`-80,0;${w + 20},0;-80,0`} dur="60s" repeatCount="indefinite" />
            <ellipse cx={w * 0.15} cy={h * 0.18} rx={25 * scaleX} ry={10 * scaleY} fill={isNight ? '#4a5568' : 'white'} />
            <ellipse cx={w * 0.22} cy={h * 0.16} rx={18 * scaleX} ry={8 * scaleY} fill={isNight ? '#4a5568' : 'white'} />
            <ellipse cx={w * 0.11} cy={h * 0.16} rx={15 * scaleX} ry={7 * scaleY} fill={isNight ? '#4a5568' : 'white'} />
          </g>
          <g>
            <animateTransform attributeName="transform" type="translate" values={`0,0;${w * 0.3},0;0,0`} dur="80s" repeatCount="indefinite" />
            <ellipse cx={w * 0.56} cy={h * 0.25} rx={20 * scaleX} ry={8 * scaleY} fill={isNight ? '#4a5568' : 'white'} />
            <ellipse cx={w * 0.61} cy={h * 0.22} rx={14 * scaleX} ry={6 * scaleY} fill={isNight ? '#4a5568' : 'white'} />
          </g>
          {(weather === 'cloudy' || weather === 'rain' || weather === 'drizzle' || weather === 'thunderstorm') && (
            <>
              <g>
                <animateTransform attributeName="transform" type="translate" values={`${w * 0.15},0;${-w * 0.15},0;${w * 0.15},0`} dur="45s" repeatCount="indefinite" />
                <ellipse cx={w * 0.31} cy={h * 0.12} rx={30 * scaleX} ry={12 * scaleY} fill={isNight ? '#3a4555' : '#e8e8e8'} />
                <ellipse cx={w * 0.39} cy={h * 0.1} rx={22 * scaleX} ry={10 * scaleY} fill={isNight ? '#4a5568' : '#f0f0f0'} />
                <ellipse cx={w * 0.25} cy={h * 0.1} rx={18 * scaleX} ry={8 * scaleY} fill={isNight ? '#3a4555' : '#e8e8e8'} />
              </g>
              <g>
                <animateTransform attributeName="transform" type="translate" values={`${-w * 0.1},0;${w * 0.2},0;${-w * 0.1},0`} dur="55s" repeatCount="indefinite" />
                <ellipse cx={w * 0.78} cy={h * 0.15} rx={28 * scaleX} ry={11 * scaleY} fill={isNight ? '#2a3545' : '#e0e0e0'} />
                <ellipse cx={w * 0.86} cy={h * 0.13} rx={20 * scaleX} ry={9 * scaleY} fill={isNight ? '#3a4555' : '#e8e8e8'} />
                <ellipse cx={w * 0.72} cy={h * 0.13} rx={16 * scaleX} ry={7 * scaleY} fill={isNight ? '#2a3545' : '#e0e0e0'} />
              </g>
            </>
          )}
        </g>

        {/* 霧 */}
        {weather === 'fog' && (
          <g opacity="0.5">
            <rect x="0" y={h * 0.375} width={w} height={h * 0.625} fill="white">
              <animate attributeName="opacity" values="0.3;0.6;0.3" dur="5s" repeatCount="indefinite" />
            </rect>
          </g>
        )}

        {/* 遠くの山 */}
        <path d={`M0 ${h * 0.56} Q${w * 0.125} ${h * 0.31} ${w * 0.25} ${h * 0.53} Q${w * 0.375} ${h * 0.375} ${w * 0.5} ${h * 0.5} Q${w * 0.625} ${h * 0.34} ${w * 0.75} ${h * 0.47} Q${w * 0.875} ${h * 0.31} ${w} ${h * 0.53} L${w} ${h * 0.625} L0 ${h * 0.625} Z`} fill={isNight ? '#2a3a2a' : '#a5d6a7'} opacity="0.5" />

        {/* 草原（奥から手前へ） */}
        <path d={`M0 ${h * 0.59} Q${w * 0.25} ${h * 0.5} ${w * 0.5} ${h * 0.56} Q${w * 0.75} ${h * 0.47} ${w} ${h * 0.55} L${w} ${h} L0 ${h} Z`} fill={isNight ? '#1a3020' : '#7cb342'} />
        <path d={`M0 ${h * 0.66} Q${w * 0.31} ${h * 0.575} ${w * 0.625} ${h * 0.625} Q${w * 0.875} ${h * 0.56} ${w} ${h * 0.61} L${w} ${h} L0 ${h} Z`} fill={isNight ? '#1f3525' : '#8bc34a'} />
        <path d={`M0 ${h * 0.75} Q${w * 0.19} ${h * 0.69} ${w * 0.5} ${h * 0.74} Q${w * 0.81} ${h * 0.675} ${w} ${h * 0.72} L${w} ${h} L0 ${h} Z`} fill={isNight ? '#243a2a' : '#9ccc65'} />
        <path d={`M0 ${h * 0.84} Q${w * 0.25} ${h * 0.8} ${w * 0.5} ${h * 0.83} Q${w * 0.75} ${h * 0.79} ${w} ${h * 0.825} L${w} ${h} L0 ${h} Z`} fill={isNight ? '#2a4030' : '#aed581'} />

        {/* 木を描画 */}
        {treePositions.map(({ user, x, depth }) => {
          const scaledX = x * scaleX
          const progress = user.progress
          const isCurrentUser = user.userId === currentUserId
          const isMvp = user.userId === mvpUserId
          const hasWater = (user.waterCount || 0) > 0
          const alreadyWatered = wateredByMeToday.includes(user.userId)
          const isWatering = wateringUserId === user.userId
          const treeScale = (0.4 + depth * 0.6) * (expanded ? 1.8 : 1)
          const baseY = (70 + depth * 60) * scaleY

          const handleTreeClick = () => {
            if (!expanded || isCurrentUser || !onWaterTree || alreadyWatered) return
            setWateringUserId(user.userId)
            setWaterAnimPos({ x: scaledX, y: baseY - 40 * treeScale })
            onWaterTree(user.userId)
            setTimeout(() => {
              setWateringUserId(null)
              setWaterAnimPos(null)
            }, 2000)
          }

          return (
            <g key={user.userId}>
              <g
                transform={`translate(${scaledX}, ${baseY}) scale(${treeScale})`}
                style={{ cursor: expanded && !isCurrentUser && !alreadyWatered ? 'pointer' : 'default' }}
                onMouseEnter={(e) => {
                  setHoveredUser(user)
                  const rect = e.currentTarget.getBoundingClientRect()
                  setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top })
                }}
                onMouseLeave={() => setHoveredUser(null)}
                onClick={handleTreeClick}
              >
                <ellipse cx="0" cy="5" rx={6 + progress / 15} ry="3" fill="#2e5016" opacity="0.3" />
                {isCurrentUser && (
                  <ellipse cx="0" cy="3" rx="20" ry="8" fill="#d46a7e" opacity="0.5" />
                )}

                {/* MVP金色グロー */}
                {isMvp && (
                  <ellipse cx="0" cy="-30" rx="28" ry="24" fill="#ffd700" opacity="0.15">
                    <animate attributeName="opacity" values="0.1;0.25;0.1" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="rx" values="26;30;26" dur="2s" repeatCount="indefinite" />
                  </ellipse>
                )}

                {/* 水やりされた木のキラキラ（青い光） */}
                {hasWater && (
                  <g>
                    <circle cx="-8" cy="-55" r="2.5" fill="#64b5f6">
                      <animate attributeName="opacity" values="0.3;0.9;0.3" dur="1.8s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="10" cy="-48" r="2" fill="#42a5f5">
                      <animate attributeName="opacity" values="0.5;1;0.5" dur="2.2s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="2" cy="-62" r="2" fill="#90caf9">
                      <animate attributeName="opacity" values="0.4;0.8;0.4" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                  </g>
                )}

                {progress > 0 && progress < 20 && (
                  <g>
                    <line x1="0" y1="0" x2="0" y2="-8" stroke="#6d4c41" strokeWidth="2" />
                    <ellipse cx="-3" cy="-10" rx="4" ry="6" fill="#7cb342" transform="rotate(-20 -3 -10)" />
                    <ellipse cx="3" cy="-10" rx="4" ry="6" fill="#8bc34a" transform="rotate(20 3 -10)" />
                  </g>
                )}
                {progress >= 20 && progress < 40 && (
                  <g>
                    <rect x="-2" y="-20" width="4" height="20" fill="#6d4c41" rx="1" />
                    <ellipse cx="0" cy="-24" rx="12" ry="10" fill="#558b2f" />
                    <ellipse cx="-6" cy="-20" rx="8" ry="6" fill="#7cb342" />
                    <ellipse cx="6" cy="-20" rx="8" ry="6" fill="#689f38" />
                    <ellipse cx="0" cy="-28" rx="8" ry="6" fill="#8bc34a" />
                  </g>
                )}
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
                {progress >= 60 && (
                  <g>
                    <rect x="-4" y="-40" width="8" height="40" fill="#4e342e" rx="2" />
                    <rect x="-2" y="-38" width="3" height="36" fill="#5d4037" rx="1" />
                    <line x1="-2" y1="-25" x2="-12" y2="-30" stroke="#5d4037" strokeWidth="3" strokeLinecap="round" />
                    <line x1="2" y1="-28" x2="12" y2="-32" stroke="#5d4037" strokeWidth="3" strokeLinecap="round" />
                    <ellipse cx="0" cy="-50" rx="20" ry="16" fill="#2e7d32" />
                    <ellipse cx="-14" cy="-40" rx="12" ry="10" fill="#388e3c" />
                    <ellipse cx="14" cy="-42" rx="12" ry="10" fill="#388e3c" />
                    <ellipse cx="0" cy="-60" rx="14" ry="12" fill="#43a047" />
                    <ellipse cx="-8" cy="-52" rx="8" ry="7" fill="#66bb6a" />
                    <ellipse cx="8" cy="-55" rx="8" ry="7" fill="#66bb6a" />
                    <ellipse cx="0" cy="-46" rx="10" ry="8" fill="#4caf50" />
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

                {/* MVP王冠 */}
                {isMvp && (
                  <g transform={`translate(0, ${progress >= 60 ? -75 : progress >= 40 ? -50 : progress >= 20 ? -35 : -18})`}>
                    <text textAnchor="middle" fontSize="14" y="0">👑</text>
                  </g>
                )}

                {/* 水やり数表示（拡大時） */}
                {expanded && (user.waterCount || 0) > 0 && (
                  <text textAnchor="middle" fontSize="8" y="18" fill="#42a5f5" fontWeight="bold">
                    💧×{user.waterCount}
                  </text>
                )}
              </g>

              {/* 水滴アニメーション */}
              {isWatering && waterAnimPos && (
                <g>
                  <text fontSize="20" x={waterAnimPos.x} y={waterAnimPos.y - 60} textAnchor="middle">
                    💧
                    <animate attributeName="y" from={waterAnimPos.y - 60} to={waterAnimPos.y + 10} dur="1s" fill="freeze" />
                    <animate attributeName="opacity" values="1;1;0" dur="2s" fill="freeze" />
                  </text>
                </g>
              )}
            </g>
          )
        })}

        {/* 手前の草 */}
        <g opacity="0.8">
          {Array.from({ length: expanded ? 20 : 10 }, (_, i) => {
            const gx = (i * (expanded ? 16 : 8) + 10) % (w - 10)
            return (
              <g key={`grass-${i}`}>
                <path d={`M${gx} ${h} Q${gx - 2} ${h - 10} ${gx} ${h - 15} Q${gx + 2} ${h - 10} ${gx} ${h}`} fill={isNight ? '#1a3020' : '#7cb342'} />
                <path d={`M${gx + 8} ${h} Q${gx + 5} ${h - 12} ${gx + 8} ${h - 20} Q${gx + 11} ${h - 12} ${gx + 8} ${h}`} fill={isNight ? '#153018' : '#689f38'} />
              </g>
            )
          })}
        </g>

        {/* 花 */}
        {[0.08, 0.25, 0.47, 0.69, 0.91].map((pct, i) => {
          const colors = [
            { normal: '#ffeb3b', night: '#ffe082' },
            { normal: '#f48fb1', night: '#f8bbd0' },
            { normal: '#fff176', night: '#fff59d' },
            { normal: '#ce93d8', night: '#e1bee7' },
            { normal: '#ffcc80', night: '#ffcc80' },
          ]
          return (
            <circle
              key={`flower-${i}`}
              cx={w * pct}
              cy={h - (expanded ? 12 : 8) - (i % 2) * 3}
              r={expanded ? 4 : 3}
              fill={isNight ? colors[i].night : colors[i].normal}
              opacity={isNight ? 0.6 : 1}
            />
          )
        })}

        {/* 雨・雪 */}
        {(weather === 'rain' || weather === 'drizzle' || weather === 'thunderstorm') && (
          <g opacity="0.7">
            {Array.from({ length: weather === 'drizzle' ? 20 : 40 }, (_, i) => (
              <line
                key={`rain-${i}`}
                x1={(i * (w / 40)) % w}
                y1={-10}
                x2={(i * (w / 40)) % w - 5}
                y2={0}
                stroke="#7ca8c6"
                strokeWidth={weather === 'drizzle' ? 1 : 1.5}
                opacity={0.6}
              >
                <animate attributeName="y1" values={`-10;${h + 10}`} dur={weather === 'drizzle' ? '1.5s' : '0.8s'} begin={`${(i * 0.1) % 2}s`} repeatCount="indefinite" />
                <animate attributeName="y2" values={`0;${h + 20}`} dur={weather === 'drizzle' ? '1.5s' : '0.8s'} begin={`${(i * 0.1) % 2}s`} repeatCount="indefinite" />
              </line>
            ))}
          </g>
        )}

        {weather === 'snow' && (
          <g>
            {Array.from({ length: 30 }, (_, i) => {
              const sx = (i * 11) % w
              return (
                <circle key={`snow-${i}`} cx={sx} cy={-10} r={2 + (i % 3)} fill="white" opacity={0.8}>
                  <animate attributeName="cy" values={`-10;${h + 10}`} dur="4s" begin={`${(i * 0.2) % 4}s`} repeatCount="indefinite" />
                  <animate attributeName="cx" values={`${sx};${sx + 20};${sx};${sx - 20};${sx}`} dur="4s" begin={`${(i * 0.2) % 4}s`} repeatCount="indefinite" />
                </circle>
              )
            })}
          </g>
        )}

        {/* 雷 */}
        {weather === 'thunderstorm' && (
          <polygon points={`${w * 0.47},0 ${w * 0.45},${h * 0.19} ${w * 0.48},${h * 0.19} ${w * 0.44},${h * 0.375} ${w * 0.5},${h * 0.15} ${w * 0.47},${h * 0.15}`} fill="#ffeb3b">
            <animate attributeName="opacity" values="0;0;1;0;0;0;0;0;1;0" dur="3s" repeatCount="indefinite" />
          </polygon>
        )}
      </svg>
    )
  }

  return (
    <div className="w-full relative">
      {forestSvg(false)}

      {/* 拡大ボタン */}
      <button
        onClick={() => setIsExpanded(true)}
        className={`absolute bottom-2 right-2 p-1.5 rounded-lg backdrop-blur-sm transition-all ${
          isNight
            ? 'bg-white/10 hover:bg-white/20 text-white/70 hover:text-white'
            : 'bg-black/10 hover:bg-black/20 text-black/50 hover:text-black/70'
        }`}
        title="森を拡大"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M10 2h4v4M6 14H2v-4M10 2L6.5 5.5M6 14l3.5-3.5" />
        </svg>
      </button>

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

      {/* フルスクリーンオーバーレイ */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-[100] flex flex-col animate-[fadeIn_0.3s_ease-out]"
          style={{ backgroundColor: skyColors.bottom }}
        >
          {/* 森が画面全体を埋める */}
          <div className="flex-1 relative flex items-center justify-center overflow-auto">
            {forestSvg(true)}

            {/* コントロール（右上） */}
            <div className="absolute top-4 right-4 flex items-center gap-3 z-10">
              {/* ミュートボタン */}
              <button
                onClick={toggleMute}
                className="p-2 rounded-full bg-black/30 backdrop-blur-sm text-white/70 hover:text-white hover:bg-black/50 transition-all"
                title={isMuted ? 'ミュート解除' : 'ミュート'}
              >
                {isMuted ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <line x1="23" y1="9" x2="17" y2="15" />
                    <line x1="17" y1="9" x2="23" y2="15" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  </svg>
                )}
              </button>

              {/* 閉じるボタン */}
              <button
                onClick={() => setIsExpanded(false)}
                className="p-2 rounded-full bg-black/30 backdrop-blur-sm text-white/70 hover:text-white hover:bg-black/50 transition-all"
                title="閉じる (ESC)"
              >
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="5" y1="5" x2="15" y2="15" />
                  <line x1="15" y1="5" x2="5" y2="15" />
                </svg>
              </button>
            </div>

            {/* 参加者数（左下） */}
            <div className="absolute bottom-4 left-4 text-sm text-white/60 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
              🌳 {activeUsers.length}本の木が育っています
            </div>
          </div>

          {/* MVPラベル */}
          {mvpUserId && (
            <div className="absolute top-4 left-4 bg-yellow-500/90 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg z-10 animate-pulse">
              🏆 今週のMVPツリー
            </div>
          )}

          {/* 拡大時のツールチップ */}
          {hoveredUser && (
            <div
              className="fixed z-[110] pointer-events-none transform -translate-x-1/2 -translate-y-full"
              style={{ left: tooltipPos.x, top: tooltipPos.y - 8 }}
            >
              <div className={`px-4 py-3 rounded-xl text-white text-sm whitespace-nowrap shadow-xl ${
                hoveredUser.userId === mvpUserId ? 'bg-gradient-to-r from-yellow-600 to-yellow-500' :
                hoveredUser.userId === currentUserId ? 'bg-[#d46a7e]' : 'bg-[#4a3f42]'
              }`}>
                <p className="font-bold text-base">
                  {hoveredUser.userId === mvpUserId && '👑 '}
                  {hoveredUser.name}
                </p>
                <p className="opacity-80">進捗: {hoveredUser.progress}%</p>
                <p className="opacity-80">投稿数: {hoveredUser.postCount}</p>
                {(hoveredUser.weeklyWaterCount || 0) > 0 && (
                  <p className="opacity-80">💧 今週: {hoveredUser.weeklyWaterCount}回</p>
                )}
                {(hoveredUser.waterBonus || 0) > 0 && (
                  <p className="text-green-200">🌱 水やりボーナス: +{hoveredUser.waterBonus}%</p>
                )}
                {hoveredUser.userId !== currentUserId && !wateredByMeToday.includes(hoveredUser.userId) && (
                  <p className="text-cyan-200 mt-1 text-xs">タップして水やり 💧</p>
                )}
                {hoveredUser.userId !== currentUserId && wateredByMeToday.includes(hoveredUser.userId) && (
                  <p className="text-cyan-200/60 mt-1 text-xs">今日は水やり済み ✓</p>
                )}
              </div>
              <div
                className={`w-0 h-0 mx-auto border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent ${
                  hoveredUser.userId === mvpUserId ? 'border-t-yellow-500' :
                  hoveredUser.userId === currentUserId ? 'border-t-[#d46a7e]' : 'border-t-[#4a3f42]'
                }`}
              />
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
