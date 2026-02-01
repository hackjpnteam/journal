'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'

const navItems = [
  { href: '/', label: 'ホーム' },
  { href: '/share', label: '朝' },
  { href: '/night', label: '夜' },
  { href: '/calendar', label: 'カレンダー' },
  { href: '/okr', label: 'OKR' },
  { href: '/concept', label: 'コンセプト' },
]

export function TopBar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-50 bg-[#d46a7e] shadow-md">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold text-white">
            Ultimate Morning
          </Link>

          <nav className="flex items-center gap-1">
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

            {session?.user.role === 'coach' && (
              <Link
                href="/coach"
                className={`px-3 py-1.5 rounded-lg text-sm transition ${
                  pathname === '/coach'
                    ? 'bg-white text-[#d46a7e]'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                Coach
              </Link>
            )}

            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="ml-2 px-3 py-1.5 rounded-lg text-sm text-white/80 hover:text-white hover:bg-white/10 transition"
            >
              ログアウト
            </button>
          </nav>
        </div>
      </div>
    </header>
  )
}
