'use client'

import { useState } from 'react'
import { TopBar } from '@/components/TopBar'
import { useSession } from 'next-auth/react'
import { GrowthTree } from '@/components/GrowthTree'

export default function ConceptPage() {
  const { data: session } = useSession()
  const [previewProgress, setPreviewProgress] = useState(100)

  return (
    <div className="min-h-screen bg-[#f0e8eb]">
      <TopBar />

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-3xl font-bold text-[#d46a7e] mb-2">
            究極の朝活
          </h1>
          <p className="text-[#4a3f42]/60">Rule Book & Concept</p>
          <p className="text-sm text-[#4a3f42]/40 mt-2">― 戸村 光 ―</p>
        </div>

        {/* Concept */}
        <section className="mb-16">
          <h2 className="text-xl font-bold text-[#4a3f42] mb-6 pb-2 border-b-2 border-[#d46a7e]/30">
            コンセプト
          </h2>
          <div className="space-y-6 text-[#4a3f42] leading-relaxed">
            <p>
              最高の自分の人生を送るために、<br />
              朝を大切にすることが大切です。
            </p>
            <p>
              人生は、<br />
              1日の積み重ねでできている。<br />
              1週間の積み重ねで方向が決まり、<br />
              1年の積み重ねで自分が変わり、<br />
              10年の積み重ねで生き方が定まる。
            </p>
            <p>
              でも多くの人は、<br />
              そのスタート地点である「朝」を、<br />
              無意識のまま始めてしまう。
            </p>
            <p className="bg-white/50 p-4 rounded-xl">
              <strong className="text-[#d46a7e]">究極の朝活は、</strong><br />
              人生をコントロールするための習慣ではありません。<br />
              <strong>人生に、意図を取り戻すための習慣です。</strong>
            </p>
            <p>
              朝に思考を整理し、<br />
              夜に1日を回収する。<br />
              それを、1人ではなく、<br />
              コミュニティで続けていく。
            </p>
            <p className="font-medium">
              これは自己啓発ではありません。<br />
              自分の人生を、自分で経営するための実践です。
            </p>
          </div>
        </section>

        {/* What We Do */}
        <section className="mb-16">
          <h2 className="text-xl font-bold text-[#4a3f42] mb-6 pb-2 border-b-2 border-[#d46a7e]/30">
            この朝活でやること
          </h2>
          <ul className="space-y-3 text-[#4a3f42]">
            <li className="flex items-start gap-3">
              <span className="text-[#d46a7e] mt-1">●</span>
              <span>朝、思考を整える</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#d46a7e] mt-1">●</span>
              <span>夜、行動を振り返る</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#d46a7e] mt-1">●</span>
              <span>毎日、言葉として発表する</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#d46a7e] mt-1">●</span>
              <span>他人と比べず、自分を磨き続ける</span>
            </li>
          </ul>
          <p className="mt-6 text-[#4a3f42]">
            それだけです。<br />
            <span className="text-[#4a3f42]/70">シンプルだけど、簡単ではありません。</span>
          </p>
        </section>

        {/* Basic Philosophy */}
        <section className="mb-16">
          <h2 className="text-xl font-bold text-[#4a3f42] mb-6 pb-2 border-b-2 border-[#d46a7e]/30">
            基本思想
          </h2>
          <p className="text-sm text-[#4a3f42]/60 mb-4">最初に共有する前提</p>
          <div className="bg-white/50 rounded-xl p-6 space-y-3">
            <p className="flex items-start gap-3 text-[#4a3f42]">
              <span className="text-[#d46a7e]">●</span>
              <span>人生は「気合」では変わらない</span>
            </p>
            <p className="flex items-start gap-3 text-[#4a3f42]">
              <span className="text-[#d46a7e]">●</span>
              <span>人生は「構造」と「習慣」で変わる</span>
            </p>
            <p className="flex items-start gap-3 text-[#4a3f42]">
              <span className="text-[#d46a7e]">●</span>
              <span>正解よりも「意図」が大事</span>
            </p>
            <p className="flex items-start gap-3 text-[#4a3f42]">
              <span className="text-[#d46a7e]">●</span>
              <span>完璧よりも「継続」が価値を持つ</span>
            </p>
          </div>
        </section>

        {/* Rule Book */}
        <section className="mb-16">
          <h2 className="text-xl font-bold text-[#4a3f42] mb-2 pb-2 border-b-2 border-[#d46a7e]/30">
            ルールブック
          </h2>
          <p className="text-sm text-[#4a3f42]/60 mb-6">― このコミュニティで守ること ―</p>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-5">
              <h3 className="font-bold text-[#d46a7e] mb-2">Rule 1｜正解を探さない</h3>
              <p className="text-[#4a3f42] text-sm leading-relaxed">
                ここに、正解はありません。<br />
                あるのは、今の自分の本音だけです。
              </p>
            </div>

            <div className="bg-white rounded-xl p-5">
              <h3 className="font-bold text-[#d46a7e] mb-2">Rule 2｜他人と比べない</h3>
              <p className="text-[#4a3f42] text-sm leading-relaxed">
                成長の速度も、テーマも、人それぞれ。<br />
                比較は、思考を止めます。
              </p>
            </div>

            <div className="bg-white rounded-xl p-5">
              <h3 className="font-bold text-[#d46a7e] mb-2">Rule 3｜評価しない</h3>
              <p className="text-[#4a3f42] text-sm leading-relaxed">
                いいねも、コメントも、称賛もありません。<br />
                評価が入った瞬間、言葉は濁ります。
              </p>
            </div>

            <div className="bg-white rounded-xl p-5">
              <h3 className="font-bold text-[#d46a7e] mb-2">Rule 4｜アドバイスしない</h3>
              <p className="text-[#4a3f42] text-sm leading-relaxed">
                この場は、誰かを導く場所ではありません。<br />
                自分と向き合う場所です。
              </p>
            </div>

            <div className="bg-white rounded-xl p-5">
              <h3 className="font-bold text-[#d46a7e] mb-2">Rule 5｜未完成で出す</h3>
              <p className="text-[#4a3f42] text-sm leading-relaxed">
                考えがまとまっていなくてもいい。<br />
                言葉にすることで、思考は前に進みます。
              </p>
            </div>

            <div className="bg-white rounded-xl p-5">
              <h3 className="font-bold text-[#d46a7e] mb-2">Rule 6｜自分から逃げない</h3>
              <p className="text-[#4a3f42] text-sm leading-relaxed">
                書かない日があってもいい。<br />
                でも、嘘は書かないでください。
              </p>
            </div>
          </div>
        </section>

        {/* Morning Habit */}
        <section className="mb-16">
          <h2 className="text-xl font-bold text-[#4a3f42] mb-6 pb-2 border-b-2 border-[#d46a7e]/30">
            朝の習慣（毎日）
          </h2>
          <div className="bg-gradient-to-br from-[#d46a7e]/10 to-white rounded-xl p-6">
            <p className="text-sm text-[#4a3f42]/70 mb-4">朝にやること</p>
            <ul className="space-y-3 text-[#4a3f42]">
              <li className="flex items-start gap-3">
                <span className="text-[#d46a7e]">●</span>
                <span>今日の自分の状態を認識する</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#d46a7e]">●</span>
                <span>今日の軸を決める</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#d46a7e]">●</span>
                <span>今日の行動を1つに絞る</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#d46a7e]">●</span>
                <span>今日の宣言を言葉にする</span>
              </li>
            </ul>
            <p className="mt-4 text-sm text-[#d46a7e] font-medium">
              宣言は、毎朝発表します。
            </p>
          </div>
        </section>

        {/* Night Habit */}
        <section className="mb-16">
          <h2 className="text-xl font-bold text-[#4a3f42] mb-6 pb-2 border-b-2 border-[#d46a7e]/30">
            夜の習慣（毎日）
          </h2>
          <div className="bg-gradient-to-br from-[#4a3f42]/5 to-white rounded-xl p-6">
            <p className="text-sm text-[#4a3f42]/70 mb-4">夜にやること</p>
            <ul className="space-y-3 text-[#4a3f42]">
              <li className="flex items-start gap-3">
                <span className="text-[#4a3f42]/50">●</span>
                <span>今日の選択を振り返る</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#4a3f42]/50">●</span>
                <span>ズレた理由を理解する</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#4a3f42]/50">●</span>
                <span>学びを回収する</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#4a3f42]/50">●</span>
                <span>明日の自分に言葉を残す</span>
              </li>
            </ul>
            <p className="mt-4 text-sm text-[#4a3f42]/70">
              反省のためではありません。<br />
              <span className="font-medium text-[#4a3f42]">成長のためです。</span>
            </p>
          </div>
        </section>

        {/* Time Axis */}
        <section className="mb-16">
          <h2 className="text-xl font-bold text-[#4a3f42] mb-6 pb-2 border-b-2 border-[#d46a7e]/30">
            時間軸の考え方
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-4 bg-white rounded-lg p-4">
              <span className="text-[#d46a7e] font-bold w-16">1日</span>
              <span className="text-[#4a3f42]">今日の選択に意図を持つ</span>
            </div>
            <div className="flex items-center gap-4 bg-white rounded-lg p-4">
              <span className="text-[#d46a7e] font-bold w-16">1週間</span>
              <span className="text-[#4a3f42]">向きを確認する</span>
            </div>
            <div className="flex items-center gap-4 bg-white rounded-lg p-4">
              <span className="text-[#d46a7e] font-bold w-16">1年</span>
              <span className="text-[#4a3f42]">自分の変化をつくる</span>
            </div>
            <div className="flex items-center gap-4 bg-white rounded-lg p-4">
              <span className="text-[#d46a7e] font-bold w-16">10年</span>
              <span className="text-[#4a3f42]">生き方を形にする</span>
            </div>
            <div className="flex items-center gap-4 bg-white rounded-lg p-4">
              <span className="text-[#d46a7e] font-bold w-16">人生</span>
              <span className="text-[#4a3f42]">後悔のない選択を積み重ねる</span>
            </div>
          </div>
          <p className="mt-6 text-center text-[#4a3f42]">
            究極の朝活は、<br />
            <strong>このすべてをつなぐためにあります。</strong>
          </p>
        </section>

        {/* Growth Tree */}
        <section className="mb-16">
          <h2 className="text-xl font-bold text-[#4a3f42] mb-6 pb-2 border-b-2 border-[#d46a7e]/30">
            成長する木
          </h2>
          <p className="text-sm text-[#4a3f42]/60 mb-6">― 毎日の投稿で木を育てよう ―</p>

          <div className="bg-white rounded-xl p-6 mb-6">
            <p className="text-[#4a3f42] mb-4 text-center">
              マイページでは、今月の投稿率に応じて<br />
              <strong className="text-[#d46a7e]">あなただけの木</strong>が成長していきます。
            </p>

            {/* プレビュー */}
            <div className="bg-gradient-to-b from-[#e3f2fd] to-[#f0e8eb] rounded-xl p-4 mb-6">
              <GrowthTree
                progress={previewProgress}
                postsCount={Math.round(28 * previewProgress / 100)}
                daysInMonth={28}
              />
            </div>

            {/* スライダー */}
            <div className="mb-6">
              <p className="text-sm text-[#4a3f42]/60 text-center mb-2">
                スライダーで成長を確認してみよう
              </p>
              <input
                type="range"
                min="0"
                max="100"
                value={previewProgress}
                onChange={(e) => setPreviewProgress(Number(e.target.value))}
                className="w-full h-2 bg-[#e8f5e9] rounded-lg appearance-none cursor-pointer accent-[#4caf50]"
              />
              <div className="flex justify-between text-xs text-[#4a3f42]/50 mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* 成長段階の説明 */}
          <div className="space-y-3 mb-8">
            <h3 className="font-bold text-[#4a3f42] mb-3">成長の段階</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">🌱</div>
                <p className="text-xs text-[#4a3f42]/60">0%</p>
                <p className="text-sm text-[#4a3f42]">種を植える</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">🌿</div>
                <p className="text-xs text-[#4a3f42]/60">1-19%</p>
                <p className="text-sm text-[#4a3f42]">芽が出る</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">🪴</div>
                <p className="text-xs text-[#4a3f42]/60">20-39%</p>
                <p className="text-sm text-[#4a3f42]">木らしくなる</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">🌳</div>
                <p className="text-xs text-[#4a3f42]/60">40-59%</p>
                <p className="text-sm text-[#4a3f42]">葉が茂る</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">✨</div>
                <p className="text-xs text-[#4a3f42]/60">60-79%</p>
                <p className="text-sm text-[#4a3f42]">実がなりそう</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">🍎</div>
                <p className="text-xs text-[#4a3f42]/60">80-99%</p>
                <p className="text-sm text-[#4a3f42]">実がなる!</p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-[#d46a7e]/10 to-[#fff5f7] rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">🎉</div>
              <p className="text-xs text-[#d46a7e]">100% 達成!</p>
              <p className="font-bold text-[#d46a7e]">満開の木が咲きました!</p>
            </div>
          </div>

          {/* 月別テーマ */}
          <div className="bg-white rounded-xl p-6">
            <h3 className="font-bold text-[#4a3f42] mb-4 text-center">月替わりフルーツ</h3>
            <p className="text-sm text-[#4a3f42]/70 text-center mb-4">
              毎月、実る果物が変わります
            </p>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-[#fff3e0] rounded-lg p-2">
                <p className="text-lg">🍊</p>
                <p className="text-xs text-[#4a3f42]">1月</p>
                <p className="text-xs text-[#4a3f42]/60">みかん</p>
              </div>
              <div className="bg-[#ffebee] rounded-lg p-2">
                <p className="text-lg">🍎</p>
                <p className="text-xs text-[#4a3f42]">2月</p>
                <p className="text-xs text-[#4a3f42]/60">りんご</p>
              </div>
              <div className="bg-[#ffebee] rounded-lg p-2">
                <p className="text-lg">🍓</p>
                <p className="text-xs text-[#4a3f42]">3月</p>
                <p className="text-xs text-[#4a3f42]/60">いちご</p>
              </div>
              <div className="bg-[#ffcdd2] rounded-lg p-2">
                <p className="text-lg">🍒</p>
                <p className="text-xs text-[#4a3f42]">4月</p>
                <p className="text-xs text-[#4a3f42]/60">さくらんぼ</p>
              </div>
              <div className="bg-[#e8f5e9] rounded-lg p-2">
                <p className="text-lg">🍈</p>
                <p className="text-xs text-[#4a3f42]">5月</p>
                <p className="text-xs text-[#4a3f42]/60">メロン</p>
              </div>
              <div className="bg-[#fce4ec] rounded-lg p-2">
                <p className="text-lg">🍑</p>
                <p className="text-xs text-[#4a3f42]">6月</p>
                <p className="text-xs text-[#4a3f42]/60">もも</p>
              </div>
              <div className="bg-[#e8f5e9] rounded-lg p-2">
                <p className="text-lg">🍉</p>
                <p className="text-xs text-[#4a3f42]">7月</p>
                <p className="text-xs text-[#4a3f42]/60">すいか</p>
              </div>
              <div className="bg-[#fff8e1] rounded-lg p-2">
                <p className="text-lg">🥭</p>
                <p className="text-xs text-[#4a3f42]">8月</p>
                <p className="text-xs text-[#4a3f42]/60">マンゴー</p>
              </div>
              <div className="bg-[#f3e5f5] rounded-lg p-2">
                <p className="text-lg">🍇</p>
                <p className="text-xs text-[#4a3f42]">9月</p>
                <p className="text-xs text-[#4a3f42]/60">ぶどう</p>
              </div>
              <div className="bg-[#fff3e0] rounded-lg p-2">
                <p className="text-lg">🍊</p>
                <p className="text-xs text-[#4a3f42]">10月</p>
                <p className="text-xs text-[#4a3f42]/60">柿</p>
              </div>
              <div className="bg-[#f0f4c3] rounded-lg p-2">
                <p className="text-lg">🍐</p>
                <p className="text-xs text-[#4a3f42]">11月</p>
                <p className="text-xs text-[#4a3f42]/60">洋梨</p>
              </div>
              <div className="bg-[#fff3e0] rounded-lg p-2">
                <p className="text-lg">🍊</p>
                <p className="text-xs text-[#4a3f42]">12月</p>
                <p className="text-xs text-[#4a3f42]/60">冬みかん</p>
              </div>
            </div>
            <p className="text-center text-sm text-[#4a3f42]/60 mt-4">
              毎日の投稿を続けて、<br />
              <strong className="text-[#d46a7e]">今月の果物を実らせよう!</strong>
            </p>
          </div>
        </section>

        {/* About Community */}
        <section className="mb-16">
          <h2 className="text-xl font-bold text-[#4a3f42] mb-6 pb-2 border-b-2 border-[#d46a7e]/30">
            コミュニティについて
          </h2>
          <div className="text-[#4a3f42] space-y-4 leading-relaxed">
            <p>
              このコミュニティは、<br />
              盛り上がる場所ではありません。
            </p>
            <p className="font-medium">
              でも、<br />
              <span className="text-[#d46a7e]">逃げられない場所です。</span>
            </p>
            <p>
              毎朝、自分の言葉が残る。<br />
              自分の選択が見える。<br />
              自分の人生が積み重なっていく。
            </p>
          </div>
        </section>

        {/* Closing */}
        <section className="mb-16">
          <h2 className="text-xl font-bold text-[#4a3f42] mb-6 pb-2 border-b-2 border-[#d46a7e]/30">
            最後に
          </h2>
          <p className="text-sm text-[#4a3f42]/60 mb-4">（戸村光から）</p>
          <div className="text-[#4a3f42] space-y-4 leading-relaxed">
            <p>
              人生を変える特別な1日はありません。<br />
              あるのは、<br />
              <strong>意図を持って始めた朝の連続だけです。</strong>
            </p>
            <p>
              完璧じゃなくていい。<br />
              でも、向きだけは間違えないでほしい。
            </p>
            <p>
              この究極の朝活が、<br />
              あなたがあなた自身の人生を<br />
              ちゃんと生きるための<br />
              <span className="text-[#d46a7e] font-medium">「戻ってこられる場所」</span>になれば嬉しいです。
            </p>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center pt-8 pb-16 border-t border-[#d46a7e]/20">
          <p className="text-2xl font-bold text-[#d46a7e] mb-2">究極の朝活</p>
          <p className="text-[#4a3f42]">自分の人生を、自分で経営する。</p>

          {!session && (
            <div className="mt-8">
              <a
                href="/login"
                className="inline-block bg-[#d46a7e] hover:bg-[#c25a6e] text-white font-semibold px-8 py-4 rounded-xl transition"
              >
                はじめる
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
