'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/TopBar'
import { Card, CardTitle } from '@/components/Card'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface UserStats {
  id: string
  email: string
  name: string
  role: string
  createdAt: string
  stats: {
    totalMorning: number
    totalNight: number
    morning7: number
    night7: number
    morning30: number
    night30: number
    lastActivity: string | null
    healthScore: number
  }
}

interface DailyStat {
  date: string
  morning: number
  night: number
  total: number
}

interface Summary {
  totalUsers: number
  todayMorning: number
  todayNight: number
  totalMorningPosts: number
  totalNightPosts: number
  healthDistribution: {
    good: number
    warning: number
    risk: number
  }
}

// サービス開始日
const SERVICE_START_DATE = new Date('2026-02-02')

function getDaysSinceLaunch(): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.max(1, Math.floor((today.getTime() - SERVICE_START_DATE.getTime()) / (1000 * 60 * 60 * 24)) + 1)
}

function getHealthColor(score: number): string {
  if (score >= 70) return 'text-green-600 bg-green-100'
  if (score >= 40) return 'text-yellow-600 bg-yellow-100'
  return 'text-red-600 bg-red-100'
}

function getHealthLabel(score: number): string {
  if (score >= 70) return '良好'
  if (score >= 40) return '注意'
  return '要フォロー'
}

