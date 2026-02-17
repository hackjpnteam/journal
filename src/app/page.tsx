'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { TopBar } from '@/components/TopBar'
import { Card, CardTitle } from '@/components/Card'
import { Forest } from '@/components/Forest'
import { MOOD_EMOJI, type Mood } from '@/lib/constants'
import { useTimeTheme, themeColors } from '@/hooks/useTimeTheme'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface CheerData {
  id: string
  userId: string
  userName: string
  userImage: string | null
}

interface TimelineItem {
  id: string
  type: 'morning' | 'night' | 'okr'
  userId: string
  userName: string
  userImage: string | null
  createdAt: string
  cheers: CheerData[]
  // Morning fields
  mood?: Mood
  declaration?: string
  value?: string
  action?: string
  letGo?: string
  promptQuestion?: string
  promptAnswer?: string
  // Night fields
  proudChoice?: string
  learning?: string
  tomorrowMessage?: string
  selfScore?: number
  // OKR fields
  okrType?: 'weekly' | 'monthly'
  periodKey?: string
  objective?: string
  keyResults?: string[]
  keyResultsProgress?: number[]
  focus?: string
  identityFocus?: string
}

interface CoachingNote {
  redline?: string
  question?: string
}

interface OKRData {
  objective: string
  keyResults: string[]
  keyResultsProgress?: number[]
  focus?: string
}

interface ForestUser {
  userId: string
  name: string
  profileImage: string | null
  postCount: number
  progress: number
  waterCount?: number
  weeklyWaterCount?: number
}

type WeatherType = 'clear' | 'partly_cloudy' | 'cloudy' | 'rain' | 'drizzle' | 'snow' | 'thunderstorm' | 'fog'

const WEATHER_LABELS: Record<WeatherType, { icon: string; label: string }> = {
  clear: { icon: '☀️', label: '晴れ' },
  partly_cloudy: { icon: '⛅', label: '晴れ時々曇り' },
  cloudy: { icon: '☁️', label: '曇り' },
  rain: { icon: '🌧️', label: '雨' },
  drizzle: { icon: '🌦️', label: '小雨' },
  snow: { icon: '❄️', label: '雪' },
  thunderstorm: { icon: '⛈️', label: '雷雨' },
  fog: { icon: '🌫️', label: '霧' },
}


