import { format, startOfWeek, getISOWeek, getYear } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

const TIMEZONE = 'Asia/Tokyo'

export function getTokyoNow(): Date {
  return toZonedTime(new Date(), TIMEZONE)
}

export function getDateKey(date?: Date): string {
  const d = date ? toZonedTime(date, TIMEZONE) : getTokyoNow()
  return format(d, 'yyyy-MM-dd')
}

export function getMonthlyPeriodKey(date?: Date): string {
  const d = date ? toZonedTime(date, TIMEZONE) : getTokyoNow()
  return format(d, 'yyyy-MM')
}

export function getWeeklyPeriodKey(date?: Date): string {
  const d = date ? toZonedTime(date, TIMEZONE) : getTokyoNow()
  const year = getYear(startOfWeek(d, { weekStartsOn: 1 }))
  const week = getISOWeek(d)
  return `${year}-W${String(week).padStart(2, '0')}`
}

export type ShareWindowStatus = 'before' | 'open' | 'after'

export function getShareWindowStatus(): ShareWindowStatus {
  const now = getTokyoNow()
  const hours = now.getHours()
  const minutes = now.getMinutes()
  const totalMinutes = hours * 60 + minutes

  const openTime = 6 * 60 // 6:00 = 360分
  const closeTime = 9 * 60 // 9:00 = 540分

  if (totalMinutes < openTime) {
    return 'before'
  } else if (totalMinutes < closeTime) {
    return 'open'
  } else {
    return 'after'
  }
}

export function isShareWindowOpen(): boolean {
  return getShareWindowStatus() === 'open'
}

export function getShareWindowMessage(): string {
  const status = getShareWindowStatus()
  switch (status) {
    case 'before':
      return 'まだ投稿時間ではありません（6:00〜9:00）'
    case 'open':
      return '投稿可能です'
    case 'after':
      return '投稿ウィンドウは終了しました（閲覧のみ）'
  }
}

export type NightWindowStatus = 'before' | 'open' | 'after'

export function getNightWindowStatus(): NightWindowStatus {
  const now = getTokyoNow()
  const hours = now.getHours()
  const minutes = now.getMinutes()
  const totalMinutes = hours * 60 + minutes

  const openTime = 18 * 60 // 18:00 = 1080分
  const closeTime = 23 * 60 + 59 // 23:59 = 1439分

  if (totalMinutes < openTime) {
    return 'before'
  } else if (totalMinutes <= closeTime) {
    return 'open'
  } else {
    return 'after'
  }
}

export function isNightWindowOpen(): boolean {
  return getNightWindowStatus() === 'open'
}
