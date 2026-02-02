import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { connectDB } from './db'
import { User } from '@/models/User'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('メールアドレスとパスワードを入力してください')
        }

        await connectDB()

        const user = await User.findOne({ email: credentials.email })
        if (!user) {
          throw new Error('アカウントが見つかりません')
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!isValid) {
          throw new Error('パスワードが正しくありません')
        }

        // 環境変数に基づいてロールを更新
        // SUPERADMIN_EMAIL はカンマ区切りで複数指定可能
        const superadminEmails = process.env.SUPERADMIN_EMAIL?.split(',').map(e => e.trim()) || []
        const coachEmail = process.env.COACH_EMAIL
        let role = user.role

        if (superadminEmails.includes(user.email) && user.role !== 'superadmin') {
          role = 'superadmin'
          await User.findByIdAndUpdate(user._id, { role: 'superadmin' })
        } else if (coachEmail && user.email === coachEmail && user.role === 'member') {
          role = 'coach'
          await User.findByIdAndUpdate(user._id, { role: 'coach' })
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role,
          onboardingCompleted: user.onboardingCompleted,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.name = user.name
        token.role = user.role
        token.onboardingCompleted = user.onboardingCompleted
      }
      // セッション更新時（プロフィール変更など）
      if (trigger === 'update' && session) {
        if (session.onboardingCompleted !== undefined) {
          token.onboardingCompleted = session.onboardingCompleted
        }
        if (session.name) {
          token.name = session.name
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.name = token.name as string
        session.user.role = token.role as 'member' | 'coach' | 'superadmin'
        session.user.onboardingCompleted = token.onboardingCompleted as boolean
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
