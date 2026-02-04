import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId
  email: string
  passwordHash: string
  name: string
  profileImage?: string
  role: 'member' | 'coach' | 'superadmin'
  onboardingCompleted: boolean
  resetToken?: string
  resetTokenExpiry?: Date
  createdAt: Date
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
  profileImage: { type: String },
  role: { type: String, enum: ['member', 'coach', 'superadmin'], default: 'member' },
  onboardingCompleted: { type: Boolean, default: false },
  resetToken: { type: String },
  resetTokenExpiry: { type: Date },
  createdAt: { type: Date, default: Date.now },
})

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
