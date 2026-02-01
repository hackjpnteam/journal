import mongoose, { Schema, Document } from 'mongoose'

export interface ICheer extends Document {
  _id: mongoose.Types.ObjectId
  postId: mongoose.Types.ObjectId
  postType: 'morning' | 'night' | 'okr'
  userId: mongoose.Types.ObjectId
  userName: string
  userImage?: string
  createdAt: Date
}

const CheerSchema = new Schema<ICheer>({
  postId: { type: Schema.Types.ObjectId, required: true },
  postType: { type: String, enum: ['morning', 'night', 'okr'], required: true },
  userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  userName: { type: String, required: true },
  userImage: { type: String },
  createdAt: { type: Date, default: Date.now },
})

// 投稿ごとの応援を効率的に取得するためのインデックス
CheerSchema.index({ postId: 1 })

export const Cheer = mongoose.models.Cheer || mongoose.model<ICheer>('Cheer', CheerSchema)
