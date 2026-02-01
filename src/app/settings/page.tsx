'use client'

import { useSession } from 'next-auth/react'
import { TopBar } from '@/components/TopBar'
import { Card, CardTitle } from '@/components/Card'
import Link from 'next/link'

export default function SettingsPage() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-[#f0e8eb]">
      <TopBar />

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="text-center py-4">
          <h1 className="text-xl font-semibold text-[#4a3f42]">設定</h1>
        </div>

        <Card>
          <CardTitle>プロフィール</CardTitle>
          <p className="text-[#4a3f42]/70 text-sm mb-3">
            アイコンや名前を変更できます
          </p>
          <Link
            href="/profile"
            className="inline-block bg-[#d46a7e] hover:bg-[#c25a6e] text-white font-medium px-4 py-2 rounded-xl transition"
          >
            プロフィール設定へ
          </Link>
        </Card>

        <Card>
          <CardTitle>Google Calendar 連携</CardTitle>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <span className="text-2xl">🚧</span>
              <div>
                <p className="font-medium text-yellow-800">実装中</p>
                <p className="text-sm text-yellow-700">
                  この機能は現在開発中です。近日公開予定！
                </p>
              </div>
            </div>

            <div className="text-[#4a3f42]/70 text-sm space-y-3">
              <p className="font-medium text-[#4a3f42]">連携すると以下の機能が使えます：</p>

              <div className="pl-4 space-y-2">
                <div className="flex items-start gap-2">
                  <span>📅</span>
                  <div>
                    <p className="font-medium">専用カレンダー自動作成</p>
                    <p className="text-xs text-[#4a3f42]/50">
                      「究極の朝活」カレンダーが自動で作成されます
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span>⏰</span>
                  <div>
                    <p className="font-medium">毎朝7:00のリマインダー</p>
                    <p className="text-xs text-[#4a3f42]/50">
                      朝のジャーナル投稿をリマインドします
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span>📝</span>
                  <div>
                    <p className="font-medium">投稿の自動記録</p>
                    <p className="text-xs text-[#4a3f42]/50">
                      朝・夜の投稿がカレンダーに自動反映されます
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-[#f0e8eb] rounded-lg">
                <p className="text-xs">
                  <span className="font-medium">朝のログ：</span> 7:05 に記録<br />
                  タイトル例：「究極の朝活 ☀️ 🙂」
                </p>
                <p className="text-xs mt-2">
                  <span className="font-medium">夜のログ：</span> 21:30 に記録<br />
                  タイトル例：「究極の夜活 🌙」
                </p>
              </div>
            </div>

            <button
              disabled
              className="w-full opacity-50 cursor-not-allowed"
            >
              Google Calendar と連携する（準備中）
            </button>
          </div>
        </Card>

        <Card>
          <CardTitle>アカウント情報</CardTitle>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#4a3f42]/60">メール</span>
              <span className="text-[#4a3f42]">{session?.user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#4a3f42]/60">ロール</span>
              <span className="text-[#4a3f42]">{session?.user?.role}</span>
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}
