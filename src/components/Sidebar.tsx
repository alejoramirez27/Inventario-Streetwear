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
  { href: '/',            label: 'Dashboard',   icon: '◈', roles: ['administrador', 'bodeguero'] },
  { href: '/colecciones', label: 'Colecciones', icon: '◻', roles: ['administrador'] },
  { href: '/prendas',     label: 'Prendas',     icon: '◈', roles: ['administrador'] },
  { href: '/inventario',  label: 'Inventario',  icon: '▦', roles: ['administrador', 'bodeguero'] },
  { href: '/solicitudes', label: 'Solicitudes', icon: '◉', roles: ['administrador', 'bodeguero'] },
  { href: '/salidas',     label: 'Salidas',     icon: '▷', roles: ['administrador', 'bodeguero'] },
  { href: '/reportes',    label: 'Reportes',    icon: '▤', roles: ['administrador'] },
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
    : allLinks  // mientras hidrata, muestra todos (el middleware ya protege)

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <aside style={{
      width: '240px', minHeight: '100vh', backgroundColor: '#18181b',
      borderRight: '1px solid #27272a', display: 'flex', flexDirection: 'column',
      position: 'fixed', top: 0, left: 0, zIndex: 100,
    }}>
      {/* Marca */}
      <div style={{ padding: '28px 24px', borderBottom: '1px solid #27272a' }}>
        <p style={{ fontSize: '11px', color: '#71717a', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '4px' }}>
          Sistema de
        </p>
        <h1 style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff', letterSpacing: '1px' }}>
          INVENTARIO
        </h1>
        <p style={{ fontSize: '11px', color: '#71717a', letterSpacing: '2px', textTransform: 'uppercase' }}>
          Streetwear
        </p>
      </div>

      {/* Navegación */}
      <nav style={{ flex: 1, padding: '16px 12px' }}>
        {links.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link key={link.href} href={link.href} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '10px 12px', marginBottom: '2px', borderRadius: '8px',
              textDecoration: 'none', fontSize: '14px',
              fontWeight: isActive ? '600' : '400',
              color: isActive ? '#ffffff' : '#71717a',
              backgroundColor: isActive ? '#27272a' : 'transparent',
            }}>
              <span style={{ fontSize: '16px' }}>{link.icon}</span>
              {link.label}
            </Link>
          )
        })}
      </nav>

      {/* Usuario + Logout */}
      <div style={{ padding: '16px', borderTop: '1px solid #27272a' }}>
        {session && (
          <div style={{ marginBottom: '12px' }}>
            <p style={{ fontSize: '13px', color: '#ffffff', fontWeight: '600', marginBottom: '4px' }}>
              {session.nombre}
            </p>
            <span style={{
              fontSize: '10px', color: '#71717a', textTransform: 'uppercase',
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
            width: '100%', backgroundColor: 'transparent',
            border: '1px solid #27272a', borderRadius: '6px',
            padding: '8px 12px', color: '#71717a', fontSize: '12px',
            cursor: 'pointer', textAlign: 'left',
          }}
        >
          Cerrar sesión →
        </button>
      </div>
    </aside>
  )
}
