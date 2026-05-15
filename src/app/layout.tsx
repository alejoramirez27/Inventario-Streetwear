import type { Metadata } from 'next'
import './globals.css'
import LayoutShell from '@/components/LayoutShell'

export const metadata: Metadata = {
  title: 'Inventario Streetwear',
  description: 'Plataforma de gestión de inventario para tienda urbana',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, backgroundColor: '#09090b' }}>
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  )
}
