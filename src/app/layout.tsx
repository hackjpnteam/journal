import type { Metadata } from 'next'
import { Noto_Serif_JP } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { Providers } from './providers'

const notoSerifJP = Noto_Serif_JP({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  preload: false,
  variable: '--font-noto-serif-jp',
})

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
    <html lang="ja" className={notoSerifJP.variable}>
      <body className="antialiased" suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var hour = new Date().getHours();
                if (hour >= 17 || hour < 6) {
                  document.body.classList.add('night-mode');
                }
              })();
            `,
          }}
        />
        <Providers>{children}</Providers>
        <Script
          id="saleschat-widget"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var script = document.createElement('script');
                script.src = 'https://saleschat.me/widget.js';
                script.setAttribute('data-company-id', 'bc7965a1-e857-4822-82b9-149fa80555df');
                script.setAttribute('data-widget-base-url', 'https://saleschat.me/widget');
                script.defer = true;
                document.body.appendChild(script);
              })();
            `,
          }}
        />
      </body>
    </html>
  )
}
