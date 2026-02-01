import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId
  email: string
  passwordHash: string
  name: string
  avatar?: string
  role: 'member' | 'coach' | 'superadmin'
  onboardingCompleted: boolean
  createdAt: Date
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
  avatar: { type: String, default: '👤' },
  role: { type: String, enum: ['member', 'coach', 'superadmin'], default: 'member' },
  onboardingCompleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
})

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
