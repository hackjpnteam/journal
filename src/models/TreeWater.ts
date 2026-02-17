import mongoose, { Schema, Document } from 'mongoose'

export interface ITreeWater extends Document {
  _id: mongoose.Types.ObjectId
  fromUserId: mongoose.Types.ObjectId
  targetUserId: mongoose.Types.ObjectId
  fromUserName: string
  createdAt: Date
}

const TreeWaterSchema = new Schema<ITreeWater>({
  fromUserId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  targetUserId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  fromUserName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
})

// 同じユーザーが同じ日に同じ木に水やりしたかチェック用
TreeWaterSchema.index({ fromUserId: 1, targetUserId: 1, createdAt: 1 })
// ターゲットごとの水やり数集計用
TreeWaterSchema.index({ targetUserId: 1, createdAt: 1 })

export const TreeWater = mongoose.models.TreeWater || mongoose.model<ITreeWater>('TreeWater', TreeWaterSchema)
