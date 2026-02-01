/**
 * Google Calendar連携ユーティリティ
 *
 * 実装予定の機能：
 *
 * ブロックA: 同期 = 自動設置
 * - OAuth callback完了したら自動で
 *   1) 専用カレンダー「究極の朝活」作成（既存があれば再利用）
 *   2) 毎日7:00の通知イベント（繰返し+popup0分前）作成（既存があれば再利用）
 * - calendarIdとreminderEventIdをDB保存
 * - 何度同期しても増殖しない（冪等）実装
 *
 * ブロックB: 冪等のキー
 * - カレンダー：summary="究極の朝活" で検索して再利用
 * - 通知イベント：extendedProperties.private.app="ultimate-morning-reminder" を付け、同プロパティで検索
 * - ログイベント：userId+dateKey+type(morning/night) の eventId をDB保存しupsert
 *
 * ブロックC: 投稿→カレンダー反映
 * - 朝/夜投稿保存成功後にGoogle Calendarへログ反映
 * - 朝ログは7:05、夜ログは21:30（Asia/Tokyo）
 * - タイトル：朝「究極の朝活 ☀️ {mood}」夜「究極の夜活 🌙 {mood}」
 * - 説明：宣言1文 + 詳細URL（全文はサイト側）
 */

import { GoogleCalendarSync, IGoogleCalendarSync } from '@/models/GoogleCalendarSync'
import { CalendarEvent } from '@/models/CalendarEvent'
import { MOOD_EMOJI, type Mood } from './constants'

// カレンダー名
export const CALENDAR_NAME = '究極の朝活'

// 拡張プロパティのキー
export const REMINDER_EVENT_APP_KEY = 'ultimate-morning-reminder'

// 投稿時間設定（Asia/Tokyo）
export const MORNING_LOG_HOUR = 7
export const MORNING_LOG_MINUTE = 5
export const NIGHT_LOG_HOUR = 21
export const NIGHT_LOG_MINUTE = 30

/**
 * Google Calendar連携が有効かどうかをチェック
 * TODO: Google API実装後に有効化
 */
export async function isGoogleCalendarEnabled(userId: string): Promise<boolean> {
  // 実装中は常にfalse
  return false

  // const sync = await GoogleCalendarSync.findOne({ userId, isEnabled: true })
  // return !!sync?.calendarId
}

/**
 * 専用カレンダー「究極の朝活」を作成または取得
 * 冪等性：summary="究極の朝活" で検索して再利用
 * TODO: Google API実装後に有効化
 */
export async function getOrCreateCalendar(sync: IGoogleCalendarSync): Promise<string | null> {
  // TODO: Google Calendar APIを使用して実装
  // 1. calendar.calendarList.list() でsummary="究極の朝活"を検索
  // 2. 見つかればそのIDを返す
  // 3. なければcalendar.calendars.insert()で作成

  return null
}

/**
 * 毎日7:00の通知イベントを作成または取得
 * 冪等性：extendedProperties.private.app="ultimate-morning-reminder" で検索
 * TODO: Google API実装後に有効化
 */
export async function getOrCreateReminderEvent(
  sync: IGoogleCalendarSync,
  calendarId: string
): Promise<string | null> {
  // TODO: Google Calendar APIを使用して実装
  // 1. events.list() でextendedProperties.private.app="ultimate-morning-reminder"を検索
  // 2. 見つかればそのIDを返す
  // 3. なければevents.insert()で繰り返しイベント作成
  //    - 毎日7:00 JST
  //    - popup 0分前のリマインダー
  //    - extendedProperties.private.app = "ultimate-morning-reminder"

  return null
}

/**
 * 朝のジャーナルをカレンダーに記録
 * 冪等性：userId+dateKey+"morning" でDB管理
 * TODO: Google API実装後に有効化
 */
export async function logMorningJournal(
  userId: string,
  dateKey: string,
  mood: Mood,
  declaration: string
): Promise<boolean> {
  // 実装中は何もしない
  return false

  /*
  const sync = await GoogleCalendarSync.findOne({ userId, isEnabled: true })
  if (!sync?.calendarId) return false

  const emoji = MOOD_EMOJI[mood]
  const title = `究極の朝活 ☀️ ${emoji}`
  const description = `${declaration}\n\n詳細: https://ultimate-morning.vercel.app/calendar`

  // 7:05 JST
  const startTime = new Date(`${dateKey}T${String(MORNING_LOG_HOUR).padStart(2, '0')}:${String(MORNING_LOG_MINUTE).padStart(2, '0')}:00+09:00`)
  const endTime = new Date(startTime.getTime() + 15 * 60 * 1000) // 15分

  // TODO: Google Calendar APIでイベント作成/更新
  // events.insert() または events.update()

  // DB保存（upsert）
  await CalendarEvent.findOneAndUpdate(
    { userId, dateKey, type: 'morning' },
    { userId, dateKey, type: 'morning', eventId: 'GOOGLE_EVENT_ID' },
    { upsert: true, new: true }
  )

  return true
  */
}

/**
 * 夜のジャーナルをカレンダーに記録
 * 冪等性：userId+dateKey+"night" でDB管理
 * TODO: Google API実装後に有効化
 */
export async function logNightJournal(
  userId: string,
  dateKey: string,
  selfScore?: number,
  tomorrowMessage?: string
): Promise<boolean> {
  // 実装中は何もしない
  return false

  /*
  const sync = await GoogleCalendarSync.findOne({ userId, isEnabled: true })
  if (!sync?.calendarId) return false

  const title = `究極の夜活 🌙${selfScore ? ` ${selfScore}/10` : ''}`
  const description = tomorrowMessage
    ? `明日の自分へ: ${tomorrowMessage}\n\n詳細: https://ultimate-morning.vercel.app/calendar`
    : `詳細: https://ultimate-morning.vercel.app/calendar`

  // 21:30 JST
  const startTime = new Date(`${dateKey}T${String(NIGHT_LOG_HOUR).padStart(2, '0')}:${String(NIGHT_LOG_MINUTE).padStart(2, '0')}:00+09:00`)
  const endTime = new Date(startTime.getTime() + 15 * 60 * 1000) // 15分

  // TODO: Google Calendar APIでイベント作成/更新

  // DB保存（upsert）
  await CalendarEvent.findOneAndUpdate(
    { userId, dateKey, type: 'night' },
    { userId, dateKey, type: 'night', eventId: 'GOOGLE_EVENT_ID' },
    { upsert: true, new: true }
  )

  return true
  */
}

/**
 * OAuth完了後の自動セットアップ
 * 1. 専用カレンダー作成
 * 2. 毎日7:00の通知イベント作成
 * TODO: Google API実装後に有効化
 */
export async function setupGoogleCalendar(userId: string): Promise<boolean> {
  // 実装中は何もしない
  return false

  /*
  const sync = await GoogleCalendarSync.findOne({ userId })
  if (!sync) return false

  // 1. カレンダー作成/取得
  const calendarId = await getOrCreateCalendar(sync)
  if (!calendarId) return false

  // 2. リマインダーイベント作成/取得
  const reminderEventId = await getOrCreateReminderEvent(sync, calendarId)

  // DB更新
  sync.calendarId = calendarId
  sync.reminderEventId = reminderEventId || undefined
  await sync.save()

  return true
  */
}
