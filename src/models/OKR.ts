import mongoose, { Schema, Document } from 'mongoose'

export interface IOKR extends Document {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  type: 'monthly' | 'weekly'
  periodKey: string
  objective: string
  keyResults: string[]
  focus?: string
  identityFocus?: string
  isShared: boolean
  createdAt: Date
  updatedAt: Date
}

const OKRSchema = new Schema<IOKR>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['monthly', 'weekly'], required: true },
    periodKey: { type: String, required: true },
    objective: { type: String, required: true },
    keyResults: { type: [String], default: [] },
    focus: { type: String },
    identityFocus: { type: String },
    isShared: { type: Boolean, default: false },
  },
  { timestamps: true }
)

OKRSchema.index({ userId: 1, type: 1, periodKey: 1 }, { unique: true })

export const OKR = mongoose.models.OKR || mongoose.model<IOKR>('OKR', OKRSchema)
