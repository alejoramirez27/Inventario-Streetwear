'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

interface Session {
  id:     string
  nombre: string
  rol:    'administrador' | 'bodeguero'
}

const allLinks = [
  { href: '/',            label: 'Dashboard',   icon: '📊', roles: ['administrador', 'bodeguero'] },
  { href: '/colecciones', label: 'Colecciones', icon: '🗂️',  roles: ['administrador'] },
  { href: '/prendas',     label: 'Prendas',     icon: '👕',  roles: ['administrador'] },
  { href: '/inventario',  label: 'Inventario',  icon: '📦',  roles: ['administrador', 'bodeguero'] },
  { href: '/solicitudes', label: 'Solicitudes', icon: '📋',  roles: ['administrador', 'bodeguero'] },
  { href: '/salidas',     label: 'Salidas',     icon: '📤',  roles: ['administrador', 'bodeguero'] },
  { href: '/clientes',    label: 'Aliados',     icon: '🤝',  roles: ['administrador', 'bodeguero'] },
  { href: '/reportes',    label: 'Reportes',    icon: '📈',  roles: ['administrador', 'bodeguero'] },
]

function parseSession(): Session | null {
  if (typeof window === 'undefined') return null
  try {
    const match = document.cookie.match(/(?:^|;\s*)inv_session=([^;]+)/)
    if (!match) return null
    return JSON.parse(decodeURIComponent(match[1]))
  } catch {
    return null
  }
}

export default function Sidebar() {
  const pathname = usePathname()
  const router   = useRouter()
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    setSession(parseSession())
  }, [])

  const links = session
    ? allLinks.filter(l => l.roles.includes(session.rol))
    : allLinks

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  return (
    <aside style={{
      width: '240px', height: '100vh', backgroundColor: '#111113',
      borderRight: '1px solid #27272a', display: 'flex', flexDirection: 'column',
      position: 'fixed', top: 0, left: 0, zIndex: 100, overflow: 'hidden',
    }}>
      {/* Marca */}
      <div style={{ padding: '28px 24px', borderBottom: '1px solid #27272a' }}>
        <p style={{ fontSize: '10px', color: '#52525b', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '6px' }}>
          Sistema de
        </p>
        <h1 style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff', letterSpacing: '2px' }}>
          INVENTARIO
        </h1>
        <p style={{ fontSize: '10px', color: '#52525b', letterSpacing: '3px', textTransform: 'uppercase', marginTop: '2px' }}>
          Streetwear
        </p>
      </div>

      {/* Navegación */}
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        {links.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link key={link.href} href={link.href} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', marginBottom: '2px', borderRadius: '8px',
              textDecoration: 'none', fontSize: '13.5px',
              fontWeight: isActive ? '600' : '400',
              color: isActive ? '#ffffff' : '#71717a',
              backgroundColor: isActive ? '#27272a' : 'transparent',
              borderLeft: isActive ? '3px solid #ffffff' : '3px solid transparent',
              transition: 'all 0.15s ease',
            }}>
              <span style={{ fontSize: '15px', width: '20px', textAlign: 'center' }}>
                {link.icon}
              </span>
              {link.label}
            </Link>
          )
        })}
      </nav>

      {/* Usuario + Logout */}
      <div style={{ padding: '16px', borderTop: '1px solid #27272a' }}>
        {session && (
          <div style={{
            backgroundColor: '#1c1c1f', borderRadius: '8px',
            padding: '12px', marginBottom: '10px',
          }}>
            <p style={{ fontSize: '13px', color: '#ffffff', fontWeight: '600', marginBottom: '4px' }}>
              {session.nombre}
            </p>
            <span style={{
              fontSize: '10px', color: '#a1a1aa', textTransform: 'uppercase',
              letterSpacing: '1px', backgroundColor: '#27272a',
              padding: '2px 8px', borderRadius: '4px',
            }}>
              {session.rol}
            </span>
          </div>
        )}
        <button
          onClick={handleLogout}
          style={{
            width: '100%', backgroundColor: '#27272a',
            border: '1px solid #3f3f46', borderRadius: '6px',
            padding: '10px 12px', color: '#ffffff', fontSize: '12px',
            fontWeight: '500', cursor: 'pointer', textAlign: 'center',
          }}
        >
          Cerrar sesión →
        </button>
      </div>
    </aside>
  )
}
