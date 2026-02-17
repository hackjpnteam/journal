import Link from 'next/link'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'
import { DailyShare } from '@/models/DailyShare'
import { FadeInSection, CountUp, AnimatedTree, GrowthTreeLP } from './LPClient'

// 5分間キャッシュ
export const revalidate = 300

async function getLPStats() {
  try {
    await connectDB()
    const totalUsers = await User.countDocuments({
      email: { $not: /sample|test|example|demo/i },
    })
    const totalMorningPosts = await DailyShare.countDocuments()
    const hoursSavedPerPost = 2
    const totalHoursSaved = totalMorningPosts * hoursSavedPerPost
    const totalDaysSaved = Math.round(totalHoursSaved / 24)
    return { totalUsers, totalMorningPosts, totalHoursSaved, totalDaysSaved }
  } catch {
    return { totalUsers: 0, totalMorningPosts: 0, totalHoursSaved: 0, totalDaysSaved: 0 }
  }
}

// デフォルトはデイモード（サーバー側では時刻判定しない、CSSで対応）
const colors = {
  bg: 'bg-[#f0e8eb]',
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
  greenText: 'text-[#4F6F52]',
  cardBg: 'bg-white',
}

// ナイトモード用CSS（body.night-mode で切り替え）
const nightColors = {
  bg: 'night-mode:bg-[#1a1625]',
  bgAlt: 'night-mode:bg-[#241e30]',
  header: 'night-mode:bg-[#2d2438]',
  text: 'night-mode:text-white',
  textMuted: 'night-mode:text-white/80',
  accentText: 'night-mode:text-[#c9a0dc]',
  accentBg: 'night-mode:bg-[#9b7bb8]',
  greenText: 'night-mode:text-[#8fbf8f]',
  cardBg: 'night-mode:bg-[#2d2438]',
}

export default async function LandingPage() {
  const stats = await getLPStats()

  return (
    <div className={`min-h-screen transition-colors duration-500 ${colors.bg} ${colors.text}`}>
      {/* ヘッダー */}
      <header className={`fixed top-0 left-0 right-0 z-50 ${colors.header} shadow-md transition-colors duration-500`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-serif text-lg tracking-wider text-white">
            ☀️ 究極の朝活
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
            <AnimatedTree isNight={false} />
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
                    <GrowthTreeLP stage={4} isNight={false} />
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
