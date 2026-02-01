import mongoose from 'mongoose'

/**
 * MongoDB ObjectIdの形式を検証
 */
export function isValidObjectId(id: string | null | undefined): boolean {
  if (!id) return false
  return mongoose.Types.ObjectId.isValid(id) && new mongoose.Types.ObjectId(id).toString() === id
}

/**
 * 文字列をサニタイズ（XSS対策）
 */
export function sanitizeString(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}
