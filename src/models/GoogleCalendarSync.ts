import mongoose, { Schema, Document } from 'mongoose'

export interface IGoogleCalendarSync extends Document {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  accessToken: string
  refreshToken: string
  tokenExpiry: Date
  calendarId?: string // 専用カレンダー「究極の朝活」のID
  reminderEventId?: string // 毎日7:00の通知イベントID
  isEnabled: boolean
  createdAt: Date
  updatedAt: Date
}

const GoogleCalendarSyncSchema = new Schema<IGoogleCalendarSync>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },
    tokenExpiry: { type: Date, required: true },
    calendarId: { type: String },
    reminderEventId: { type: String },
    isEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export const GoogleCalendarSync =
  mongoose.models.GoogleCalendarSync ||
  mongoose.model<IGoogleCalendarSync>('GoogleCalendarSync', GoogleCalendarSyncSchema)
