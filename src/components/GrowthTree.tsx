'use client'

interface GrowthTreeProps {
  progress: number // 0-100 (今月の投稿率)
  postsCount: number
  daysInMonth: number
  isNight?: boolean
}

// 月ごとのテーマ設定（すべて果物）
const MONTHLY_THEMES: Record<number, {
  name: string
  fruit: string
  fruitColor: string
  fruitHighlight: string
  leafColors: [string, string, string]
  completeMessage: string
  almostMessage: string
}> = {
  1: { // 1月: みかん
    name: 'みかん',
    fruit: 'みかん',
    fruitColor: '#ff9800',
    fruitHighlight: '#ffe0b2',
    leafColors: ['#66bb6a', '#43a047', '#81c784'],
    completeMessage: 'みかんがたくさん実った!',
    almostMessage: 'みかんが色づいてきた...',
  },
  2: { // 2月: りんご
    name: 'りんご',
    fruit: 'りんご',
    fruitColor: '#e53935',
    fruitHighlight: '#ffcdd2',
    leafColors: ['#66bb6a', '#43a047', '#81c784'],
    completeMessage: 'りんごがたくさん実った!',
    almostMessage: 'りんごが赤くなってきた...',
  },
  3: { // 3月: いちご
    name: 'いちご',
    fruit: 'いちご',
    fruitColor: '#e53935',
    fruitHighlight: '#ffcdd2',
    leafColors: ['#a5d6a7', '#81c784', '#c8e6c9'],
    completeMessage: 'いちごが甘く実った!',
    almostMessage: 'いちごが赤くなってきた...',
  },
  4: { // 4月: さくらんぼ
    name: 'さくらんぼ',
    fruit: 'さくらんぼ',
    fruitColor: '#c62828',
    fruitHighlight: '#ef9a9a',
    leafColors: ['#66bb6a', '#4caf50', '#81c784'],
    completeMessage: 'さくらんぼがたくさん実った!',
    almostMessage: 'さくらんぼが実りそう...',
  },
  5: { // 5月: メロン
    name: 'メロン',
    fruit: 'メロン',
    fruitColor: '#8bc34a',
    fruitHighlight: '#dcedc8',
    leafColors: ['#43a047', '#2e7d32', '#66bb6a'],
    completeMessage: '甘いメロンが実った!',
    almostMessage: 'メロンが大きくなってきた...',
  },
  6: { // 6月: もも
    name: 'もも',
    fruit: 'もも',
    fruitColor: '#ffab91',
    fruitHighlight: '#fbe9e7',
    leafColors: ['#4caf50', '#388e3c', '#66bb6a'],
    completeMessage: 'ももがたくさん実った!',
    almostMessage: 'ももが甘くなりそう...',
  },
  7: { // 7月: すいか
    name: 'すいか',
    fruit: 'すいか',
    fruitColor: '#4caf50',
    fruitHighlight: '#a5d6a7',
    leafColors: ['#66bb6a', '#4caf50', '#8bc34a'],
    completeMessage: '大きなすいかが実った!',
    almostMessage: 'すいかが大きくなってきた...',
  },
  8: { // 8月: マンゴー
    name: 'マンゴー',
    fruit: 'マンゴー',
    fruitColor: '#ffb300',
    fruitHighlight: '#ffecb3',
    leafColors: ['#558b2f', '#33691e', '#689f38'],
    completeMessage: 'マンゴーがたくさん実った!',
    almostMessage: 'マンゴーが熟してきた...',
  },
  9: { // 9月: ぶどう
    name: 'ぶどう',
    fruit: 'ぶどう',
    fruitColor: '#7b1fa2',
    fruitHighlight: '#ce93d8',
    leafColors: ['#8bc34a', '#689f38', '#9ccc65'],
    completeMessage: 'ぶどうがたわわに実った!',
    almostMessage: 'ぶどうが色づいてきた...',
  },
  10: { // 10月: 柿
    name: '柿',
    fruit: '柿',
    fruitColor: '#ff7043',
    fruitHighlight: '#ffccbc',
    leafColors: ['#8bc34a', '#689f38', '#aed581'],
    completeMessage: '柿がたくさん実った!',
    almostMessage: '柿が色づいてきた...',
  },
  11: { // 11月: 洋梨
    name: '洋梨',
    fruit: '洋梨',
    fruitColor: '#c0ca33',
    fruitHighlight: '#f0f4c3',
    leafColors: ['#ff7043', '#f4511e', '#ffab91'],
    completeMessage: '洋梨がたくさん実った!',
    almostMessage: '洋梨が熟してきた...',
  },
  12: { // 12月: みかん（冬みかん）
    name: '冬みかん',
    fruit: 'みかん',
    fruitColor: '#ff9800',
    fruitHighlight: '#ffe0b2',
    leafColors: ['#2e7d32', '#1b5e20', '#388e3c'],
    completeMessage: '冬みかんがたくさん実った!',
    almostMessage: 'みかんがオレンジ色に...',
  },
}

