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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
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
          strategy="afterInteractive"
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