export default function AdminPage() {
  const [users, setUsers] = useState<UserStats[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'healthScore' | 'lastActivity' | 'createdAt'>('healthScore')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/admin/users')
        if (res.ok) {
          const data = await res.json()
          setUsers(data.users)
          setSummary(data.summary)
          setDailyStats(data.dailyStats || [])
        }
      } catch (error) {
        console.error('Failed to fetch users:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const sortedUsers = [...users].sort((a, b) => {
    let comparison = 0
    switch (sortBy) {
      case 'healthScore':
        comparison = a.stats.healthScore - b.stats.healthScore
        break
      case 'lastActivity':
        if (!a.stats.lastActivity && !b.stats.lastActivity) comparison = 0
        else if (!a.stats.lastActivity) comparison = -1
        else if (!b.stats.lastActivity) comparison = 1
        else comparison = new Date(a.stats.lastActivity).getTime() - new Date(b.stats.lastActivity).getTime()
        break
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        break
    }
    return sortOrder === 'asc' ? comparison : -comparison
  })

  const maxDailyTotal = Math.max(...dailyStats.map(d => d.total), 1)

  return (
    <div className="min-h-screen bg-[#f0e8eb]">
      <TopBar />

      <main className="max-w-6xl mx-auto p-4 space-y-6">
        <div className="text-center py-4">
          <p className="text-[#d46a7e] text-sm font-medium">Super Admin</p>
          <h1 className="text-xl font-semibold mt-1 text-[#4a3f42]">ダッシュボード</h1>
        </div>

        {/* サービス情報 */}
        <Card className="bg-gradient-to-r from-[#d46a7e]/10 to-[#4a3f42]/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#4a3f42]/70">サービス開始日</p>
              <p className="text-lg font-semibold text-[#4a3f42]">2026年2月2日</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-[#4a3f42]/70">運営日数</p>
              <p className="text-3xl font-bold text-[#d46a7e]">{getDaysSinceLaunch()}日目</p>
            </div>
          </div>
        </Card>

        {/* サマリーカード */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <div className="text-center">
              <p className="text-xs text-[#4a3f42]/60 mb-1">総ユーザー</p>
              <p className="text-3xl font-bold text-[#4a3f42]">{summary?.totalUsers || 0}</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-xs text-[#4a3f42]/60 mb-1">今日の朝投稿</p>
              <p className="text-3xl font-bold text-[#d46a7e]">{summary?.todayMorning || 0}</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-xs text-[#4a3f42]/60 mb-1">今日の夜投稿</p>
              <p className="text-3xl font-bold text-[#4a3f42]">{summary?.todayNight || 0}</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-xs text-[#4a3f42]/60 mb-1">累計投稿数</p>
              <p className="text-3xl font-bold text-[#4a3f42]">
                {(summary?.totalMorningPosts || 0) + (summary?.totalNightPosts || 0)}
              </p>
            </div>
          </Card>
        </div>

        {/* 日別推移グラフ */}
        <Card>
          <CardTitle>日別推移（過去7日間）</CardTitle>
          <div className="mt-6">
            {/* グラフエリア */}
            <div className="relative">
              {/* Y軸のグリッドライン */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="border-t border-gray-200 w-full" />
                ))}
              </div>

              {/* Y軸ラベル */}
              <div className="absolute -left-8 inset-y-0 flex flex-col justify-between text-xs text-[#4a3f42]/50 py-1">
                <span>{maxDailyTotal}</span>
                <span>{Math.round(maxDailyTotal * 0.75)}</span>
                <span>{Math.round(maxDailyTotal * 0.5)}</span>
                <span>{Math.round(maxDailyTotal * 0.25)}</span>
                <span>0</span>
              </div>

              {/* バーチャート */}
              <div className="flex items-end justify-around gap-4 h-56 pl-4">
                {dailyStats.map((stat) => {
                  const morningHeight = maxDailyTotal > 0 ? (stat.morning / maxDailyTotal) * 100 : 0
                  const nightHeight = maxDailyTotal > 0 ? (stat.night / maxDailyTotal) * 100 : 0
                  const isToday = format(new Date(stat.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')

                  return (
                    <div key={stat.date} className="flex-1 flex flex-col items-center max-w-20">
                      {/* バー */}
                      <div className="w-full flex justify-center gap-1 h-48 items-end">
                        {/* 朝のバー */}
                        <div className="relative flex-1 max-w-6 flex flex-col justify-end h-full">
                          <div
                            className="w-full bg-gradient-to-t from-[#d46a7e] to-[#e88a9a] rounded-t-md transition-all duration-500 relative group"
                            style={{ height: `${morningHeight}%`, minHeight: stat.morning > 0 ? '8px' : '0' }}
                          >
                            {stat.morning > 0 && (
                              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-semibold text-[#d46a7e]">
                                {stat.morning}
                              </span>
                            )}
                          </div>
                        </div>
                        {/* 夜のバー */}
                        <div className="relative flex-1 max-w-6 flex flex-col justify-end h-full">
                          <div
                            className="w-full bg-gradient-to-t from-[#4a3f42] to-[#6a5f62] rounded-t-md transition-all duration-500 relative group"
                            style={{ height: `${nightHeight}%`, minHeight: stat.night > 0 ? '8px' : '0' }}
                          >
                            {stat.night > 0 && (
                              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-semibold text-[#4a3f42]">
                                {stat.night}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 日付ラベル */}
                      <div className={`mt-3 px-2 py-1 rounded-md text-xs font-medium ${
                        isToday
                          ? 'bg-[#d46a7e] text-white'
                          : 'text-[#4a3f42]/70'
                      }`}>
                        {format(new Date(stat.date), 'M/d')}
                        {isToday && <span className="ml-1">今日</span>}
                      </div>

                      {/* 合計 */}
                      <div className="text-xs text-[#4a3f42]/50 mt-1">
                        計 {stat.total}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 凡例 */}
            <div className="flex justify-center gap-8 mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gradient-to-t from-[#d46a7e] to-[#e88a9a]" />
                <span className="text-sm text-[#4a3f42]">朝の投稿</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gradient-to-t from-[#4a3f42] to-[#6a5f62]" />
                <span className="text-sm text-[#4a3f42]">夜の投稿</span>
              </div>
            </div>
          </div>
        </Card>

        {/* ヘルス分布 */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <CardTitle>ユーザーヘルス分布</CardTitle>
            <div className="text-xs text-[#4a3f42]/50 bg-[#f0e8eb] px-3 py-1 rounded-full">
              投稿率50% + 継続性50%
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <div className="text-3xl mb-1">😊</div>
              <p className="text-2xl font-bold text-green-600">{summary?.healthDistribution.good || 0}</p>
              <p className="text-xs text-green-600/70">良好（70点以上）</p>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4 text-center">
              <div className="text-3xl mb-1">😐</div>
              <p className="text-2xl font-bold text-yellow-600">{summary?.healthDistribution.warning || 0}</p>
              <p className="text-xs text-yellow-600/70">注意（40-69点）</p>
            </div>
            <div className="bg-red-50 rounded-xl p-4 text-center">
              <div className="text-3xl mb-1">😟</div>
              <p className="text-2xl font-bold text-red-600">{summary?.healthDistribution.risk || 0}</p>
              <p className="text-xs text-red-600/70">要フォロー（40点未満）</p>
            </div>
          </div>
          <p className="text-xs text-[#4a3f42]/50 mt-4 text-center">
            ※ サービス開始日（2/2）からの有効日数で計算
          </p>
        </Card>

        {/* ソート */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-[#4a3f42]/60">並び替え:</span>
          <button
            onClick={() => {
              if (sortBy === 'healthScore') {
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
              } else {
                setSortBy('healthScore')
                setSortOrder('asc')
              }
            }}
            className={`px-3 py-1 rounded-lg text-sm transition ${
              sortBy === 'healthScore'
                ? 'bg-[#d46a7e] text-white'
                : 'bg-white text-[#4a3f42] hover:bg-[#d46a7e]/10'
            }`}
          >
            ヘルススコア {sortBy === 'healthScore' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => {
              if (sortBy === 'lastActivity') {
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
              } else {
                setSortBy('lastActivity')
                setSortOrder('desc')
              }
            }}
            className={`px-3 py-1 rounded-lg text-sm transition ${
              sortBy === 'lastActivity'
                ? 'bg-[#d46a7e] text-white'
                : 'bg-white text-[#4a3f42] hover:bg-[#d46a7e]/10'
            }`}
          >
            最終アクティビティ {sortBy === 'lastActivity' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => {
              if (sortBy === 'createdAt') {
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
              } else {
                setSortBy('createdAt')
                setSortOrder('desc')
              }
            }}
            className={`px-3 py-1 rounded-lg text-sm transition ${
              sortBy === 'createdAt'
                ? 'bg-[#d46a7e] text-white'
                : 'bg-white text-[#4a3f42] hover:bg-[#d46a7e]/10'
            }`}
          >
            登録日 {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
        </div>

        {/* ユーザーリスト */}
        <Card>
          <CardTitle>ユーザー一覧</CardTitle>
          {loading ? (
            <div className="text-center text-[#4a3f42]/50 py-8">読み込み中...</div>
          ) : users.length === 0 ? (
            <div className="text-center text-[#4a3f42]/50 py-8">ユーザーがいません</div>
          ) : (
            <div className="space-y-4">
              {sortedUsers.map((user) => (
                <div
                  key={user.id}
                  className="bg-[#f0e8eb] rounded-xl p-4"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-[#4a3f42]">{user.name}</span>
                        <span className="text-sm text-[#4a3f42]/50">{user.email}</span>
                        {user.role !== 'member' && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#d46a7e] text-white">
                            {user.role}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#4a3f42]/50 mt-1">
                        登録: {format(new Date(user.createdAt), 'yyyy/MM/dd', { locale: ja })}
                        {user.stats.lastActivity && (
                          <>
                            {' '}| 最終: {format(new Date(user.stats.lastActivity), 'yyyy/MM/dd HH:mm', { locale: ja })}
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getHealthColor(
                          user.stats.healthScore
                        )}`}
                      >
                        {user.stats.healthScore}点 - {getHealthLabel(user.stats.healthScore)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-sm">
                    <div className="bg-white rounded-lg p-2 text-center">
                      <p className="text-[#4a3f42]/50 text-xs">7日間（朝/夜）</p>
                      <p className="font-medium text-[#4a3f42]">
                        {user.stats.morning7} / {user.stats.night7}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-2 text-center">
                      <p className="text-[#4a3f42]/50 text-xs">30日間（朝/夜）</p>
                      <p className="font-medium text-[#4a3f42]">
                        {user.stats.morning30} / {user.stats.night30}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-2 text-center">
                      <p className="text-[#4a3f42]/50 text-xs">累計（朝/夜）</p>
                      <p className="font-medium text-[#4a3f42]">
                        {user.stats.totalMorning} / {user.stats.totalNight}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-2 text-center">
                      <p className="text-[#4a3f42]/50 text-xs">7日投稿率</p>
                      <p className="font-medium text-[#4a3f42]">
                        {Math.round(((user.stats.morning7 + user.stats.night7) / 14) * 100)}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>
    </div>
  )
}