export function GrowthTree({ progress, postsCount, daysInMonth, isNight = false }: GrowthTreeProps) {
  const currentMonth = new Date().getMonth() + 1
  const theme = MONTHLY_THEMES[currentMonth]

  const getStageMessage = () => {
    if (progress >= 100) return { title: 'おめでとう!', subtitle: theme.completeMessage }
    if (progress >= 90) return { title: 'すごい!', subtitle: `${theme.fruit}がたくさん!` }
    if (progress >= 80) return { title: 'やった!', subtitle: `${theme.fruit}が見えてきた!` }
    if (progress >= 60) return { title: 'いい感じ!', subtitle: theme.almostMessage }
    if (progress >= 40) return { title: '順調!', subtitle: '葉っぱがモリモリ増えてきた!' }
    if (progress >= 20) return { title: 'おっ!', subtitle: '木らしくなってきた!' }
    if (progress > 0) return { title: 'スタート!', subtitle: '小さな芽が出てきた!' }
    return { title: 'さあ始めよう!', subtitle: '種を植えて木を育てよう' }
  }

  // りんご（実）の数
  const fruitCount = progress >= 100 ? 8 : progress >= 90 ? 5 : progress >= 80 ? 3 : 0

  // 実の位置
  const fruitPositions = [
    { x: 70, y: 85 },
    { x: 130, y: 80 },
    { x: 100, y: 65 },
    { x: 55, y: 105 },
    { x: 145, y: 100 },
    { x: 85, y: 50 },
    { x: 115, y: 55 },
    { x: 95, y: 95 },
  ]

  // 果物の描画（月によって異なる）
  const renderFruit = (pos: { x: number; y: number }, i: number) => {
    // いちごの場合（3月）
    if (currentMonth === 3) {
      return (
        <g key={`fruit-${i}`}>
          <ellipse cx={pos.x + 2} cy={pos.y + 10} rx="5" ry="2" fill="#000" opacity="0.1" />
          <path
            d={`M${pos.x} ${pos.y - 8} Q${pos.x - 8} ${pos.y} ${pos.x} ${pos.y + 10} Q${pos.x + 8} ${pos.y} ${pos.x} ${pos.y - 8}`}
            fill={theme.fruitColor}
          >
            <animate attributeName="d"
              values={`M${pos.x} ${pos.y - 8} Q${pos.x - 8} ${pos.y} ${pos.x} ${pos.y + 10} Q${pos.x + 8} ${pos.y} ${pos.x} ${pos.y - 8};M${pos.x} ${pos.y - 7} Q${pos.x - 8} ${pos.y} ${pos.x} ${pos.y + 11} Q${pos.x + 8} ${pos.y} ${pos.x} ${pos.y - 7};M${pos.x} ${pos.y - 8} Q${pos.x - 8} ${pos.y} ${pos.x} ${pos.y + 10} Q${pos.x + 8} ${pos.y} ${pos.x} ${pos.y - 8}`}
              dur={`${2.5 + i * 0.3}s`}
              repeatCount="indefinite"
            />
          </path>
          {/* いちごの種 */}
          <circle cx={pos.x - 3} cy={pos.y - 2} r="1" fill="#ffeb3b" />
          <circle cx={pos.x + 3} cy={pos.y - 2} r="1" fill="#ffeb3b" />
          <circle cx={pos.x} cy={pos.y + 3} r="1" fill="#ffeb3b" />
          {/* へた */}
          <path d={`M${pos.x - 4} ${pos.y - 10} L${pos.x} ${pos.y - 7} L${pos.x + 4} ${pos.y - 10}`} fill="#4caf50" />
        </g>
      )
    }

    // さくらんぼの場合（4月）
    if (currentMonth === 4) {
      return (
        <g key={`fruit-${i}`}>
          {/* 茎 */}
          <path d={`M${pos.x - 5} ${pos.y} Q${pos.x} ${pos.y - 15} ${pos.x + 5} ${pos.y}`} stroke="#5D3A1A" strokeWidth="2" fill="none" />
          {/* 2つのさくらんぼ */}
          <circle cx={pos.x - 5} cy={pos.y + 2} r="7" fill={theme.fruitColor}>
            <animate attributeName="cy" values={`${pos.y + 2};${pos.y + 3};${pos.y + 2}`} dur={`${2.5 + i * 0.3}s`} repeatCount="indefinite" />
          </circle>
          <circle cx={pos.x + 5} cy={pos.y + 2} r="7" fill={theme.fruitColor}>
            <animate attributeName="cy" values={`${pos.y + 2};${pos.y + 4};${pos.y + 2}`} dur={`${2.8 + i * 0.3}s`} repeatCount="indefinite" />
          </circle>
          <circle cx={pos.x - 7} cy={pos.y - 1} r="2" fill={theme.fruitHighlight} opacity="0.6" />
          <circle cx={pos.x + 3} cy={pos.y - 1} r="2" fill={theme.fruitHighlight} opacity="0.6" />
        </g>
      )
    }

    // メロンの場合（5月）
    if (currentMonth === 5) {
      return (
        <g key={`fruit-${i}`}>
          <ellipse cx={pos.x + 2} cy={pos.y + 12} rx="6" ry="3" fill="#000" opacity="0.1" />
          <ellipse cx={pos.x} cy={pos.y} rx="11" ry="10" fill={theme.fruitColor}>
            <animate attributeName="ry" values="10;11;10" dur={`${3 + i * 0.3}s`} repeatCount="indefinite" />
          </ellipse>
          {/* メロンの網目模様 */}
          <path d={`M${pos.x - 8} ${pos.y} Q${pos.x} ${pos.y - 5} ${pos.x + 8} ${pos.y}`} stroke="#689f38" strokeWidth="1" fill="none" opacity="0.5" />
          <path d={`M${pos.x - 8} ${pos.y + 3} Q${pos.x} ${pos.y + 8} ${pos.x + 8} ${pos.y + 3}`} stroke="#689f38" strokeWidth="1" fill="none" opacity="0.5" />
          <path d={`M${pos.x} ${pos.y - 10} L${pos.x} ${pos.y + 10}`} stroke="#689f38" strokeWidth="1" opacity="0.4" />
        </g>
      )
    }

    // すいかの場合（7月）
    if (currentMonth === 7) {
      return (
        <g key={`fruit-${i}`}>
          <ellipse cx={pos.x + 2} cy={pos.y + 12} rx="8" ry="3" fill="#000" opacity="0.1" />
          <ellipse cx={pos.x} cy={pos.y} rx="12" ry="10" fill={theme.fruitColor} />
          {/* すいかの縞模様 */}
          <path d={`M${pos.x - 4} ${pos.y - 10} Q${pos.x - 4} ${pos.y} ${pos.x - 4} ${pos.y + 10}`} stroke="#2e7d32" strokeWidth="3" fill="none" opacity="0.6" />
          <path d={`M${pos.x + 4} ${pos.y - 10} Q${pos.x + 4} ${pos.y} ${pos.x + 4} ${pos.y + 10}`} stroke="#2e7d32" strokeWidth="3" fill="none" opacity="0.6" />
        </g>
      )
    }

    // ぶどうの場合（9月）
    if (currentMonth === 9) {
      return (
        <g key={`fruit-${i}`}>
          <path d={`M${pos.x} ${pos.y - 15} L${pos.x} ${pos.y - 8}`} stroke="#5D3A1A" strokeWidth="2" />
          {/* ぶどうの粒 */}
          <circle cx={pos.x} cy={pos.y - 5} r="5" fill={theme.fruitColor} />
          <circle cx={pos.x - 5} cy={pos.y} r="5" fill={theme.fruitColor} />
          <circle cx={pos.x + 5} cy={pos.y} r="5" fill={theme.fruitColor} />
          <circle cx={pos.x - 3} cy={pos.y + 6} r="5" fill={theme.fruitColor} />
          <circle cx={pos.x + 3} cy={pos.y + 6} r="5" fill={theme.fruitColor} />
          <circle cx={pos.x} cy={pos.y + 10} r="4" fill={theme.fruitColor} />
          {/* ハイライト */}
          <circle cx={pos.x - 2} cy={pos.y - 6} r="1.5" fill={theme.fruitHighlight} opacity="0.6" />
        </g>
      )
    }

    // 柿の場合（10月）
    if (currentMonth === 10) {
      return (
        <g key={`fruit-${i}`}>
          <ellipse cx={pos.x + 2} cy={pos.y + 11} rx="6" ry="3" fill="#000" opacity="0.1" />
          <ellipse cx={pos.x} cy={pos.y} rx="11" ry="10" fill={theme.fruitColor}>
            <animate attributeName="cy" values={`${pos.y};${pos.y + 1.5};${pos.y}`} dur={`${2.5 + i * 0.3}s`} repeatCount="indefinite" />
          </ellipse>
          <circle cx={pos.x - 3} cy={pos.y - 4} r="3" fill={theme.fruitHighlight} opacity="0.5" />
          {/* へた */}
          <rect x={pos.x - 6} y={pos.y - 13} width="12" height="4" fill="#4caf50" rx="1" />
          <rect x={pos.x - 1} y={pos.y - 16} width="2" height="4" fill="#5D3A1A" />
        </g>
      )
    }

    // みかんの場合（1月、12月）
    if (currentMonth === 1 || currentMonth === 12) {
      return (
        <g key={`fruit-${i}`}>
          <ellipse cx={pos.x + 2} cy={pos.y + 10} rx="6" ry="3" fill="#000" opacity="0.1" />
          <circle cx={pos.x} cy={pos.y} r="10" fill={theme.fruitColor}>
            <animate attributeName="cy" values={`${pos.y};${pos.y + 1.5};${pos.y}`} dur={`${2.5 + i * 0.3}s`} repeatCount="indefinite" />
          </circle>
          {/* みかんの質感 */}
          <circle cx={pos.x - 3} cy={pos.y - 3} r="3" fill={theme.fruitHighlight} opacity="0.5" />
          {/* へた */}
          <ellipse cx={pos.x} cy={pos.y - 10} rx="3" ry="2" fill="#4caf50" />
        </g>
      )
    }

    // デフォルト（りんご型の実）- 2月、6月、8月、11月など
    return (
      <g key={`fruit-${i}`}>
        <ellipse cx={pos.x + 2} cy={pos.y + 10} rx="6" ry="3" fill="#000" opacity="0.1" />
        <circle cx={pos.x} cy={pos.y} r="10" fill={theme.fruitColor}>
          <animate
            attributeName="cy"
            values={`${pos.y};${pos.y + 1.5};${pos.y}`}
            dur={`${2.5 + i * 0.3}s`}
            repeatCount="indefinite"
          />
        </circle>
        <circle cx={pos.x - 3} cy={pos.y - 4} r="3" fill={theme.fruitHighlight} opacity="0.7" />
        <path
          d={`M${pos.x} ${pos.y - 10} Q${pos.x + 2} ${pos.y - 14} ${pos.x + 3} ${pos.y - 15}`}
          stroke="#5D3A1A"
          strokeWidth="2"
          fill="none"
        />
        <ellipse
          cx={pos.x + 5}
          cy={pos.y - 13}
          rx="4"
          ry="2"
          fill="#66bb6a"
          transform={`rotate(30 ${pos.x + 5} ${pos.y - 13})`}
        />
      </g>
    )
  }

  return (
    <div className="flex flex-col items-center">
      <svg width="200" height="220" viewBox="0 0 200 220">
        {/* 背景のグラデーション（空） */}
        <defs>
          <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isNight ? '#1a1625' : '#e3f2fd'} />
            <stop offset="100%" stopColor={isNight ? '#2d2438' : '#f0e8eb'} />
          </linearGradient>
          <linearGradient id="leafGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={theme.leafColors[0]} />
            <stop offset="100%" stopColor={theme.leafColors[1]} />
          </linearGradient>
          <linearGradient id="leafGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={theme.leafColors[2]} />
            <stop offset="100%" stopColor={theme.leafColors[0]} />
          </linearGradient>
          <linearGradient id="leafGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={theme.leafColors[1]} />
            <stop offset="100%" stopColor={theme.leafColors[2]} />
          </linearGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="2" stdDeviation="2" floodOpacity="0.2"/>
          </filter>
        </defs>

        {/* 背景 */}
        <rect width="200" height="220" fill="url(#skyGradient)" rx="12" />

        {/* 地面（草） */}
        <ellipse cx="100" cy="210" rx="90" ry="20" fill={isNight ? '#2e5d32' : '#8bc34a'} />
        <ellipse cx="100" cy="208" rx="85" ry="15" fill={isNight ? '#3d7a42' : '#9ccc65'} />

        {/* 小さな草 */}
        {progress >= 20 && (
          <>
            <path d="M30 205 Q32 195 30 190 Q28 195 30 205" fill="#7cb342" />
            <path d="M35 205 Q38 192 35 185 Q32 192 35 205" fill="#8bc34a" />
            <path d="M165 205 Q167 195 165 190 Q163 195 165 205" fill="#7cb342" />
            <path d="M170 205 Q173 192 170 185 Q167 192 170 205" fill="#8bc34a" />
          </>
        )}

        {/* 種（0%の時） */}
        {progress === 0 && (
          <ellipse cx="100" cy="195" rx="8" ry="5" fill="#5D3A1A" />
        )}

        {/* 小さな芽（1-19%） */}
        {progress > 0 && progress < 20 && (
          <g>
            <path d="M100 195 L100 175" stroke="#8B4513" strokeWidth="3" />
            <path d="M100 180 Q95 170 90 175 Q95 172 100 180" fill="#8bc34a" />
            <path d="M100 180 Q105 170 110 175 Q105 172 100 180" fill="#a5d6a7" />
          </g>
        )}

        {/* 木（20%以上） */}
        {progress >= 20 && (
          <g filter="url(#shadow)">
            {/* 幹 */}
            <path
              d="M92 205 L92 140 Q92 130 100 125 Q108 130 108 140 L108 205"
              fill="#8B4513"
            />
            <path
              d="M95 205 L95 145 Q95 135 100 130 Q105 135 105 145 L105 205"
              fill="#a1887f"
            />

            {/* 枝 */}
            <g stroke="#8B4513" strokeWidth="6" strokeLinecap="round" fill="none">
              <path d="M97 160 Q75 150 55 155" />
              <path d="M96 140 Q70 125 50 130" />
              <path d="M103 155 Q125 145 145 150" />
              <path d="M104 135 Q130 120 150 125" />
              <path d="M100 125 Q100 100 100 80" />
              <path d="M100 100 Q85 85 70 90" />
              <path d="M100 100 Q115 85 130 90" />
            </g>

            {/* 細い枝 */}
            <g stroke="#a1887f" strokeWidth="3" strokeLinecap="round" fill="none">
              <path d="M55 155 Q45 150 40 155" />
              <path d="M50 130 Q40 125 35 130" />
              <path d="M145 150 Q155 145 160 150" />
              <path d="M150 125 Q160 120 165 125" />
              <path d="M70 90 Q60 85 55 90" />
              <path d="M130 90 Q140 85 145 90" />
              <path d="M100 80 Q100 65 100 55" />
            </g>
          </g>
        )}

        {/* 葉っぱの塊（40%以上） */}
        {progress >= 40 && (
          <g>
            <ellipse cx="55" cy="145" rx="25" ry="20" fill="url(#leafGradient1)" opacity="0.9" />
            <ellipse cx="145" cy="140" rx="25" ry="20" fill="url(#leafGradient1)" opacity="0.9" />
            <ellipse cx="50" cy="120" rx="22" ry="18" fill="url(#leafGradient2)" opacity="0.85" />
            <ellipse cx="150" cy="115" rx="22" ry="18" fill="url(#leafGradient2)" opacity="0.85" />
          </g>
        )}

        {/* もっと葉っぱ（60%以上） */}
        {progress >= 60 && (
          <g>
            <ellipse cx="70" cy="100" rx="28" ry="22" fill="url(#leafGradient2)" opacity="0.9" />
            <ellipse cx="130" cy="95" rx="28" ry="22" fill="url(#leafGradient2)" opacity="0.9" />
            <ellipse cx="100" cy="85" rx="30" ry="25" fill="url(#leafGradient1)" opacity="0.9" />
            <ellipse cx="55" cy="110" rx="20" ry="15" fill="url(#leafGradient3)" opacity="0.8" />
            <ellipse cx="145" cy="105" rx="20" ry="15" fill="url(#leafGradient3)" opacity="0.8" />
          </g>
        )}

        {/* さらに葉っぱ（80%以上） */}
        {progress >= 80 && (
          <g>
            <ellipse cx="100" cy="60" rx="35" ry="28" fill="url(#leafGradient1)" opacity="0.95" />
            <ellipse cx="75" cy="75" rx="25" ry="20" fill="url(#leafGradient2)" opacity="0.9" />
            <ellipse cx="125" cy="70" rx="25" ry="20" fill="url(#leafGradient2)" opacity="0.9" />
            <ellipse cx="60" cy="90" rx="18" ry="14" fill="url(#leafGradient3)" opacity="0.85" />
            <ellipse cx="140" cy="85" rx="18" ry="14" fill="url(#leafGradient3)" opacity="0.85" />
            <ellipse cx="100" cy="45" rx="25" ry="18" fill="url(#leafGradient2)" opacity="0.9" />
            <ellipse cx="90" cy="55" rx="10" ry="8" fill="#c8e6c9" opacity="0.5" />
            <ellipse cx="115" cy="70" rx="8" ry="6" fill="#c8e6c9" opacity="0.4" />
          </g>
        )}

        {/* 100%の時の追加の葉っぱ */}
        {progress >= 100 && (
          <g>
            <ellipse cx="85" cy="40" rx="20" ry="15" fill="url(#leafGradient1)" opacity="0.9" />
            <ellipse cx="115" cy="38" rx="20" ry="15" fill="url(#leafGradient2)" opacity="0.9" />
            <ellipse cx="100" cy="32" rx="22" ry="16" fill="url(#leafGradient3)" opacity="0.85" />
            <ellipse cx="65" cy="70" rx="15" ry="12" fill="url(#leafGradient1)" opacity="0.8" />
            <ellipse cx="135" cy="65" rx="15" ry="12" fill="url(#leafGradient2)" opacity="0.8" />
            {/* キラキラ */}
            <circle cx="70" cy="50" r="2" fill="#fff9c4" opacity="0.8">
              <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="130" cy="55" r="2" fill="#fff9c4" opacity="0.6">
              <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="100" cy="35" r="2.5" fill="#fff9c4" opacity="0.9">
              <animate attributeName="opacity" values="0.9;0.4;0.9" dur="1.8s" repeatCount="indefinite" />
            </circle>
          </g>
        )}

        {/* 小さな葉っぱ（20-40%） */}
        {progress >= 20 && progress < 40 && (
          <g>
            <ellipse cx="70" cy="100" rx="15" ry="10" fill={theme.leafColors[0]} opacity="0.8" />
            <ellipse cx="130" cy="95" rx="15" ry="10" fill={theme.leafColors[1]} opacity="0.8" />
            <ellipse cx="100" cy="80" rx="18" ry="12" fill={theme.leafColors[2]} opacity="0.8" />
            <ellipse cx="55" cy="145" rx="12" ry="8" fill={theme.leafColors[0]} opacity="0.7" />
            <ellipse cx="145" cy="140" rx="12" ry="8" fill={theme.leafColors[1]} opacity="0.7" />
          </g>
        )}

        {/* 実/花 */}
        {fruitPositions.slice(0, fruitCount).map((pos, i) => renderFruit(pos, i))}

        {/* 小鳥（100%の時） */}
        {progress >= 100 && (
          <g>
            <ellipse cx="45" cy="70" rx="6" ry="5" fill="#ffcc80" />
            <circle cx="42" cy="68" r="4" fill="#ffe0b2" />
            <circle cx="41" cy="67" r="1" fill="#5D3A1A" />
            <path d="M38 68 L35 67 L38 69" fill="#ff8a65" />
            <path d="M48 72 L52 74 L48 73" fill="#ffcc80" />
          </g>
        )}
      </svg>

      {/* 月のテーマ表示 */}
      <div className={`text-xs mt-1 ${isNight ? 'text-white/50' : 'text-[#4a3f42]/50'}`}>
        {currentMonth}月のテーマ: {theme.name}
      </div>

      {/* メッセージ */}
      {(() => {
        const message = getStageMessage()
        return (
          <div className="text-center mt-2">
            <p className={`text-lg font-bold ${progress >= 100 ? 'text-[#e53935]' : 'text-[#4caf50]'}`}>
              {message.title}
            </p>
            <p className={`text-sm mt-0.5 ${isNight ? 'text-white' : 'text-[#4a3f42]'}`}>{message.subtitle}</p>
            <p className={`text-sm mt-2 ${isNight ? 'text-white/60' : 'text-[#4a3f42]/60'}`}>
              今月 <span className="font-bold text-[#4caf50]">{postsCount}</span>/{daysInMonth} 日投稿
            </p>
            <div className={`w-40 h-2.5 rounded-full mt-3 overflow-hidden border mx-auto ${
              isNight ? 'bg-[#1a2e1a] border-[#2e5d32]' : 'bg-[#e8f5e9] border-[#c8e6c9]'
            }`}>
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  progress >= 100
                    ? 'bg-gradient-to-r from-[#e53935] via-[#ef5350] to-[#c62828]'
                    : 'bg-gradient-to-r from-[#8bc34a] via-[#4caf50] to-[#2e7d32]'
                }`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <p className={`text-xs mt-1 ${isNight ? 'text-white/50' : 'text-[#4a3f42]/50'}`}>{progress}% 達成</p>
          </div>
        )
      })()}
    </div>
  )
}
