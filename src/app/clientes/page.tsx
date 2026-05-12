'use client'
import { useEffect, useState } from 'react'

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
  const [error, setError]             = useState('')
  const [exito, setExito]             = useState('')
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
    setEditando(null)
    setForm(formVacio)
    setMostrarForm(true)
  }

  const abrirEdicion = (c: Cliente) => {
    setEditando(c)
    setForm({
      nombre:       c.nombre,
      ciudad:       c.ciudad,
      departamento: c.departamento ?? '',
      telefono:     c.telefono    ?? '',
      email:        c.email       ?? '',
    })
    setMostrarForm(true)
  }

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault()
    setGuardando(true); setError('')

    const url    = editando ? `/api/clientes/${editando.id_cliente}` : '/api/clientes'
    const method = editando ? 'PATCH' : 'POST'
    const body   = editando
      ? { ...form, estado: editando.estado }
      : form

    const res  = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const data = await res.json()

    if (!res.ok) { setError(data.error) }
    else {
      setExito(editando ? 'Aliado actualizado correctamente' : 'Aliado registrado correctamente')
      setMostrarForm(false)
      setEditando(null)
      setForm(formVacio)
      cargar()
      setTimeout(() => setExito(''), 4000)
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
    cargar()
  }

  const clientesFiltrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.ciudad.toLowerCase().includes(busqueda.toLowerCase()) ||
    (c.departamento ?? '').toLowerCase().includes(busqueda.toLowerCase())
  )

  const activos   = clientes.filter(c => c.estado === 'activo').length
  const inactivos = clientes.filter(c => c.estado === 'inactivo').length

  return (
    <div>
      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff' }}>Aliados Multimarca</h2>
          <p style={{ fontSize: '14px', color: '#52525b', marginTop: '4px' }}>
            Tiendas aliadas donde se distribuyen las prendas — trazabilidad de despachos
          </p>
        </div>
        <button onClick={abrirNuevo} style={btnPrimario}>+ Nuevo Aliado</button>
      </div>

      {/* Métricas */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total aliados',  value: clientes.length, color: '#ffffff' },
          { label: 'Activos',        value: activos,          color: '#22c55e' },
          { label: 'Inactivos',      value: inactivos,        color: '#71717a' },
        ].map(m => (
          <div key={m.label} style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '20px 28px', flex: 1 }}>
            <p style={{ fontSize: '11px', color: '#52525b', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>{m.label}</p>
            <p style={{ fontSize: '28px', fontWeight: '700', color: m.color }}>{m.value}</p>
          </div>
        ))}
      </div>

      {error && <div style={estiloError}>⚠ {error}</div>}
      {exito && <div style={estiloExito}>✓ {exito}</div>}

      {/* Formulario */}
      {mostrarForm && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff' }}>
              {editando ? 'Editar Aliado' : 'Registrar Nuevo Aliado'}
            </h3>
            <button onClick={() => setMostrarForm(false)}
              style={{ background: 'none', border: 'none', color: '#52525b', cursor: 'pointer', fontSize: '18px' }}>
              ✕
            </button>
          </div>
          <form onSubmit={handleGuardar}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={labelStyle}>Nombre del aliado *</label>
                <input required value={form.nombre}
                  onChange={e => setForm({ ...form, nombre: e.target.value })}
                  placeholder="ej: Tienda Urban District"
                  style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Ciudad *</label>
                <input required value={form.ciudad}
                  onChange={e => setForm({ ...form, ciudad: e.target.value })}
                  placeholder="ej: Medellín"
                  style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Departamento</label>
                <input value={form.departamento}
                  onChange={e => setForm({ ...form, departamento: e.target.value })}
                  placeholder="ej: Antioquia"
                  style={inputStyle} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={labelStyle}>Teléfono</label>
                <input value={form.telefono}
                  onChange={e => setForm({ ...form, telefono: e.target.value })}
                  placeholder="ej: 3001234567"
                  style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input type="email" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="contacto@tienda.com"
                  style={inputStyle} />
              </div>
            </div>
            <button type="submit" disabled={guardando}
              style={{ ...btnPrimario, opacity: guardando ? 0.6 : 1 }}>
              {guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Registrar Aliado'}
            </button>
          </form>
        </div>
      )}

      {/* Buscador */}
      <div style={{ marginBottom: '16px' }}>
        <input
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, ciudad o departamento..."
          style={{ ...inputStyle, maxWidth: '400px' }}
        />
      </div>

      {/* Lista de aliados */}
      <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 110px 180px', padding: '12px 24px', borderBottom: '1px solid #27272a' }}>
          {['Aliado', 'Ciudad', 'Contacto', 'Estado', 'Acciones'].map(h => (
            <p key={h} style={{ fontSize: '11px', color: '#52525b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', textAlign: h === 'Estado' ? 'center' : 'left' }}>{h}</p>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <p style={{ color: '#3f3f46', fontSize: '13px', letterSpacing: '2px' }}>CARGANDO...</p>
          </div>
        ) : clientesFiltrados.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <p style={{ color: '#3f3f46', fontSize: '14px' }}>
              {busqueda ? 'No se encontraron aliados con ese filtro' : 'No hay aliados registrados'}
            </p>
          </div>
        ) : (
          clientesFiltrados.map((c) => (
            <div key={c.id_cliente} style={{
              display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 110px 180px',
              alignItems: 'center', padding: '16px 24px',
              borderBottom: '1px solid #1c1c1f',
              opacity: c.estado === 'inactivo' ? 0.5 : 1,
            }}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>{c.nombre}</p>
                {c.email && <p style={{ fontSize: '12px', color: '#52525b', marginTop: '2px' }}>{c.email}</p>}
              </div>
              <div>
                <p style={{ fontSize: '13px', color: '#ffffff' }}>{c.ciudad}</p>
                {c.departamento && <p style={{ fontSize: '12px', color: '#52525b', marginTop: '2px' }}>{c.departamento}</p>}
              </div>
              <p style={{ fontSize: '13px', color: '#a1a1aa' }}>{c.telefono ?? '—'}</p>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  fontSize: '11px', fontWeight: '600', padding: '4px 10px',
                  borderRadius: '999px',
                  backgroundColor: c.estado === 'activo' ? '#052e16' : '#1c1c1f',
                  color: c.estado === 'activo' ? '#22c55e' : '#52525b',
                  border: `1px solid ${c.estado === 'activo' ? '#166534' : '#27272a'}`,
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: c.estado === 'activo' ? '#22c55e' : '#52525b', flexShrink: 0 }} />
                  {c.estado}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => abrirEdicion(c)}
                  style={{ background: 'none', border: '1px solid #27272a', borderRadius: '6px', padding: '6px 12px', color: '#a1a1aa', fontSize: '12px', cursor: 'pointer' }}>
                  Editar
                </button>
                <button onClick={() => toggleEstado(c)}
                  style={{ background: 'none', border: '1px solid #27272a', borderRadius: '6px', padding: '6px 12px', color: c.estado === 'activo' ? '#ef4444' : '#22c55e', fontSize: '12px', cursor: 'pointer' }}>
                  {c.estado === 'activo' ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ── Estilos ──────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%', backgroundColor: '#09090b', border: '1px solid #27272a',
  borderRadius: '8px', padding: '10px 14px', fontSize: '14px', color: '#ffffff', outline: 'none',
}
const labelStyle: React.CSSProperties = {
  fontSize: '12px', color: '#71717a', textTransform: 'uppercase',
  letterSpacing: '1px', display: 'block', marginBottom: '8px',
}
const btnPrimario: React.CSSProperties = {
  backgroundColor: '#ffffff', color: '#09090b', border: 'none',
  borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
}
const cardStyle: React.CSSProperties = {
  backgroundColor: '#18181b', border: '1px solid #27272a',
  borderRadius: '12px', padding: '24px', marginBottom: '24px',
}
const estiloError: React.CSSProperties = {
  backgroundColor: '#1c0a0a', border: '1px solid #7f1d1d', borderRadius: '8px',
  padding: '14px 18px', marginBottom: '20px', color: '#ef4444', fontSize: '14px',
}
const estiloExito: React.CSSProperties = {
  backgroundColor: '#052e16', border: '1px solid #166534', borderRadius: '8px',
  padding: '14px 18px', marginBottom: '20px', color: '#22c55e', fontSize: '14px',
}
