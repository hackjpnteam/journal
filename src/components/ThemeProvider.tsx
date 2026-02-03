'use client'

import { useEffect } from 'react'
import { useTimeTheme } from '@/hooks/useTimeTheme'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const timeTheme = useTimeTheme()

  useEffect(() => {
    if (timeTheme === 'night') {
      document.body.classList.add('night-mode')
    } else {
      document.body.classList.remove('night-mode')
    }
  }, [timeTheme])

  return <>{children}</>
}
