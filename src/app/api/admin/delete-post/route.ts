import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { DailyShare } from '@/models/DailyShare'
import { NightJournal } from '@/models/NightJournal'
import { OKR } from '@/models/OKR'

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    // superadminのみ削除可能
    if (session.user.role !== 'superadmin') {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const postId = searchParams.get('id')
    const postType = searchParams.get('type')

    if (!postId || !postType) {
      return NextResponse.json({ error: 'id と type が必要です' }, { status: 400 })
    }

    await connectDB()

    let result
    switch (postType) {
      case 'morning':
        result = await DailyShare.findByIdAndDelete(postId)
        break
      case 'night':
        result = await NightJournal.findByIdAndDelete(postId)
        break
      case 'okr':
        result = await OKR.findByIdAndDelete(postId)
        break
      default:
        return NextResponse.json({ error: '無効な type です' }, { status: 400 })
    }

    if (!result) {
      return NextResponse.json({ error: '投稿が見つかりません' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: '削除しました' })
  } catch (error) {
    console.error('Delete post error:', error)
    return NextResponse.json({ error: '削除に失敗しました' }, { status: 500 })
  }
}
