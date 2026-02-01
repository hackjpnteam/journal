import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: '究極の朝活',
  description: '毎朝7時の宣言で1日を始める',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        <Providers>{children}</Providers>
        <Script
          src="https://saleschat.me/widget.js"
          data-company-id="bc7965a1-e857-4822-82b9-149fa80555df"
          data-widget-base-url="https://saleschat.me/widget"
          strategy="lazyOnload"
        />
      </body>
    </html>
  )
}
