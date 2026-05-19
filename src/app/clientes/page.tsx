'use client'
import { useEffect, useState } from 'react'
import { toast }    from 'sonner'
import { Button }   from '@/components/ui/button'
import { Badge }    from '@/components/ui/badge'
import { Input }    from '@/components/ui/input'
import { Label }    from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Pencil, Search } from 'lucide-react'

interface Cliente {
  id_cliente:   string
  nombre:       string
  ciudad:       string
  departamento: string | null
  telefono:     string | null
  email:        string | null
  estado:       'activo' | 'inactivo'
}

const formVacio = { nombre: '', ciudad: '', departamento: '', telefono: '', email: '' }

export default function ClientesPage() {
  const [clientes, setClientes]       = useState<Cliente[]>([])
  const [loading, setLoading]         = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [guardando, setGuardando]     = useState(false)
  const [editando, setEditando]       = useState<Cliente | null>(null)
  const [form, setForm]               = useState(formVacio)
  const [busqueda, setBusqueda]       = useState('')

  const cargar = () => {
    setLoading(true)
    fetch('/api/clientes')
      .then(r => r.json())
      .then(d => { setClientes(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => { setClientes([]); setLoading(false) })
  }

  useEffect(() => { cargar() }, [])

  const abrirNuevo = () => {
    if (mostrarForm && !editando) { setMostrarForm(false); return }
    setEditando(null); setForm(formVacio); setMostrarForm(true)
  }

  const abrirEdicion = (c: Cliente) => {
    setEditando(c)
    setForm({ nombre: c.nombre, ciudad: c.ciudad, departamento: c.departamento ?? '', telefono: c.telefono ?? '', email: c.email ?? '' })
    setMostrarForm(true)
  }

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault(); setGuardando(true)
    const url    = editando ? `/api/clientes/${editando.id_cliente}` : '/api/clientes'
    const method = editando ? 'PATCH' : 'POST'
    const body   = editando ? { ...form, estado: editando.estado } : form
    const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const data   = await res.json()
    if (!res.ok) {
      toast.error(data.error ?? 'Error al guardar')
    } else {
      toast.success(editando ? 'Aliado actualizado' : 'Aliado registrado')
      setMostrarForm(false); setEditando(null); setForm(formVacio); cargar()
    }
    setGuardando(false)
  }

  const toggleEstado = async (c: Cliente) => {
    const nuevoEstado = c.estado === 'activo' ? 'inactivo' : 'activo'
    await fetch(`/api/clientes/${c.id_cliente}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...c, estado: nuevoEstado }),
    })
    toast.success(nuevoEstado === 'activo' ? `"${c.nombre}" activado` : `"${c.nombre}" desactivado`)
    cargar()
  }

  const filtrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.ciudad.toLowerCase().includes(busqueda.toLowerCase()) ||
    (c.departamento ?? '').toLowerCase().includes(busqueda.toLowerCase())
  )

  const activos   = clientes.filter(c => c.estado === 'activo').length
  const inactivos = clientes.filter(c => c.estado === 'inactivo').length

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff' }}>Aliados Multimarca</h2>
          <p style={{ fontSize: '12px', color: '#52525b', marginTop: '4px' }}>
            Tiendas aliadas — trazabilidad de despachos
          </p>
        </div>
        <Button size="sm" onClick={abrirNuevo} variant={mostrarForm && !editando ? 'secondary' : 'default'}>
          <Plus style={{ width: '14px', height: '14px' }} />
          {mostrarForm && !editando ? 'Cancelar' : 'Nuevo Aliado'}
        </Button>
      </div>

      {/* ── Métricas ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'Total aliados', value: clientes.length, color: '#ffffff' },
          { label: 'Activos',       value: activos,         color: '#22c55e' },
          { label: 'Inactivos',     value: inactivos,       color: '#3f3f46' },
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <p style={{ fontSize: '12px', fontWeight: '600', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {editando ? 'Editar Aliado' : 'Registrar Nuevo Aliado'}
            </p>
            <button onClick={() => setMostrarForm(false)}
              style={{ background: 'none', border: 'none', color: '#3f3f46', cursor: 'pointer', fontSize: '16px', lineHeight: 1 }}>
              ✕
            </button>
          </div>
          <form onSubmit={handleGuardar}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <Label>Nombre del aliado *</Label>
                <Input required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="ej: Tienda Urban District" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <Label>Ciudad *</Label>
                <Input required value={form.ciudad} onChange={e => setForm({ ...form, ciudad: e.target.value })} placeholder="ej: Medellín" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <Label>Departamento</Label>
                <Input value={form.departamento} onChange={e => setForm({ ...form, departamento: e.target.value })} placeholder="ej: Antioquia" />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <Label>Teléfono</Label>
                <Input value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} placeholder="ej: 3001234567" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="contacto@tienda.com" />
              </div>
            </div>
            <Button type="submit" disabled={guardando} size="sm">
              {guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Registrar Aliado'}
            </Button>
          </form>
        </div>
      )}

      {/* ── Buscador ── */}
      <div style={{ position: 'relative', marginBottom: '16px', maxWidth: '360px' }}>
        <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: '#3f3f46' }} />
        <Input value={busqueda} onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, ciudad…" style={{ paddingLeft: '32px' }} />
      </div>

      {/* ── Lista ── */}
      <div style={{ backgroundColor: '#111113', border: '1px solid #27272a', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1c1c1f' }}>
              {['Aliado', 'Ciudad', 'Teléfono', 'Estado', 'Acciones'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && Array.from({ length: 4 }).map((_, i) => (
              <tr key={i}>
                <td colSpan={5} style={{ padding: '10px 22px' }}>
                  <Skeleton style={{ height: '14px', borderRadius: '4px' }} />
                </td>
              </tr>
            ))}
            {!loading && filtrados.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: '#3f3f46', fontSize: '13px' }}>
                  {busqueda ? 'Sin resultados para ese filtro' : 'No hay aliados registrados'}
                </td>
              </tr>
            )}
            {!loading && filtrados.map(c => (
              <tr key={c.id_cliente}
                style={{ borderBottom: '1px solid #1c1c1f', opacity: c.estado === 'inactivo' ? 0.5 : 1 }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#18181b')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <td style={{ padding: '14px 22px' }}>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>{c.nombre}</p>
                  {c.email && <p style={{ fontSize: '11px', color: '#52525b', marginTop: '2px' }}>{c.email}</p>}
                </td>
                <td style={{ padding: '14px 22px' }}>
                  <p style={{ fontSize: '13px', color: '#e4e4e7' }}>{c.ciudad}</p>
                  {c.departamento && <p style={{ fontSize: '11px', color: '#52525b', marginTop: '2px' }}>{c.departamento}</p>}
                </td>
                <td style={{ padding: '14px 22px', fontSize: '13px', color: '#71717a', fontFamily: 'var(--font-mono)' }}>
                  {c.telefono ?? '—'}
                </td>
                <td style={{ padding: '14px 22px' }}>
                  <Badge variant={c.estado === 'activo' ? 'success' : 'secondary'}>
                    {c.estado}
                  </Badge>
                </td>
                <td style={{ padding: '14px 22px' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <Button variant="outline" size="icon-sm" onClick={() => abrirEdicion(c)} title="Editar">
                      <Pencil style={{ width: '12px', height: '12px' }} />
                    </Button>
                    <Button
                      variant={c.estado === 'activo' ? 'destructive' : 'outline'}
                      size="sm"
                      onClick={() => toggleEstado(c)}
                    >
                      {c.estado === 'activo' ? 'Desactivar' : 'Activar'}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const thStyle: React.CSSProperties = {
  padding: '10px 22px', textAlign: 'left',
  fontSize: '10px', color: '#3f3f46', fontWeight: '500',
  textTransform: 'uppercase', letterSpacing: '1.5px', whiteSpace: 'nowrap',
}
