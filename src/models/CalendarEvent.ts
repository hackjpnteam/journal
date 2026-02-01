import mongoose, { Schema, Document } from 'mongoose'

// ジャーナル投稿とGoogleカレンダーイベントの紐付け
export interface ICalendarEvent extends Document {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  dateKey: string // yyyy-MM-dd
  type: 'morning' | 'night'
  eventId: string // GoogleカレンダーのイベントID
  createdAt: Date
  updatedAt: Date
}

const CalendarEventSchema = new Schema<ICalendarEvent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    dateKey: { type: String, required: true },
    type: { type: String, enum: ['morning', 'night'], required: true },
    eventId: { type: String, required: true },
  },
  { timestamps: true }
)

// 冪等性のための複合ユニークインデックス
CalendarEventSchema.index({ userId: 1, dateKey: 1, type: 1 }, { unique: true })

export const CalendarEvent =
  mongoose.models.CalendarEvent ||
  mongoose.model<ICalendarEvent>('CalendarEvent', CalendarEventSchema)
