import 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    email: string
    name: string
    role: 'member' | 'coach'
    onboardingCompleted: boolean
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: 'member' | 'coach'
      onboardingCompleted: boolean
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: 'member' | 'coach'
    onboardingCompleted: boolean
  }
}
