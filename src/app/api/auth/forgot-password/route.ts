import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { Resend } from 'resend'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'

function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY is not set')
  return new Resend(key)
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { message: 'メールアドレスを入力してください' },
        { status: 400 }
      )
    }

    await connectDB()

    const user = await User.findOne({ email })

    // セキュリティ: メールの存在有無に関わらず同じメッセージを返す
    if (!user) {
      return NextResponse.json({
        message: 'パスワードリセットのメールを送信しました。メールをご確認ください。',
      })
    }

    // トークン生成（256ビット）
    const resetToken = crypto.randomBytes(32).toString('hex')
    // DBにはハッシュ化して保存
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    // 有効期限は1時間
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000)

    await User.updateOne(
      { _id: user._id },
      { resetToken: hashedToken, resetTokenExpiry }
    )

    // リセットURL
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`

    // メール送信
    const emailFrom = process.env.EMAIL_FROM || 'onboarding@resend.dev'

    await getResend().emails.send({
      from: emailFrom,
      to: email,
      subject: '【究極の朝活】パスワードリセットのご案内',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d46a7e;">究極の朝活 - パスワードリセット</h2>
          <p>${user.name}さん、こんにちは。</p>
          <p>パスワードリセットのリクエストを受け付けました。</p>
          <p>以下のボタンをクリックして、新しいパスワードを設定してください。</p>
          <p style="margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #d46a7e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
              パスワードを再設定する
            </a>
          </p>
          <p style="color: #666; font-size: 14px;">
            このリンクは1時間で無効になります。<br>
            もしこのリクエストに心当たりがない場合は、このメールを無視してください。
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">
            このメールは究極の朝活から自動送信されています。
          </p>
        </div>
      `,
    })

    return NextResponse.json({
      message: 'パスワードリセットのメールを送信しました。メールをご確認ください。',
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { message: 'エラーが発生しました。しばらくしてからお試しください。' },
      { status: 500 }
    )
  }
}
