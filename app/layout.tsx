import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { PublishDialogClient } from '@/components/publish/publish-dialog-client'
import { AuthProvider } from '@/lib/auth-context'

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
      <body className="min-h-full flex flex-col">
          <AuthProvider>
            {children}
            <PublishDialogClient />
          </AuthProvider>
        </body>
    </html>
  )
}
