'use client'
import { useEffect, useState } from 'react'
import { toast }    from 'sonner'
import { Button }   from '@/components/ui/button'
import { Badge }    from '@/components/ui/badge'
import { Input }    from '@/components/ui/input'
import { Label }    from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, ShieldCheck, ShieldOff, KeyRound } from 'lucide-react'

interface Usuario {
  id_usuario: string
  nombre:     string
  rol:        'administrador' | 'bodeguero'
  estado:     'activo' | 'inactivo'
}

const formVacio = { nombre: '', email: '', contrasena: '', rol: 'bodeguero' }

export default function UsuariosPage() {
  const [usuarios, setUsuarios]       = useState<Usuario[]>([])
  const [loading, setLoading]         = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [guardando, setGuardando]     = useState(false)
  const [form, setForm]               = useState(formVacio)

  const cargar = () => {
    setLoading(true)
    // Traemos todos los usuarios (activos e inactivos)
    fetch('/api/usuarios')
      .then(r => r.json())
      .then(d => { setUsuarios(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => { setUsuarios([]); setLoading(false) })
  }

  useEffect(() => { cargar() }, [])

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.contrasena || form.contrasena.length < 4) {
      toast.error('La contraseña debe tener al menos 4 caracteres')
      return
    }
    setGuardando(true)
    const res  = await fetch('/api/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) {
      toast.error(data.error ?? 'Error al crear el usuario')
    } else {
      toast.success(`Usuario "${form.nombre}" creado correctamente`)
      setForm(formVacio)
      setMostrarForm(false)
      cargar()
    }
    setGuardando(false)
  }

  const toggleEstado = async (u: Usuario) => {
    const nuevoEstado = u.estado === 'activo' ? 'inactivo' : 'activo'
    const res  = await fetch(`/api/usuarios/${u.id_usuario}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: nuevoEstado }),
    })
    const data = await res.json()
    if (!res.ok) toast.error(data.error ?? 'Error')
    else {
      toast.success(nuevoEstado === 'activo' ? `"${u.nombre}" activado` : `"${u.nombre}" desactivado`)
      cargar()
    }
  }

  const cambiarRol = async (u: Usuario) => {
    const nuevoRol = u.rol === 'administrador' ? 'bodeguero' : 'administrador'
    const res  = await fetch(`/api/usuarios/${u.id_usuario}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rol: nuevoRol }),
    })
    const data = await res.json()
    if (!res.ok) toast.error(data.error ?? 'Error')
    else {
      toast.success(`Rol de "${u.nombre}" cambiado a ${nuevoRol}`)
      cargar()
    }
  }

  const activos    = usuarios.filter(u => u.estado === 'activo').length
  const admins     = usuarios.filter(u => u.rol === 'administrador').length
  const bodegueros = usuarios.filter(u => u.rol === 'bodeguero').length

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff' }}>Usuarios</h2>
          <p style={{ fontSize: '12px', color: '#52525b', marginTop: '4px' }}>
            Gestión de accesos — solo el administrador puede crear y modificar usuarios
          </p>
        </div>
        <Button size="sm" onClick={() => setMostrarForm(!mostrarForm)}>
          <Plus style={{ width: '14px', height: '14px' }} />
          {mostrarForm ? 'Cancelar' : 'Nuevo Usuario'}
        </Button>
      </div>

      {/* ── Métricas ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'Total usuarios',  value: usuarios.length, color: '#ffffff' },
          { label: 'Activos',         value: activos,          color: '#22c55e' },
          { label: 'Administradores', value: admins,           color: '#a1a1aa' },
          { label: 'Bodegueros',      value: bodegueros,       color: '#a1a1aa' },
        ].map(m => (
          <div key={m.label} style={{ backgroundColor: '#111113', border: '1px solid #27272a', borderRadius: '12px', padding: '16px 18px' }}>
            <p style={{ fontSize: '10px', color: '#52525b', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>{m.label}</p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: m.color, fontFamily: 'var(--font-mono)' }}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* ── Formulario ── */}
      {mostrarForm && (
        <div style={{ backgroundColor: '#111113', border: '1px solid #27272a', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
          <p style={{ fontSize: '12px', fontWeight: '600', color: '#ffffff', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Registrar Nuevo Usuario
          </p>
          <form onSubmit={handleCrear}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <Label>Nombre completo *</Label>
                <Input required value={form.nombre}
                  onChange={e => setForm({ ...form, nombre: e.target.value })}
                  placeholder="ej: Juan Pérez" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <Label>Email *</Label>
                <Input required type="email" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="correo@ejemplo.com" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <Label>Contraseña *</Label>
                <Input required type="password" value={form.contrasena}
                  onChange={e => setForm({ ...form, contrasena: e.target.value })}
                  placeholder="Mínimo 4 caracteres" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <Label>Rol *</Label>
                <select value={form.rol}
                  onChange={e => setForm({ ...form, rol: e.target.value })}
                  style={selectStyle}>
                  <option value="bodeguero">Bodeguero</option>
                  <option value="administrador">Administrador</option>
                </select>
              </div>
            </div>

            {/* Aviso de permisos */}
            <div style={{ backgroundColor: '#0d0d0f', border: '1px solid #1c1c1f', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px' }}>
              <p style={{ fontSize: '11px', color: '#52525b', lineHeight: '1.6' }}>
                <span style={{ color: '#a1a1aa', fontWeight: '600' }}>Administrador</span> — acceso total: colecciones, prendas, inventario, solicitudes, salidas, aliados, reportes y usuarios.
                <br />
                <span style={{ color: '#a1a1aa', fontWeight: '600' }}>Bodeguero</span> — acceso restringido: inventario, salidas, aliados y reportes.
              </p>
            </div>

            <Button type="submit" disabled={guardando} size="sm">
              <KeyRound style={{ width: '13px', height: '13px' }} />
              {guardando ? 'Creando…' : 'Crear Usuario'}
            </Button>
          </form>
        </div>
      )}

      {/* ── Lista ── */}
      <div style={{ backgroundColor: '#111113', border: '1px solid #27272a', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 22px', borderBottom: '1px solid #27272a' }}>
          <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>
            Todos los usuarios{' '}
            <span style={{ color: '#52525b', fontWeight: '400' }}>({usuarios.length})</span>
          </h3>
        </div>

        {loading ? (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} style={{ height: '50px', borderRadius: '6px' }} />)}
          </div>
        ) : usuarios.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#3f3f46', fontSize: '13px' }}>
            No hay usuarios registrados
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1c1c1f' }}>
                {['Usuario', 'Rol', 'Estado', 'Acciones'].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id_usuario}
                  style={{ borderBottom: '1px solid #1c1c1f', opacity: u.estado === 'inactivo' ? 0.45 : 1 }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#18181b')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={{ padding: '14px 22px' }}>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>{u.nombre}</p>
                  </td>
                  <td style={{ padding: '14px 22px' }}>
                    <Badge variant={u.rol === 'administrador' ? 'secondary' : 'outline'}>
                      {u.rol}
                    </Badge>
                  </td>
                  <td style={{ padding: '14px 22px' }}>
                    <Badge variant={u.estado === 'activo' ? 'success' : 'secondary'}>
                      {u.estado}
                    </Badge>
                  </td>
                  <td style={{ padding: '14px 22px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {/* Cambiar rol */}
                      <Button variant="outline" size="sm" onClick={() => cambiarRol(u)}
                        title={`Cambiar a ${u.rol === 'administrador' ? 'bodeguero' : 'administrador'}`}>
                        {u.rol === 'administrador'
                          ? <><ShieldOff style={{ width: '12px', height: '12px' }} /> A bodeguero</>
                          : <><ShieldCheck style={{ width: '12px', height: '12px' }} /> A admin</>
                        }
                      </Button>
                      {/* Activar / desactivar */}
                      <Button
                        variant={u.estado === 'activo' ? 'destructive' : 'outline'}
                        size="sm"
                        onClick={() => toggleEstado(u)}
                      >
                        {u.estado === 'activo' ? 'Desactivar' : 'Activar'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

const thStyle: React.CSSProperties = {
  padding: '10px 22px', textAlign: 'left',
  fontSize: '10px', color: '#3f3f46', fontWeight: '500',
  textTransform: 'uppercase', letterSpacing: '1.5px',
}

const selectStyle: React.CSSProperties = {
  width: '100%', height: '36px',
  backgroundColor: '#18181b', border: '1px solid #27272a',
  borderRadius: '6px', padding: '0 12px',
  fontSize: '13px', color: '#e4e4e7', outline: 'none',
}
