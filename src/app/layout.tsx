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
      <body>{children}</body>
    </html>
  )
}
