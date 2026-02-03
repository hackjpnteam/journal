'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTimeTheme } from '@/hooks/useTimeTheme'

// 統計データの型
interface LPStats {
  totalUsers: number
  totalMorningPosts: number
  totalHoursSaved: number
  totalDaysSaved: number
}

// 成長ステージの木を描画するコンポーネント
function GrowthTreeLP({ stage, isNight }: { stage: number; isNight: boolean }) {
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

function FadeInSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [isVisible, setIsVisible] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])
  return (
    <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      {children}
    </div>
  )
}

// 数字のカウントアップアニメーション
function CountUp({ end, duration = 2000, suffix = '' }: { end: number; duration?: number; suffix?: string }) {
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

export default function LandingPage() {
  const timeTheme = useTimeTheme()
  const isNight = timeTheme === 'night'
  const [currentStage, setCurrentStage] = useState(0)
  const [stats, setStats] = useState<LPStats>({ totalUsers: 0, totalMorningPosts: 0, totalHoursSaved: 0, totalDaysSaved: 0 })

  const colors = isNight
    ? {
        bg: 'bg-[#1a1625]',
        bgGradient: 'from-[#1a1625] via-[#1f1a2e] to-[#1a1625]',
        bgAlt: 'bg-[#241e30]',
        header: 'bg-[#2d2438]',
        text: 'text-white',
        textMuted: 'text-white/80',
        textFaint: 'text-white/60',
        accent: '#c9a0dc',
        accentText: 'text-[#c9a0dc]',
        accentBg: 'bg-[#9b7bb8]',
        accentHover: 'hover:bg-[#8a6aa7]',
        border: 'border-[#9b7bb8]/30',
        green: '#7a9a7d',
        greenText: 'text-[#8fbf8f]',
        cardBg: 'bg-[#2d2438]',
        cardBgLight: 'bg-[#2d2438]/50',
      }
    : {
        bg: 'bg-[#f0e8eb]',
        bgGradient: 'from-[#f0e8eb] via-[#fff5f7] to-[#f0e8eb]',
        bgAlt: 'bg-[#fff5f7]',
        header: 'bg-[#c8848e]',
        text: 'text-[#4a3f42]',
        textMuted: 'text-[#4a3f42]/70',
        textFaint: 'text-[#4a3f42]/50',
        accent: '#d46a7e',
        accentText: 'text-[#d46a7e]',
        accentBg: 'bg-[#d46a7e]',
        accentHover: 'hover:bg-[#c25a6e]',
        border: 'border-[#d46a7e]/20',
        green: '#4F6F52',
        greenText: 'text-[#4F6F52]',
        cardBg: 'bg-white',
        cardBgLight: 'bg-white/50',
      }

  useEffect(() => {
    const interval = setInterval(() => setCurrentStage((prev) => (prev + 1) % 5), 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    fetch('/api/lp-stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => {})
  }, [])

  return (
    <div className={`min-h-screen transition-colors duration-500 ${colors.bg} ${colors.text}`}>
      {/* ヘッダー */}
      <header className={`fixed top-0 left-0 right-0 z-50 ${colors.header} shadow-md transition-colors duration-500`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-serif text-lg tracking-wider text-white">
            {isNight ? '🌙' : '☀️'} 究極の朝活
          </span>
          <Link href="/login" className="px-6 py-2 bg-white/20 text-white text-sm tracking-wide hover:bg-white/30 rounded-lg transition-all duration-300">
            ログイン
          </Link>
        </div>
      </header>

      {/* ファーストビュー */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 pt-20">
        <FadeInSection>
          <h1 className={`font-serif text-3xl md:text-5xl lg:text-6xl text-center leading-relaxed tracking-wider mb-8 ${colors.text}`}>
            毎日、<span className={colors.accentText}>朝</span>を制して。
            <br />
            人生に、<span className={colors.greenText}>実</span>を咲かせよう。
          </h1>
        </FadeInSection>

        <FadeInSection delay={500}>
          <p className={`text-center text-sm md:text-base max-w-xl leading-loose tracking-wide mb-8 ${colors.textMuted}`}>
            朝15分の宣言と夜の振り返りで、
            <br />
            あなたの人生に確かな変化を。
          </p>
        </FadeInSection>

        <FadeInSection delay={800}>
          <div className="w-40 h-56 md:w-56 md:h-72 mb-8">
            <GrowthTreeLP stage={currentStage} isNight={isNight} />
          </div>
        </FadeInSection>

        <FadeInSection delay={1100}>
          <Link
            href="/login?mode=register"
            className={`inline-block px-10 py-4 ${colors.accentBg} ${colors.accentHover} text-white font-medium tracking-wider rounded-xl transition-all duration-300 shadow-lg mb-8`}
          >
            無料で始める
          </Link>
        </FadeInSection>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-px h-16 animate-pulse" style={{ background: `linear-gradient(to bottom, transparent, ${colors.accent}50, transparent)` }} />
        </div>
      </section>

      {/* 統計セクション */}
      {(stats.totalUsers > 0 || stats.totalMorningPosts > 0) && (
        <section className={`py-20 px-6 ${colors.bgAlt}`}>
          <div className="max-w-4xl mx-auto">
            <FadeInSection>
              <h2 className={`font-serif text-2xl md:text-3xl text-center mb-12 tracking-wider ${colors.text}`}>
                今、<span className={colors.accentText}>究極の朝活</span>が届けている価値
              </h2>
            </FadeInSection>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <FadeInSection delay={100}>
                <div className={`${colors.cardBg} rounded-2xl p-6 text-center shadow-sm`}>
                  <p className={`text-3xl md:text-4xl font-bold mb-2 ${colors.accentText}`}>
                    <CountUp end={stats.totalUsers} />
                  </p>
                  <p className={`text-sm ${colors.textMuted}`}>人の仲間</p>
                </div>
              </FadeInSection>

              <FadeInSection delay={200}>
                <div className={`${colors.cardBg} rounded-2xl p-6 text-center shadow-sm`}>
                  <p className={`text-3xl md:text-4xl font-bold mb-2 ${colors.greenText}`}>
                    <CountUp end={stats.totalMorningPosts} />
                  </p>
                  <p className={`text-sm ${colors.textMuted}`}>回の朝の宣言</p>
                </div>
              </FadeInSection>

              <FadeInSection delay={300}>
                <div className={`${colors.cardBg} rounded-2xl p-6 text-center shadow-sm`}>
                  <p className={`text-3xl md:text-4xl font-bold mb-2 ${colors.accentText}`}>
                    <CountUp end={stats.totalHoursSaved} suffix="+" />
                  </p>
                  <p className={`text-sm ${colors.textMuted}`}>時間の生産性向上</p>
                </div>
              </FadeInSection>

              <FadeInSection delay={400}>
                <div className={`${colors.cardBg} rounded-2xl p-6 text-center shadow-sm`}>
                  <p className={`text-3xl md:text-4xl font-bold mb-2 ${colors.greenText}`}>
                    <CountUp end={stats.totalDaysSaved} suffix="+" />
                  </p>
                  <p className={`text-sm ${colors.textMuted}`}>日分の人生を救済</p>
                </div>
              </FadeInSection>
            </div>
          </div>
        </section>
      )}

      {/* 問題提起 */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <FadeInSection>
            <p className={`text-lg md:text-xl leading-relaxed mb-8 ${colors.textMuted}`}>
              「今日も何となく1日が始まって、何となく終わった」
            </p>
            <p className={`text-lg md:text-xl leading-relaxed mb-8 ${colors.textMuted}`}>
              「やりたいことはあるのに、いつも後回しにしてしまう」
            </p>
            <p className={`text-lg md:text-xl leading-relaxed ${colors.textMuted}`}>
              「自分は変われないんじゃないか...」
            </p>
          </FadeInSection>

          <FadeInSection delay={300}>
            <p className={`font-serif text-2xl md:text-3xl mt-16 ${colors.text}`}>
              その悩み、<span className={colors.accentText}>朝の15分</span>で解決できます。
            </p>
          </FadeInSection>
        </div>
      </section>

      {/* 機能紹介 */}
      <section className={`py-24 px-6 ${colors.bgAlt}`}>
        <div className="max-w-5xl mx-auto">
          <FadeInSection>
            <h2 className={`font-serif text-2xl md:text-3xl text-center mb-4 tracking-wider ${colors.text}`}>
              究極の朝活の<span className={colors.accentText}>機能</span>
            </h2>
            <p className={`text-center text-sm mb-16 tracking-wide ${colors.textMuted}`}>
              シンプルだけど、確実に人生を変える仕組み
            </p>
          </FadeInSection>

          <div className="space-y-16">
            {/* 機能1: 朝の投稿 */}
            <FadeInSection delay={100}>
              <div className={`${colors.cardBg} rounded-3xl p-8 md:p-12 shadow-sm`}>
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="text-6xl">☀️</div>
                  <div className="flex-1">
                    <h3 className={`font-serif text-xl md:text-2xl mb-4 ${colors.text}`}>
                      Morning Journal（朝の投稿）
                    </h3>
                    <p className={`leading-relaxed mb-4 ${colors.textMuted}`}>
                      毎朝6:00〜9:00の間に、今日の自分の状態と宣言を投稿。
                      <strong className={colors.text}>「今日、何を大切にするか」</strong>を言葉にすることで、
                      1日の方向性が明確になります。
                    </p>
                    <ul className={`text-sm space-y-2 ${colors.textMuted}`}>
                      <li>✓ 今日の気分を5段階で選択</li>
                      <li>✓ 大切にしたい価値観を記入</li>
                      <li>✓ 具体的な行動目標を設定</li>
                      <li>✓ 手放したいことを明確に</li>
                    </ul>
                  </div>
                </div>
              </div>
            </FadeInSection>

            {/* 機能2: 夜の投稿 */}
            <FadeInSection delay={200}>
              <div className={`${colors.cardBg} rounded-3xl p-8 md:p-12 shadow-sm`}>
                <div className="flex flex-col md:flex-row-reverse items-center gap-8">
                  <div className="text-6xl">🌙</div>
                  <div className="flex-1 md:text-right">
                    <h3 className={`font-serif text-xl md:text-2xl mb-4 ${colors.text}`}>
                      Night Journal（夜の振り返り）
                    </h3>
                    <p className={`leading-relaxed mb-4 ${colors.textMuted}`}>
                      1日の終わりに、今日の自分を振り返る時間。
                      <strong className={colors.text}>小さな成功体験を積み重ねる</strong>ことで、
                      自己肯定感が自然と高まります。
                    </p>
                    <ul className={`text-sm space-y-2 ${colors.textMuted}`}>
                      <li>✓ 今日の誇れる選択を記録</li>
                      <li>✓ 学んだことを言語化</li>
                      <li>✓ 明日の自分へメッセージ</li>
                      <li>✓ 1日を10点満点で採点</li>
                    </ul>
                  </div>
                </div>
              </div>
            </FadeInSection>

            {/* 機能3: 成長の可視化 */}
            <FadeInSection delay={300}>
              <div className={`${colors.cardBg} rounded-3xl p-8 md:p-12 shadow-sm`}>
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="w-32 h-40">
                    <GrowthTreeLP stage={4} isNight={isNight} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-serif text-xl md:text-2xl mb-4 ${colors.text}`}>
                      Growth Tree（成長の木）
                    </h3>
                    <p className={`leading-relaxed mb-4 ${colors.textMuted}`}>
                      毎日の投稿で、あなただけの木が成長。
                      <strong className={colors.text}>月末には果実が実る</strong>喜びを体験できます。
                      毎月異なる果実テーマで、飽きずに続けられます。
                    </p>
                    <p className={`text-sm mb-4 ${colors.accentText}`}>
                      🎁 木が満開になると、ご自宅に季節にあったフルーツが届くかも！？
                    </p>
                    <div className="flex flex-wrap gap-3 text-2xl">
                      <span title="1月">🍊</span>
                      <span title="2月">🍎</span>
                      <span title="3月">🍓</span>
                      <span title="4月">🍒</span>
                      <span title="5月">🍈</span>
                      <span title="6月">🍑</span>
                      <span title="7月">🍉</span>
                      <span title="8月">🥭</span>
                      <span title="9月">🍇</span>
                      <span title="10月">🍊</span>
                      <span title="11月">🍐</span>
                      <span title="12月">🍊</span>
                    </div>
                  </div>
                </div>
              </div>
            </FadeInSection>

            {/* 機能4: OKR */}
            <FadeInSection delay={400}>
              <div className={`${colors.cardBg} rounded-3xl p-8 md:p-12 shadow-sm`}>
                <div className="flex flex-col md:flex-row-reverse items-center gap-8">
                  <div className="text-6xl">🎯</div>
                  <div className="flex-1 md:text-right">
                    <h3 className={`font-serif text-xl md:text-2xl mb-4 ${colors.text}`}>
                      週間・月間OKR
                    </h3>
                    <p className={`leading-relaxed mb-4 ${colors.textMuted}`}>
                      Googleも採用する目標管理フレームワークOKRで、
                      <strong className={colors.text}>大きな目標を小さな行動に分解</strong>。
                      進捗を可視化しながら、確実に前進できます。
                    </p>
                    <ul className={`text-sm space-y-2 ${colors.textMuted}`}>
                      <li>✓ 週間・月間の目標設定</li>
                      <li>✓ Key Resultsの進捗管理</li>
                      <li>✓ フォーカスポイントの明確化</li>
                    </ul>
                  </div>
                </div>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* 特徴 */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <FadeInSection>
            <h2 className={`font-serif text-2xl md:text-3xl text-center mb-16 tracking-wider ${colors.text}`}>
              <span className={colors.accentText}>究極の朝活</span>が大切にすること
            </h2>
          </FadeInSection>

          <div className="grid md:grid-cols-3 gap-8">
            <FadeInSection delay={100}>
              <div className={`${colors.cardBg} rounded-2xl p-8 text-center shadow-sm h-full`}>
                <div className="text-4xl mb-4">🙅</div>
                <h3 className={`font-serif text-lg mb-3 ${colors.text}`}>比較しない</h3>
                <p className={`text-sm leading-relaxed ${colors.textMuted}`}>
                  ランキングも他人の進捗も表示しません。
                  SNSの「いいね」疲れから解放され、
                  自分だけの成長に集中できます。
                </p>
              </div>
            </FadeInSection>

            <FadeInSection delay={200}>
              <div className={`${colors.cardBg} rounded-2xl p-8 text-center shadow-sm h-full`}>
                <div className="text-4xl mb-4">🌱</div>
                <h3 className={`font-serif text-lg mb-3 ${colors.text}`}>静かな達成感</h3>
                <p className={`text-sm leading-relaxed ${colors.textMuted}`}>
                  派手な通知や報酬ではなく、
                  木が少しずつ育つ静かな喜び。
                  本当に意味のある変化は静かに訪れます。
                </p>
              </div>
            </FadeInSection>

            <FadeInSection delay={300}>
              <div className={`${colors.cardBg} rounded-2xl p-8 text-center shadow-sm h-full`}>
                <div className="text-4xl mb-4">⏰</div>
                <h3 className={`font-serif text-lg mb-3 ${colors.text}`}>朝の時間限定</h3>
                <p className={`text-sm leading-relaxed ${colors.textMuted}`}>
                  投稿は朝6時〜9時の3時間限定。
                  この制約が「朝起きる理由」になり、
                  自然と早起き習慣が身につきます。
                </p>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={`py-24 px-6 ${colors.bgAlt}`}>
        <div className="max-w-2xl mx-auto text-center">
          <FadeInSection>
            <h2 className={`font-serif text-2xl md:text-3xl mb-6 tracking-wider ${colors.text}`}>
              明日の朝から、始めよう。
            </h2>
            <p className={`text-sm mb-8 tracking-wide ${colors.textMuted}`}>
              あなたの木が、最初の芽を出す日。
            </p>
          </FadeInSection>

          <FadeInSection delay={200}>
            <Link
              href="/login?mode=register"
              className={`inline-block px-12 py-4 ${colors.accentBg} ${colors.accentHover} text-white font-medium tracking-wider rounded-xl transition-all duration-300 shadow-lg`}
            >
              無料で始める
            </Link>
          </FadeInSection>
        </div>
      </section>

      {/* フッター */}
      <footer className={`py-12 px-6 border-t ${colors.border}`}>
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className={`font-serif text-sm tracking-wider ${colors.accentText}`}>究極の朝活</span>
          <div className={`flex items-center gap-6 text-xs ${colors.textMuted}`}>
            <Link href="/concept" className="hover:opacity-80 transition">コンセプト</Link>
            <Link href="/login" className="hover:opacity-80 transition">ログイン</Link>
            <Link href="/login?mode=register" className="hover:opacity-80 transition">新規登録</Link>
          </div>
          <span className={`text-xs ${colors.textFaint}`}>© 2024 Ultimate Morning</span>
        </div>
      </footer>
    </div>
  )
}
