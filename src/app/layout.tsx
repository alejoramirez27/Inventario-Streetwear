import type { Metadata } from 'next'
import './globals.css'
import LayoutShell from '@/components/LayoutShell'
import Providers    from '@/components/Providers'

export const metadata: Metadata = {
  title:       'Inventario Streetwear',
  description: 'Plataforma de gestión de inventario para tienda urbana',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Providers>
          <LayoutShell>{children}</LayoutShell>
        </Providers>
      </body>
    </html>
  )
}
