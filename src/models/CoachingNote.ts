import mongoose, { Schema, Document } from 'mongoose'

export interface ICoachingNote extends Document {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  coachId: mongoose.Types.ObjectId
  dateKey: string
  redline?: string
  question?: string
  createdAt: Date
  updatedAt: Date
}

const CoachingNoteSchema = new Schema<ICoachingNote>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    coachId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    dateKey: { type: String, required: true },
    redline: { type: String },
    question: { type: String },
  },
  { timestamps: true }
)

CoachingNoteSchema.index({ userId: 1, dateKey: 1 }, { unique: true })

export const CoachingNote =
  mongoose.models.CoachingNote || mongoose.model<ICoachingNote>('CoachingNote', CoachingNoteSchema)