export default function HomePage() {
  const { data: session, status } = useSession()
  const timeTheme = useTimeTheme()
  const theme = themeColors[timeTheme]
  const isNight = timeTheme === 'night'
  const [timeline, setTimeline] = useState<TimelineItem[]>([])
  const [coachingNote, setCoachingNote] = useState<CoachingNote | null>(null)
  const [weeklyOKR, setWeeklyOKR] = useState<OKRData | null>(null)
  const [weeklyAverageScore, setWeeklyAverageScore] = useState<number | null>(null)
  const [forest, setForest] = useState<ForestUser[]>([])
  const [mvpUserId, setMvpUserId] = useState<string | null>(null)
  const [wateredByMeToday, setWateredByMeToday] = useState<string[]>([])
  const [weather, setWeather] = useState<WeatherType>('clear')
  const [weatherLocation, setWeatherLocation] = useState<string>('')
  const [weatherTemp, setWeatherTemp] = useState<number | null>(null)
  const [weatherTempMin, setWeatherTempMin] = useState<number | null>(null)
  const [weatherTempMax, setWeatherTempMax] = useState<number | null>(null)
  const [weatherDescription, setWeatherDescription] = useState<string>('')
  const [birthdays, setBirthdays] = useState<{ name: string; description: string; quote?: string; prompt?: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [userName, setUserName] = useState<string>('')

  const today = format(new Date(), 'yyyy年M月d日（E）', { locale: ja })
  const currentHour = new Date().getHours()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // タイムラインを取得
        const timelineRes = await fetch('/api/timeline')
        if (timelineRes.ok) {
          const timelineData = await timelineRes.json()
          setTimeline(timelineData.timeline || [])
        }

        // コーチングノートを取得
        const shareRes = await fetch('/api/share')
        if (shareRes.ok) {
          const shareData = await shareRes.json()
          setCoachingNote(shareData.myCoachingNote)
        }

        // 今週のOKRを取得
        const now = new Date()
        const year = now.getFullYear()
        const weekNum = Math.ceil(
          ((now.getTime() - new Date(year, 0, 1).getTime()) / 86400000 +
            new Date(year, 0, 1).getDay() +
            1) /
            7
        )
        const weeklyPeriodKey = `${year}-W${String(weekNum).padStart(2, '0')}`
        const okrRes = await fetch(`/api/okr?type=weekly&periodKey=${weeklyPeriodKey}`)
        if (okrRes.ok) {
          const okrData = await okrRes.json()
          if (okrData && okrData.objective) {
            setWeeklyOKR(okrData)
          }
        }

        // ユーザー名を最新の状態で取得
        const profileRes = await fetch('/api/profile')
        if (profileRes.ok) {
          const profileData = await profileRes.json()
          setUserName(profileData.name || '')
        }

        // 今週の夜の投稿の平均スコアを取得
        const nightRes = await fetch('/api/night?weeklyAvg=true')
        if (nightRes.ok) {
          const nightData = await nightRes.json()
          if (nightData.weeklyAverageScore !== null) {
            setWeeklyAverageScore(nightData.weeklyAverageScore)
          }
        }

        // みんなの木の状態を取得
        const forestRes = await fetch('/api/forest')
        if (forestRes.ok) {
          const forestData = await forestRes.json()
          setForest(forestData.forest || [])
          setMvpUserId(forestData.mvpUserId || null)
          setWateredByMeToday(forestData.wateredByMeToday || [])
        }

        // ユーザーの地域の天気を取得
        const weatherRes = await fetch('/api/weather')
        if (weatherRes.ok) {
          const weatherData = await weatherRes.json()
          setWeather(weatherData.weather || 'clear')
          setWeatherLocation(weatherData.location || '')
          setWeatherTemp(weatherData.temp)
          setWeatherTempMin(weatherData.tempMin)
          setWeatherTempMax(weatherData.tempMax)
          setWeatherDescription(weatherData.description || '')
        }

        // 今日の有名人の誕生日を取得
        const todayRes = await fetch('/api/today')
        if (todayRes.ok) {
          const todayData = await todayRes.json()
          setBirthdays(todayData.birthdays || [])
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (status === 'authenticated' && session?.user) {
      fetchData()
    }
  }, [session, status])

  const handleDeletePost = async (postId: string, postType: string) => {
    if (!confirm('この投稿を削除しますか？')) return

    setDeleting(postId)
    try {
      const res = await fetch(`/api/admin/delete-post?id=${postId}&type=${postType}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setTimeline(prev => prev.filter(item => item.id !== postId))
      } else {
        const data = await res.json()
        alert(data.error || '削除に失敗しました')
      }
    } catch {
      alert('エラーが発生しました')
    } finally {
      setDeleting(null)
    }
  }

  const handleCheer = async (postId: string, postType: string) => {
    if (!session?.user) return

    // 楽観的更新: すぐにカウントを増やす
    const tempCheer = {
      id: `temp-${Date.now()}`,
      userId: session.user.id,
      userName: userName || session.user.name || '',
      userImage: session.user.image || null,
    }
    setTimeline(prev =>
      prev.map(item =>
        item.id === postId
          ? { ...item, cheers: [...item.cheers, tempCheer] }
          : item
      )
    )

    // バックグラウンドでAPI呼び出し（待たない）
    fetch('/api/cheer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, postType }),
    }).catch(error => {
      console.error('Cheer error:', error)
    })
  }

  const handleWaterTree = async (targetUserId: string) => {
    if (!session?.user) return

    // 楽観的更新
    setWateredByMeToday(prev => [...prev, targetUserId])
    setForest(prev =>
      prev.map(u =>
        u.userId === targetUserId
          ? { ...u, waterCount: (u.waterCount || 0) + 1, weeklyWaterCount: (u.weeklyWaterCount || 0) + 1 }
          : u
      )
    )

    try {
      const res = await fetch('/api/forest/water', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId }),
      })
      if (!res.ok) {
        // ロールバック
        setWateredByMeToday(prev => prev.filter(id => id !== targetUserId))
        setForest(prev =>
          prev.map(u =>
            u.userId === targetUserId
              ? { ...u, waterCount: (u.waterCount || 1) - 1, weeklyWaterCount: (u.weeklyWaterCount || 1) - 1 }
              : u
          )
        )
      }
    } catch {
      // ロールバック
      setWateredByMeToday(prev => prev.filter(id => id !== targetUserId))
    }
  }

  const getGreeting = () => {
    if (currentHour < 12) return 'おはようございます'
    if (currentHour < 18) return 'こんにちは'
    return 'こんばんは'
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'たった今'
    if (diffMins < 60) return `${diffMins}分前`
    if (diffHours < 24) return `${diffHours}時間前`
    if (diffDays < 7) return `${diffDays}日前`
    return format(date, 'M/d', { locale: ja })
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${theme.bg}`}>
      <TopBar isNight={isNight} />

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="text-center py-4">
          <p className={`text-sm ${theme.textMuted}`}>{today}</p>
          <h1 className={`text-xl font-semibold mt-1 ${theme.text}`}>
            {getGreeting()}、{userName || session?.user?.name}さん
          </h1>

          {/* 天気・気温・誕生日 */}
          {(weatherLocation || birthdays.length > 0) && (
            <div className={`mt-3 rounded-xl px-4 py-3 text-left ${isNight ? 'bg-[#2d2438]/60' : 'bg-white/60'}`}>
              {weatherLocation && (
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${theme.textMuted}`}>
                        📍 {weatherLocation}
                      </span>
                      {weatherTemp != null && (
                        <span className={`text-lg font-bold ${theme.text}`}>
                          {weatherTemp}°C
                        </span>
                      )}
                    </div>
                    {weatherTempMin != null && weatherTempMax != null && (
                      <span className={`text-xs ${theme.textFaint}`}>
                        {weatherTempMin}° / {weatherTempMax}°
                      </span>
                    )}
                  </div>
                  <p className={`text-xs mt-1 ${theme.textMuted}`}>
                    {WEATHER_LABELS[weather].icon} {WEATHER_LABELS[weather].label}
                    {weatherDescription && `（${weatherDescription}）`}
                  </p>
                </div>
              )}
              {birthdays.length > 0 && (
                <div className={`${weatherLocation ? 'mt-2 pt-2 border-t' : ''} ${isNight ? 'border-white/10' : 'border-black/5'}`}>
                  <p className={`text-xs ${theme.textMuted}`}>
                    🎂 <span className={`font-medium ${theme.text}`}>{birthdays[0].name}</span>（{birthdays[0].description}）の誕生日
                  </p>
                  {birthdays[0].quote && (
                    <p className={`text-xs mt-1 italic ${theme.accentText}`}>
                      「{birthdays[0].quote}」
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 今日のお題 */}
          {birthdays.length > 0 && birthdays[0].prompt && (
            <div className={`mt-3 rounded-xl px-4 py-3 text-left ${isNight ? 'bg-gradient-to-r from-[#2d2438]/80 to-[#1a1a2e]/80' : 'bg-gradient-to-r from-amber-50/80 to-orange-50/80'}`}>
              <p className={`text-xs font-bold ${isNight ? 'text-amber-300' : 'text-amber-600'} mb-1`}>
                💬 今日のお題
              </p>
              <p className={`text-sm leading-relaxed ${theme.text}`}>
                {birthdays[0].prompt}
              </p>
            </div>
          )}
        </div>

        {/* アクションボタン */}
        <div className="flex gap-3">
          <Link
            href="/share"
            className={`flex-1 flex items-center justify-center gap-2 ${theme.accent} ${theme.accentHover} text-white font-semibold px-4 py-3 rounded-xl transition`}
          >
            <span>☀️</span>
            <span>朝の投稿</span>
          </Link>
          <Link
            href="/night"
            className={`flex-1 flex items-center justify-center gap-2 ${theme.secondary} ${theme.secondaryHover} text-white font-semibold px-4 py-3 rounded-xl transition`}
          >
            <span>🌙</span>
            <span>夜の投稿</span>
          </Link>
        </div>

        {/* みんなの森 */}
        {forest.length > 0 && (
          <Card isNight={isNight} className="overflow-hidden">
            <div className="flex items-center justify-between">
              <CardTitle isNight={isNight}>みんなの森 🌳</CardTitle>
              {weatherLocation && (
                <span className={`text-xs ${theme.textFaint}`}>
                  📍 {weatherLocation}の天気
                </span>
              )}
            </div>
            <p className={`text-xs mb-3 ${theme.textMuted}`}>今月の投稿で木を育てよう</p>
            <Forest
              users={forest}
              currentUserId={session?.user?.id}
              weather={weather}
              isNight={isNight}
              mvpUserId={mvpUserId}
              wateredByMeToday={wateredByMeToday}
              onWaterTree={handleWaterTree}
            />
          </Card>
        )}

        {/* 今週のOKR */}
        {weeklyOKR && (
          <Card isNight={isNight}>
            <div className="flex items-center justify-between mb-2">
              <CardTitle isNight={isNight}>今週の目標</CardTitle>
              <Link
                href="/okr"
                className={`text-xs hover:underline ${theme.accentText}`}
              >
                編集 →
              </Link>
            </div>
            <p className={`font-medium mb-2 ${theme.text}`}>{weeklyOKR.objective}</p>
            {weeklyOKR.keyResults && weeklyOKR.keyResults.filter(kr => kr).length > 0 && (
              <ul className={`space-y-2 text-sm mb-2 ${theme.textMuted}`}>
                {weeklyOKR.keyResults.filter(kr => kr).map((kr, i) => {
                  const progress = weeklyOKR.keyResultsProgress?.[i] || 0
                  return (
                    <li key={i} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span>• {kr}</span>
                        <span className={`font-medium ${theme.accentText}`}>{progress}%</span>
                      </div>
                      <div className={`h-1.5 rounded-full overflow-hidden ${isNight ? 'bg-[#1a1625]' : 'bg-[#f0e8eb]'}`}>
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${isNight ? 'bg-[#9b7bb8]' : 'bg-[#d46a7e]'}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
            {/* 今週の点数（夜の投稿のselfScore平均） */}
            {weeklyAverageScore !== null && (
              <div className={`flex items-center justify-between rounded-lg px-4 py-3 mb-2 ${isNight ? 'bg-[#1a1625]' : 'bg-[#f0e8eb]'}`}>
                <span className={`text-sm ${theme.text}`}>今週の点数</span>
                <span className={`text-2xl font-bold ${theme.accentText}`}>{weeklyAverageScore.toFixed(1)}<span className={`text-sm font-normal ${theme.textMuted}`}>/10</span></span>
              </div>
            )}
            {weeklyOKR.focus && (
              <p className={`text-sm ${theme.accentText}`}>
                Focus: {weeklyOKR.focus}
              </p>
            )}
          </Card>
        )}

        {/* コーチからのフィードバック */}
        {coachingNote && (coachingNote.redline || coachingNote.question) && (
          <Card isNight={isNight} className={`border-2 ${theme.borderLight}`}>
            <CardTitle isNight={isNight}>コーチからのフィードバック</CardTitle>
            {coachingNote.redline && (
              <div className="mb-4">
                <p className={`text-sm mb-1 ${theme.textMuted}`}>赤入れ</p>
                <p className={theme.accentText}>{coachingNote.redline}</p>
              </div>
            )}
            {coachingNote.question && (
              <div>
                <p className={`text-sm mb-1 ${theme.textMuted}`}>問い</p>
                <p className={isNight ? 'text-[#b88fd0]' : 'text-[#c25a6e]'}>{coachingNote.question}</p>
              </div>
            )}
          </Card>
        )}

        {/* タイムライン */}
        <div>
          <h2 className={`text-lg font-semibold mb-4 ${theme.text}`}>みんなの投稿</h2>

          {loading ? (
            <Card isNight={isNight}>
              <div className={`text-center ${theme.textFaint}`}>読み込み中...</div>
            </Card>
          ) : timeline.length === 0 ? (
            <Card isNight={isNight}>
              <div className={`text-center ${theme.textFaint}`}>
                まだ投稿がありません
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {timeline.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-2xl p-4 shadow-sm ${
                    item.type === 'morning'
                      ? isNight
                        ? 'bg-gradient-to-br from-[#3d2438] to-[#2d1828] text-white border-l-4 border-[#c9a0dc]'
                        : 'bg-gradient-to-br from-white to-[#fff5f7] border-l-4 border-[#d46a7e]'
                      : item.type === 'night'
                      ? 'bg-gradient-to-br from-[#2d2438] to-[#1a1625] text-white border-l-4 border-[#9b7bb8]'
                      : isNight
                        ? 'bg-gradient-to-br from-[#2d3848] to-[#1a2535] text-white border-l-4 border-blue-400'
                        : 'bg-gradient-to-br from-white to-blue-50 border-l-4 border-blue-400'
                  } ${item.userId === session?.user?.id ? `ring-2 ${isNight ? 'ring-[#9b7bb8]/40' : 'ring-[#d46a7e]/30'}` : ''}`}
                >
                  {/* ヘッダー */}
                  <div className="flex items-center gap-3 mb-3">
                    {item.userImage ? (
                      <img
                        src={item.userImage}
                        alt={item.userName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        item.type === 'morning' ? 'bg-[#d46a7e]/20' :
                        item.type === 'night' ? 'bg-[#9b7bb8]/30' : 'bg-blue-100'
                      }`}>
                        <span className="text-lg">
                          {item.type === 'morning' ? '☀️' : item.type === 'night' ? '🌙' : '🎯'}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${item.type === 'night' || isNight ? 'text-white' : 'text-[#4a3f42]'}`}>
                          {item.userName}
                        </span>
                        {item.type === 'morning' && item.mood && (
                          <span className="text-lg">{MOOD_EMOJI[item.mood]}</span>
                        )}
                      </div>
                      <div className={`flex items-center gap-2 text-xs ${item.type === 'night' || isNight ? 'text-white/60' : 'text-[#4a3f42]/50'}`}>
                        <span className={
                          item.type === 'morning' ? 'text-[#d46a7e]' :
                          item.type === 'night' ? 'text-[#c9a0dc]' :
                          'text-blue-600'
                        }>
                          {item.type === 'morning' ? '☀️ 朝の投稿' :
                           item.type === 'night' ? '🌙 夜の投稿' :
                           item.okrType === 'weekly' ? '🎯 週間OKR' : '🎯 月間OKR'}
                        </span>
                        <span>•</span>
                        <span>{formatTimeAgo(item.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* コンテンツ */}
                  {item.type === 'morning' ? (
                    <div className="space-y-2">
                      {item.declaration && (
                        <p className={`font-medium ${isNight ? 'text-white' : 'text-[#4a3f42]'}`}>{item.declaration}</p>
                      )}
                      {item.promptQuestion && item.promptAnswer && (
                        <div className={`rounded-lg p-2.5 ${isNight ? 'bg-amber-900/20' : 'bg-amber-50/80'}`}>
                          <p className={`text-xs ${isNight ? 'text-amber-300/70' : 'text-amber-600/70'}`}>💬 {item.promptQuestion}</p>
                          <p className={`text-sm mt-1 ${isNight ? 'text-white/90' : 'text-[#4a3f42]'}`}>{item.promptAnswer}</p>
                        </div>
                      )}
                      {(item.value || item.action || item.letGo) && (
                        <div className={`text-sm space-y-1 pl-2 border-l-2 ${isNight ? 'text-white/70 border-[#c9a0dc]/30' : 'text-[#4a3f42]/70 border-[#d46a7e]/30'}`}>
                          {item.value && <p>価値観: {item.value}</p>}
                          {item.action && <p>行動: {item.action}</p>}
                          {item.letGo && <p>手放す: {item.letGo}</p>}
                        </div>
                      )}
                    </div>
                  ) : item.type === 'night' ? (
                    <div className="space-y-2">
                      {item.proudChoice && (
                        <div>
                          <p className="text-xs text-white/50">誇れる選択</p>
                          <p className="text-white/90">{item.proudChoice}</p>
                        </div>
                      )}
                      {item.learning && (
                        <div>
                          <p className="text-xs text-white/50">学び</p>
                          <p className="text-white/90">{item.learning}</p>
                        </div>
                      )}
                      {item.tomorrowMessage && (
                        <div className="bg-white/10 rounded-lg p-3 mt-2">
                          <p className="text-xs text-white/50 mb-1">明日の自分へ</p>
                          <p className="text-white font-medium">{item.tomorrowMessage}</p>
                        </div>
                      )}
                      {item.selfScore && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm text-white/50">今日の点数:</span>
                          <span className="text-lg font-bold text-[#c9a0dc]">{item.selfScore}/10</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className={`rounded-lg p-3 ${isNight ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                        <p className={`text-xs mb-1 ${isNight ? 'text-blue-300/70' : 'text-blue-600/70'}`}>
                          {item.okrType === 'weekly' ? '今週の目標' : '今月の目標'}
                        </p>
                        <p className={`font-medium ${isNight ? 'text-white' : 'text-[#4a3f42]'}`}>{item.objective}</p>
                      </div>
                      {item.keyResults && item.keyResults.filter(kr => kr).length > 0 && (
                        <ul className={`text-sm space-y-2 pl-2 border-l-2 ${isNight ? 'text-white/70 border-blue-400/50' : 'text-[#4a3f42]/70 border-blue-300'}`}>
                          {item.keyResults.filter(kr => kr).map((kr, i) => {
                            const progress = item.keyResultsProgress?.[i] || 0
                            return (
                              <li key={i} className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <span>• {kr}</span>
                                  <span className={`font-medium ${isNight ? 'text-blue-300' : 'text-blue-600'}`}>{progress}%</span>
                                </div>
                                <div className={`h-1.5 rounded-full overflow-hidden ml-3 ${isNight ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
                                  <div
                                    className={`h-full rounded-full transition-all duration-300 ${isNight ? 'bg-blue-400' : 'bg-blue-500'}`}
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                              </li>
                            )
                          })}
                        </ul>
                      )}
                      {item.focus && (
                        <p className={`text-sm ${isNight ? 'text-blue-300' : 'text-blue-600'}`}>Focus: {item.focus}</p>
                      )}
                      {item.identityFocus && (
                        <p className={`text-sm ${isNight ? 'text-blue-300' : 'text-blue-600'}`}>Identity: {item.identityFocus}</p>
                      )}
                    </div>
                  )}

                  {/* 応援セクション */}
                  {(() => {
                    // ユニークな応援者を取得（最新5人まで表示）
                    const uniqueCheeers = item.cheers.reduce((acc, cheer) => {
                      if (!acc.find(c => c.userId === cheer.userId)) {
                        acc.push(cheer)
                      }
                      return acc
                    }, [] as typeof item.cheers)

                    return (
                      <div className={`mt-3 pt-3 border-t ${item.type === 'night' ? 'border-white/20' : 'border-gray-200'}`}>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleCheer(item.id, item.type)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all active:scale-90 ${
                              item.type === 'night'
                                ? 'bg-white/10 text-white/70 hover:bg-pink-500/30 hover:text-pink-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-pink-100 hover:text-pink-600'
                            }`}
                          >
                            <span className="text-base">👏</span>
                            <span>応援</span>
                            {item.cheers.length > 0 && (
                              <span className={`ml-1 font-medium ${
                                item.type === 'night' ? 'text-white/90' : 'text-[#d46a7e]'
                              }`}>
                                {item.cheers.length}
                              </span>
                            )}
                          </button>

                          {/* 応援者のアバター（ユニークユーザーのみ表示） */}
                          {uniqueCheeers.length > 0 && (
                            <div className="flex items-center">
                              <div className="flex -space-x-2">
                                {uniqueCheeers.slice(0, 5).map((cheer, index) => (
                                  <div key={`${cheer.userId}-${index}`} className="relative group">
                                    {cheer.userImage ? (
                                      <img
                                        src={cheer.userImage}
                                        alt={cheer.userName}
                                        className="w-7 h-7 rounded-full border-2 border-white object-cover"
                                      />
                                    ) : (
                                      <div className={`w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium ${
                                        item.type === 'night' ? 'bg-purple-400 text-white' : 'bg-[#d46a7e]/20 text-[#d46a7e]'
                                      }`}>
                                        {cheer.userName.charAt(0)}
                                      </div>
                                    )}
                                    {/* ホバー時に名前を表示 */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                                      {cheer.userName}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              {uniqueCheeers.length > 5 && (
                                <span className={`ml-2 text-xs ${
                                  item.type === 'night' ? 'text-white/60' : 'text-gray-500'
                                }`}>
                                  +{uniqueCheeers.length - 5}人
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })()}

                  {/* superadmin用削除ボタン */}
                  {session?.user?.role === 'superadmin' && (
                    <div className={`mt-2 pt-2 border-t ${item.type === 'night' ? 'border-white/20' : 'border-[#d46a7e]/20'}`}>
                      <button
                        onClick={() => handleDeletePost(item.id, item.type)}
                        disabled={deleting === item.id}
                        className={`text-xs disabled:opacity-50 ${
                          item.type === 'night' ? 'text-red-300 hover:text-red-200' : 'text-red-500 hover:text-red-700'
                        }`}
                      >
                        {deleting === item.id ? '削除中...' : '🗑️ この投稿を削除'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
