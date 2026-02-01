import mongoose, { Schema, Document } from 'mongoose'

export interface INightJournal extends Document {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  dateKey: string
  proudChoice?: string      // 今日、自分を誇れる選択は何だったか？
  offChoice?: string        // ズレた選択はあったか？ なぜ起きたか？
  moodReflection?: string   // 今日の状態（朝の顔マーク）は正しかったか？
  learning?: string         // 今日の学びは何だったか？
  tomorrowMessage?: string  // 明日の自分に一言メッセージを書くとしたら？
  selfScore?: number        // 今日の自分を点数つけるとしたら？（1-10）
  isShared: boolean         // 共有するかどうか
  createdAt: Date
  updatedAt: Date
}

const NightJournalSchema = new Schema<INightJournal>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    dateKey: { type: String, required: true },
    proudChoice: { type: String },
    offChoice: { type: String },
    moodReflection: { type: String },
    learning: { type: String },
    tomorrowMessage: { type: String },
    selfScore: { type: Number, min: 1, max: 10 },
    isShared: { type: Boolean, default: false },
  },
  { timestamps: true }
)

NightJournalSchema.index({ userId: 1, dateKey: 1 }, { unique: true })
NightJournalSchema.index({ dateKey: 1, isShared: 1 })

export const NightJournal = mongoose.models.NightJournal || mongoose.model<INightJournal>('NightJournal', NightJournalSchema)
