'use client'

import { MOODS, MOOD_EMOJI, MOOD_LABEL, type Mood } from '@/lib/constants'

interface MoodPickerProps {
  selected: Mood | null
  onChange: (mood: Mood) => void
  disabled?: boolean
}

export function MoodPicker({ selected, onChange, disabled }: MoodPickerProps) {
  return (
    <div className="flex gap-2 justify-center flex-wrap">
      {MOODS.map((mood) => (
        <button
          key={mood}
          type="button"
          onClick={() => onChange(mood)}
          disabled={disabled}
          className={`
            flex flex-col items-center p-3 rounded-xl transition-all
            ${
              selected === mood
                ? 'bg-[#d46a7e]/10 ring-2 ring-[#d46a7e]'
                : 'bg-[#f0e8eb] hover:bg-[#d46a7e]/10'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <span className="text-3xl">{MOOD_EMOJI[mood]}</span>
          <span className="text-xs mt-1 text-[#4a3f42]/70">{MOOD_LABEL[mood]}</span>
        </button>
      ))}
    </div>
  )
}
