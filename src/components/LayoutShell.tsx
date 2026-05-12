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
          padding: '14px 32px',
          backgroundColor: '#111113',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <p style={{ fontSize: '11px', color: '#3f3f46', letterSpacing: '3px', textTransform: 'uppercase' }}>
            Plataforma de Inventario — Bases de Datos
          </p>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            backgroundColor: '#22c55e',
            boxShadow: '0 0 6px #22c55e',
          }} />
        </header>
        <div style={{ padding: '32px' }}>
          {children}
        </div>
      </main>
    </div>
  )
}
