import type { Metadata } from 'next'
import { Libre_Baskerville } from 'next/font/google'
import { GeistSans } from 'geist/font/sans'
import './globals.css'
import { PublishDialogClient } from '@/components/publish/publish-dialog-client'
import { EstimationDialogClient } from '@/components/estimation/estimation-dialog-client'
import { AuthProvider } from '@/lib/auth-context'
import { ToastProvider } from '@/components/ui/toast'
import SessionProvider from '@/components/session-provider'

const libreBaskerville = Libre_Baskerville({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-canela',
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
    <html lang="fr" className={`${libreBaskerville.variable} ${GeistSans.variable}`}>
      <body className="min-h-full flex flex-col">
          <AuthProvider>
            <SessionProvider>
              <ToastProvider>
                {children}
                <PublishDialogClient />
                <EstimationDialogClient />
              </ToastProvider>
            </SessionProvider>
          </AuthProvider>
        </body>
    </html>
  )
}
