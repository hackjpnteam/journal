import mongoose, { Schema, Document } from 'mongoose'
import { MOODS, type Mood } from '@/lib/constants'

export { MOODS, MOOD_EMOJI, MOOD_LABEL, type Mood } from '@/lib/constants'

export interface IDailyShare extends Document {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  dateKey: string
  mood: Mood
  value?: string       // 今日、最も大切にする価値観・判断基準
  action?: string      // 今日これができたら「前に進んだ」と言える行動
  letGo?: string       // 今日、手放す思考・感情
  declaration: string  // 今日の宣言
  createdAt: Date
  updatedAt: Date
}

const DailyShareSchema = new Schema<IDailyShare>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    dateKey: { type: String, required: true },
    mood: { type: String, enum: MOODS, required: true },
    value: { type: String },
    action: { type: String },
    letGo: { type: String },
    declaration: { type: String, required: true },
  },
  { timestamps: true }
)

DailyShareSchema.index({ userId: 1, dateKey: 1 }, { unique: true })
DailyShareSchema.index({ dateKey: 1 })

export const DailyShare = mongoose.models.DailyShare || mongoose.model<IDailyShare>('DailyShare', DailyShareSchema)
