export const MOODS = ['chaotic', 'flat', 'stable', 'fire', 'recover'] as const
export type Mood = (typeof MOODS)[number]

export const MOOD_EMOJI: Record<Mood, string> = {
  chaotic: '😵‍💫',
  flat: '😐',
  stable: '🙂',
  fire: '🔥',
  recover: '🌱',
}

export const MOOD_LABEL: Record<Mood, string> = {
  chaotic: 'カオス',
  flat: 'フラット',
  stable: '安定',
  fire: '燃えてる',
  recover: '回復中',
}
