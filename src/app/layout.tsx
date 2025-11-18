import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Golf Greenkeeper - Platzpflege Management',
  description: 'Digitales Platzpflege- und Maintenance-Management-System für Golfplätze',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#10B981" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Golf Greenkeeper" />
      </head>
      <body>{children}</body>
    </html>
  )
}
