import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // 未ログインは /lp へ
    if (!token) {
      return NextResponse.redirect(new URL('/lp', req.url))
    }

    // onboarding未完了の場合は /onboarding へリダイレクト
    if (!token.onboardingCompleted && pathname !== '/onboarding') {
      return NextResponse.redirect(new URL('/onboarding', req.url))
    }

    // onboarding完了済みで /onboarding にアクセスした場合は / へ
    if (token.onboardingCompleted && pathname === '/onboarding') {
      return NextResponse.redirect(new URL('/', req.url))
    }

    // /coach と /api/coach/* は coach のみ
    if ((pathname.startsWith('/coach') || pathname.startsWith('/api/coach')) && token.role !== 'coach') {
      return NextResponse.redirect(new URL('/', req.url))
    }

    // /admin と /api/admin/* は superadmin のみ
    if ((pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) && token.role !== 'superadmin') {
      return NextResponse.redirect(new URL('/', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/lp',
    },
  }
)

export const config = {
  matcher: [
    '/',
    '/onboarding',
    '/share',
    '/calendar',
    '/okr',
    '/night',
    '/profile',
    '/coach/:path*',
    '/admin/:path*',
    '/api/coach/:path*',
    '/api/admin/:path*',
    '/api/profile/:path*',
  ],
}
