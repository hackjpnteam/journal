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
        const aTime = a.stats.lastActivity ? new Date(a.stats.lastActivity).getTime() : 0
        const bTime = b.stats.lastActivity ? new Date(b.stats.lastActivity).getTime() : 0
        comparison = aTime - bTime
        break
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        break
    }
    return sortOrder === 'asc' ? comparison : -comparison
  })

  const totalUsers = users.length
  const activeUsers = users.filter((u) => u.stats.healthScore >= 40).length
  const atRiskUsers = users.filter((u) => u.stats.healthScore < 40).length

  return (
    <div className="min-h-screen bg-[#f0e8eb]">
      <TopBar />

      <main className="max-w-6xl mx-auto p-4 space-y-6">
        <div className="text-center py-4">
          <p className="text-[#d46a7e] text-sm font-medium">Super Admin</p>
          <h1 className="text-xl font-semibold mt-1 text-[#4a3f42]">ユーザー管理</h1>
        </div>

        {/* サマリー */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-[#4a3f42]">{totalUsers}</p>
              <p className="text-sm text-[#4a3f42]/60">総ユーザー数</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{activeUsers}</p>
              <p className="text-sm text-[#4a3f42]/60">アクティブユーザー</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">{atRiskUsers}</p>
              <p className="text-sm text-[#4a3f42]/60">要フォローアップ</p>
            </div>
          </Card>
        </div>

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
                setSortOrder('asc')
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
                    {/* ユーザー情報 */}
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

                    {/* ヘルススコア */}
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

                  {/* 統計 */}
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
