'use client'
import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Login no lleva sidebar ni header
  if (pathname === '/login') {
    return <>{children}</>
  }

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main style={{
        marginLeft: '240px',
        flex: 1,
        minHeight: '100vh',
        backgroundColor: '#09090b',
      }}>
        <header style={{
          borderBottom: '1px solid #27272a',
          padding: '16px 32px',
          backgroundColor: '#09090b',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}>
          <p style={{ fontSize: '12px', color: '#3f3f46', letterSpacing: '2px', textTransform: 'uppercase' }}>
            Plataforma de Inventario — Bases de Datos
          </p>
        </header>
        <div style={{ padding: '32px' }}>
          {children}
        </div>
      </main>
    </div>
  )
}
