'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useTimeTheme } from '@/hooks/useTimeTheme'

const navItems = [
  { href: '/', label: 'ホーム' },
  { href: '/share', label: '朝' },
  { href: '/night', label: '夜' },
  { href: '/calendar', label: 'カレンダー' },
  { href: '/okr', label: 'OKR' },
  { href: '/concept', label: 'コンセプト' },
  { href: '/profile', label: 'マイページ' },
]

interface TopBarProps {
  isNight?: boolean
}

export function TopBar({ isNight: isNightProp }: TopBarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const timeTheme = useTimeTheme()

  // propsで指定されていない場合はhookから取得
  const isNight = isNightProp ?? (timeTheme === 'night')

  const bgColor = isNight ? 'bg-[#2d2438]' : 'bg-[#c8848e]'
  const borderColor = isNight ? 'border-[#9b7bb8]/30' : 'border-white/20'

  return (
    <header className={`sticky top-0 z-50 shadow-md transition-colors duration-500 ${bgColor}`}>
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold text-white flex items-center gap-2">
            {isNight ? '🌙' : '☀️'} 究極の朝活
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-lg text-sm transition ${
                  pathname === item.href
                    ? 'bg-white/20 text-white'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.label}
              </Link>
            ))}

            {session && (
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="ml-2 px-3 py-1.5 rounded-lg text-sm text-white/80 hover:text-white hover:bg-white/10 transition"
              >
                ログアウト
              </button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-white"
            aria-label="メニュー"
          >
            {isMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className={`md:hidden mt-3 pt-3 border-t ${borderColor}`}>
            <div className="grid grid-cols-3 gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg text-sm text-center transition ${
                    pathname === item.href
                      ? 'bg-white/20 text-white'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </Link>
              ))}

            </div>

            {session && (
              <button
                onClick={() => {
                  setIsMenuOpen(false)
                  signOut({ callbackUrl: '/login' })
                }}
                className="w-full mt-3 px-3 py-2 rounded-lg text-sm text-white/80 hover:text-white hover:bg-white/10 transition text-center"
              >
                ログアウト
              </button>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}
