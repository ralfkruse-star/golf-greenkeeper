import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Golf Greenkeeper',
  description: 'Digital Platzpflege & Maintenance Management',
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
