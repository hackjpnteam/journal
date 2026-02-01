export default function ConceptPage() {
  return (
    <div className="min-h-screen bg-[#f0e8eb]">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="text-center space-y-12">
          <h1 className="text-3xl font-bold text-[#d46a7e]">
            Ultimate Morning
          </h1>

          <div className="space-y-8 text-[#4a3f42]">
            <p className="text-xl leading-relaxed">
              最高の自分の人生を送るための
              <br />
              究極の朝活をつくります。
            </p>

            <div className="w-16 h-px bg-[#d46a7e]/30 mx-auto" />

            <p className="text-lg leading-loose">
              1日、1週間、1年、10年、そして人生。
              <br />
              すべての時間軸で、
              <br />
              「自分はどこに向かっているのか」を見失わないために。
            </p>

            <div className="w-16 h-px bg-[#d46a7e]/30 mx-auto" />

            <p className="text-lg leading-loose">
              朝、思考を整理し、
              <br />
              夜、1日を回収する。
            </p>

            <div className="w-16 h-px bg-[#d46a7e]/30 mx-auto" />

            <p className="text-lg leading-loose font-medium">
              これは自己啓発ではありません。
              <br />
              自分の人生を、自分で経営するための習慣です。
            </p>
          </div>

          <div className="pt-8">
            <a
              href="/login"
              className="inline-block bg-[#d46a7e] hover:bg-[#c25a6e] text-white font-semibold px-8 py-4 rounded-xl transition"
            >
              はじめる
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
