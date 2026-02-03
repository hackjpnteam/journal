'use client'

interface MiniTreeProps {
  progress: number // 0-100
  size?: number
}

export function MiniTree({ progress, size = 40 }: MiniTreeProps) {
  // 果物の数
  const fruitCount = progress >= 100 ? 3 : progress >= 80 ? 2 : progress >= 60 ? 1 : 0

  // 果物の色（2月はりんご）
  const fruitColor = '#e53935'

  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      {/* 地面 */}
      <ellipse cx="20" cy="38" rx="12" ry="3" fill="#8bc34a" opacity="0.5" />

      {/* 種（0%） */}
      {progress === 0 && (
        <ellipse cx="20" cy="35" rx="3" ry="2" fill="#5D3A1A" />
      )}

      {/* 芽（1-19%） */}
      {progress > 0 && progress < 20 && (
        <g>
          <line x1="20" y1="36" x2="20" y2="28" stroke="#8B4513" strokeWidth="2" />
          <ellipse cx="18" cy="26" rx="3" ry="5" fill="#8bc34a" transform="rotate(-20 18 26)" />
          <ellipse cx="22" cy="26" rx="3" ry="5" fill="#a5d6a7" transform="rotate(20 22 26)" />
        </g>
      )}

      {/* 小さな木（20-39%） */}
      {progress >= 20 && progress < 40 && (
        <g>
          <line x1="20" y1="36" x2="20" y2="18" stroke="#8B4513" strokeWidth="3" />
          <ellipse cx="20" cy="16" rx="8" ry="6" fill="#8bc34a" />
          <ellipse cx="16" cy="20" rx="5" ry="4" fill="#81c784" />
          <ellipse cx="24" cy="20" rx="5" ry="4" fill="#81c784" />
        </g>
      )}

      {/* 成長した木（40-59%） */}
      {progress >= 40 && progress < 60 && (
        <g>
          <line x1="20" y1="36" x2="20" y2="14" stroke="#8B4513" strokeWidth="3" />
          <ellipse cx="20" cy="12" rx="10" ry="8" fill="#66bb6a" />
          <ellipse cx="14" cy="18" rx="6" ry="5" fill="#81c784" />
          <ellipse cx="26" cy="18" rx="6" ry="5" fill="#81c784" />
          <ellipse cx="20" cy="8" rx="6" ry="5" fill="#81c784" />
        </g>
      )}

      {/* 立派な木（60%以上） */}
      {progress >= 60 && (
        <g>
          <line x1="20" y1="36" x2="20" y2="12" stroke="#8B4513" strokeWidth="4" />
          {/* 枝 */}
          <line x1="20" y1="20" x2="12" y2="18" stroke="#8B4513" strokeWidth="2" />
          <line x1="20" y1="20" x2="28" y2="18" stroke="#8B4513" strokeWidth="2" />
          {/* 葉 */}
          <ellipse cx="20" cy="10" rx="12" ry="9" fill="#43a047" />
          <ellipse cx="12" cy="16" rx="7" ry="6" fill="#66bb6a" />
          <ellipse cx="28" cy="16" rx="7" ry="6" fill="#66bb6a" />
          <ellipse cx="20" cy="6" rx="8" ry="6" fill="#81c784" />

          {/* 果物 */}
          {fruitCount >= 1 && (
            <circle cx="15" cy="14" r="3" fill={fruitColor} />
          )}
          {fruitCount >= 2 && (
            <circle cx="25" cy="12" r="3" fill={fruitColor} />
          )}
          {fruitCount >= 3 && (
            <circle cx="20" cy="18" r="3" fill={fruitColor} />
          )}
        </g>
      )}
    </svg>
  )
}
