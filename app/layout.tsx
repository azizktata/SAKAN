import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SAKAN · سكن — Immobilier éthique en Tunisie',
  description:
    'Trouvez votre logement en toute confiance. Plateforme immobilière éthique, sans intermédiaires complexes, sans crédit.',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
