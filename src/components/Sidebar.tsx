'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Squares2X2Icon,
  RectangleStackIcon,
  SwatchIcon,
  ArchiveBoxIcon,
  ClipboardDocumentListIcon,
  ArrowUpTrayIcon,
  UsersIcon,
  PresentationChartBarIcon,
  UserGroupIcon,
} from '@heroicons/react/24/solid'
import { MagnifyingGlassIcon, ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/outline'

interface Session {
  id:     string
  nombre: string
  rol:    'administrador' | 'bodeguero'
}

const groups = [
  {
    label: 'General',
    items: [
      { href: '/',        label: 'Dashboard',  Icon: Squares2X2Icon,           roles: ['administrador', 'bodeguero'] },
    ],
  },
  {
    label: 'Catálogo',
    items: [
      { href: '/colecciones', label: 'Colecciones', Icon: RectangleStackIcon,        roles: ['administrador'] },
      { href: '/prendas',     label: 'Prendas',     Icon: SwatchIcon,                roles: ['administrador'] },
    ],
  },
  {
    label: 'Bodega',
    items: [
      { href: '/inventario',  label: 'Inventario',  Icon: ArchiveBoxIcon,            roles: ['administrador', 'bodeguero'] },
      { href: '/solicitudes', label: 'Solicitudes', Icon: ClipboardDocumentListIcon, roles: ['administrador'] },
      { href: '/salidas',     label: 'Salidas',     Icon: ArrowUpTrayIcon,           roles: ['administrador', 'bodeguero'] },
    ],
  },
  {
    label: 'Comercial',
    items: [
      { href: '/clientes', label: 'Aliados',   Icon: UsersIcon,                roles: ['administrador', 'bodeguero'] },
      { href: '/reportes', label: 'Reportes',  Icon: PresentationChartBarIcon, roles: ['administrador', 'bodeguero'] },
    ],
  },
  {
    label: 'Administración',
    items: [
      { href: '/usuarios', label: 'Usuarios',  Icon: UserGroupIcon,            roles: ['administrador'] },
    ],
  },
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
  const [session, setSession] = useState<Session | null>(null)
  const [search,  setSearch]  = useState('')

  useEffect(() => { setSession(parseSession()) }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  const filteredGroups = groups.map(g => ({
    ...g,
    items: g.items.filter(item => {
      const roleOk  = !session || item.roles.includes(session.rol)
      const searchOk = search === '' || item.label.toLowerCase().includes(search.toLowerCase())
      return roleOk && searchOk
    }),
  })).filter(g => g.items.length > 0)

  return (
    <aside style={{
      width: '240px', height: '100vh', backgroundColor: '#111113',
      borderRight: '1px solid #27272a', display: 'flex', flexDirection: 'column',
      position: 'fixed', top: 0, left: 0, zIndex: 100, overflow: 'hidden',
    }}>

      {/* Marca */}
      <Link href="/" style={{ textDecoration: 'none', display: 'block', padding: '24px 20px 20px', borderBottom: '1px solid #27272a', cursor: 'pointer' }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#18181b')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        <p style={{ fontSize: '9px', color: '#3f3f46', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '4px' }}>
          Sistema de
        </p>
        <h1 style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff', letterSpacing: '2px', lineHeight: 1 }}>
          INVENTARIO
        </h1>
        <p style={{ fontSize: '9px', color: '#3f3f46', letterSpacing: '3px', textTransform: 'uppercase', marginTop: '4px' }}>
          Streetwear
        </p>
      </Link>

      {/* Búsqueda */}
      <div style={{ padding: '12px 14px', borderBottom: '1px solid #1c1c1f' }}>
        <div style={{ position: 'relative' }}>
          <MagnifyingGlassIcon style={{
            position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)',
            width: '13px', height: '13px', color: '#3f3f46', pointerEvents: 'none',
          }} />
          <input
            type="text"
            placeholder="Buscar sección..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', backgroundColor: '#18181b',
              border: '1px solid #27272a', borderRadius: '6px',
              padding: '6px 10px 6px 28px',
              color: '#e4e4e7', fontSize: '12px', outline: 'none',
            }}
            onFocus={e => (e.target.style.borderColor = '#3f3f46')}
            onBlur={e  => (e.target.style.borderColor = '#27272a')}
          />
        </div>
      </div>

      {/* Navegación agrupada */}
      <nav style={{ flex: 1, padding: '8px 10px', overflowY: 'auto' }}>
        {filteredGroups.length === 0 && (
          <p style={{ fontSize: '11px', color: '#3f3f46', textAlign: 'center', marginTop: '24px' }}>
            Sin resultados
          </p>
        )}
        {filteredGroups.map(group => (
          <div key={group.label} style={{ marginBottom: '4px' }}>
            {/* Etiqueta de grupo */}
            <p style={{
              fontSize: '9px', fontWeight: '600', letterSpacing: '2px',
              textTransform: 'uppercase', color: '#3f3f46',
              padding: '10px 10px 4px',
            }}>
              {group.label}
            </p>
            {/* Items del grupo */}
            {group.items.map(({ href, label, Icon }) => {
              const isActive = pathname === href
              return (
                <Link key={href} href={href} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '8px 10px', marginBottom: '1px', borderRadius: '7px',
                  textDecoration: 'none', fontSize: '13px',
                  fontWeight: isActive ? '600' : '400',
                  color: isActive ? '#ffffff' : '#71717a',
                  backgroundColor: isActive ? '#27272a' : 'transparent',
                  borderLeft: isActive ? '2px solid #ffffff' : '2px solid transparent',
                  transition: 'all 0.12s ease',
                }}>
                  <Icon style={{
                    width: '16px', height: '16px', flexShrink: 0,
                    color: isActive ? '#ffffff' : '#52525b',
                  }} />
                  {label}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Usuario + Logout */}
      <div style={{ padding: '12px 14px', borderTop: '1px solid #27272a' }}>
        {session && (
          <div style={{
            backgroundColor: '#18181b', borderRadius: '8px',
            padding: '10px 12px', marginBottom: '8px',
          }}>
            <p style={{ fontSize: '13px', color: '#ffffff', fontWeight: '600', marginBottom: '4px' }}>
              {session.nombre}
            </p>
            <span style={{
              fontSize: '9px', color: '#71717a', textTransform: 'uppercase',
              letterSpacing: '1.5px', backgroundColor: '#27272a',
              padding: '2px 7px', borderRadius: '4px',
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
            padding: '8px 12px', color: '#52525b', fontSize: '12px',
            fontWeight: '500', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            transition: 'all 0.12s ease',
          }}
          onMouseEnter={e => {
            const b = e.currentTarget
            b.style.color = '#e4e4e7'
            b.style.borderColor = '#3f3f46'
            b.style.backgroundColor = '#18181b'
          }}
          onMouseLeave={e => {
            const b = e.currentTarget
            b.style.color = '#52525b'
            b.style.borderColor = '#27272a'
            b.style.backgroundColor = 'transparent'
          }}
        >
          <ArrowRightStartOnRectangleIcon style={{ width: '14px', height: '14px' }} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
