'use client'
import { useEffect, useState } from 'react'

// ── Tipos ──────────────────────────────────────────────
interface Solicitud {
  id_solicitud: string
  fecha_solicitud: string
  estado: 'pendiente' | 'recibido_parcial' | 'recibido_completo'
  proveedor: { nombre: string }
  coleccion: { nombre: string }
  usuario:   { nombre: string }
}

interface Detalle {
  id_detalle: string
  id_solicitud: string
  cantidad_solicitada: number
  cantidad_recibida: number
  estado_verificacion: 'pendiente' | 'recibido_parcial' | 'recibido_completo'
  sku: {
    codigo_sku: string
    talla: string
    stock: number
    prenda: { nombre: string; categoria: string }
  }
}

interface Opcion { id: string; nombre: string; extra?: string }

// ── Badge de estado ────────────────────────────────────
function EstadoBadge({ estado }: { estado: string }) {
  const config = {
    pendiente:          { bg: '#1c1003', color: '#f59e0b', border: '#78350f', label: 'PENDIENTE' },
    recibido_parcial:   { bg: '#1c1003', color: '#fb923c', border: '#7c2d12', label: 'PARCIAL'   },
    recibido_completo:  { bg: '#052e16', color: '#22c55e', border: '#166534', label: 'COMPLETO'  },
  }[estado] ?? { bg: '#18181b', color: '#71717a', border: '#27272a', label: estado.toUpperCase() }

  return (
    <span style={{
      fontSize: '11px', padding: '3px 10px', borderRadius: '999px', fontWeight: '600',
      backgroundColor: config.bg, color: config.color, border: `1px solid ${config.border}`,
    }}>
      {config.label}
    </span>
  )
}

// ── Página principal ───────────────────────────────────
export default function SolicitudesPage() {
  const [solicitudes, setSolicitudes]     = useState<Solicitud[]>([])
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState('')
  const [exito, setExito]                 = useState('')

  // Datos para los selects
  const [proveedores, setProveedores]     = useState<Opcion[]>([])
  const [colecciones, setColecciones]     = useState<Opcion[]>([])
  const [usuarios, setUsuarios]           = useState<Opcion[]>([])
  const [skusDisponibles, setSkusDisponibles] = useState<any[]>([])

  // Paneles
  const [mostrarForm, setMostrarForm]     = useState(false)
  const [expandida, setExpandida]         = useState<string | null>(null)
  const [detalles, setDetalles]           = useState<Record<string, Detalle[]>>({})
  const [mostrarFormDetalle, setMostrarFormDetalle] = useState<string | null>(null)

  // Formulario nueva solicitud
  const [form, setForm] = useState({ id_proveedor: '', id_coleccion: '', id_usuario: '' })
  const [guardando, setGuardando] = useState(false)

  // Formulario nuevo detalle
  const [formDetalle, setFormDetalle] = useState({ id_sku: '', cantidad_solicitada: '' })

  // Edición cantidad recibida
  const [editandoCantidad, setEditandoCantidad]   = useState<string | null>(null)
  const [cantidadRecibida, setCantidadRecibida]   = useState('')

  // Modales de creación rápida
  const [mostrarFormProveedor, setMostrarFormProveedor] = useState(false)
  const [mostrarFormUsuario, setMostrarFormUsuario]     = useState(false)
  const [formProveedor, setFormProveedor] = useState({ nombre: '', contacto: '', telefono: '', email: '', pais: '' })
  const [formUsuario, setFormUsuario]     = useState({ nombre: '', email: '', rol: 'bodeguero' })

  // ── Cargar datos ───────────────────────────────────
  const cargarSolicitudes = () => {
    setLoading(true)
    fetch('/api/solicitudes')
      .then(r => r.json())
      .then(d => {
        setSolicitudes(Array.isArray(d) ? d : [])
        setLoading(false)
      })
      .catch(() => { setSolicitudes([]); setLoading(false) })
  }

  const cargarSelects = () => {
    fetch('/api/proveedores').then(r => r.json()).then(d => setProveedores(d.map((p: any) => ({ id: p.id_proveedor, nombre: p.nombre }))))
    fetch('/api/colecciones').then(r => r.json()).then(d => setColecciones(d.map((c: any) => ({ id: c.id_coleccion, nombre: c.nombre, extra: c.estado }))))
    fetch('/api/usuarios').then(r => r.json()).then(d => setUsuarios(d.map((u: any) => ({ id: u.id_usuario, nombre: `${u.nombre} (${u.rol})` }))))
    fetch('/api/sku').then(r => r.json()).then(setSkusDisponibles)
  }

  useEffect(() => { cargarSolicitudes(); cargarSelects() }, [])

  // ── Cargar detalles de una solicitud ──────────────
  const cargarDetalles = (id: string) => {
    fetch(`/api/solicitudes/${id}`)
      .then(r => r.json())
      .then(d => setDetalles(prev => ({ ...prev, [id]: Array.isArray(d) ? d : [] })))
      .catch(() => setDetalles(prev => ({ ...prev, [id]: [] })))
  }

  const toggleSolicitud = (id: string) => {
    if (expandida === id) { setExpandida(null) }
    else { setExpandida(id); if (!detalles[id]) cargarDetalles(id) }
  }

  // ── Crear solicitud ────────────────────────────────
  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault()
    setGuardando(true); setError('')
    const res = await fetch('/api/solicitudes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error) }
    else {
      setExito('Solicitud creada correctamente')
      setForm({ id_proveedor: '', id_coleccion: '', id_usuario: '' })
      setMostrarForm(false)
      cargarSolicitudes()
      setTimeout(() => setExito(''), 3000)
    }
    setGuardando(false)
  }

  // ── Agregar detalle ────────────────────────────────
  const handleAgregarDetalle = async (e: React.FormEvent, id_solicitud: string) => {
    e.preventDefault(); setError('')
    const res = await fetch('/api/detalles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formDetalle, id_solicitud, cantidad_solicitada: Number(formDetalle.cantidad_solicitada) }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error) }
    else {
      setExito('Ítem agregado a la solicitud')
      setFormDetalle({ id_sku: '', cantidad_solicitada: '' })
      setMostrarFormDetalle(null)
      cargarDetalles(id_solicitud)
      setTimeout(() => setExito(''), 3000)
    }
  }

  // ── Registrar cantidad recibida ────────────────────
  const handleRegistrarRecibido = async (detalle: Detalle) => {
    setError('')
    const res = await fetch(`/api/detalles/${detalle.id_detalle}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cantidad_recibida: Number(cantidadRecibida) }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error) }
    else {
      setExito('Cantidad registrada — stock actualizado automáticamente')
      setEditandoCantidad(null); setCantidadRecibida('')
      cargarDetalles(detalle.id_solicitud)
      cargarSolicitudes()
      setTimeout(() => setExito(''), 4000)
    }
  }

  // ── Crear proveedor rápido ─────────────────────────
  const handleCrearProveedor = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/proveedores', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formProveedor),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error) }
    else {
      setExito('Proveedor creado'); setMostrarFormProveedor(false)
      setFormProveedor({ nombre: '', contacto: '', telefono: '', email: '', pais: '' })
      cargarSelects(); setTimeout(() => setExito(''), 3000)
    }
  }

  // ── Crear usuario rápido ───────────────────────────
  const handleCrearUsuario = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/usuarios', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formUsuario),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error) }
    else {
      setExito('Usuario creado'); setMostrarFormUsuario(false)
      setFormUsuario({ nombre: '', email: '', rol: 'bodeguero' })
      cargarSelects(); setTimeout(() => setExito(''), 3000)
    }
  }

  // ── Render ─────────────────────────────────────────
  return (
    <div>
      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff' }}>Solicitudes a Proveedor</h2>
          <p style={{ fontSize: '14px', color: '#52525b', marginTop: '4px' }}>
            Gestiona los pedidos y registra la llegada de mercancía a bodega
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setMostrarFormProveedor(!mostrarFormProveedor)} style={btnSecundario}>
            + Proveedor
          </button>
          <button onClick={() => setMostrarFormUsuario(!mostrarFormUsuario)} style={btnSecundario}>
            + Usuario
          </button>
          <button onClick={() => setMostrarForm(!mostrarForm)} style={btnPrimario}>
            {mostrarForm ? 'Cancelar' : '+ Nueva Solicitud'}
          </button>
        </div>
      </div>

      {/* Mensajes */}
      {error && <div style={estiloError}>⚠ {error}</div>}
      {exito && <div style={estiloExito}>✓ {exito}</div>}

      {/* Form nuevo proveedor */}
      {mostrarFormProveedor && (
        <div style={cardStyle}>
          <h3 style={tituloCard}>Nuevo Proveedor</h3>
          <form onSubmit={handleCrearProveedor}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              {[
                { key: 'nombre',   label: 'Nombre *',   req: true,  ph: 'Nombre del proveedor', type: 'text'  },
                { key: 'contacto', label: 'Contacto',   req: false, ph: 'Nombre contacto',      type: 'text'  },
                { key: 'telefono', label: 'Teléfono',   req: false, ph: '3246732745',            type: 'tel'   },
                { key: 'email',    label: 'Email',      req: false, ph: 'correo@proveedor.com',  type: 'email' },
                { key: 'pais',     label: 'País',       req: false, ph: 'Colombia',              type: 'text'  },
              ].map(f => (
                <div key={f.key}>
                  <label style={labelStyle}>{f.label}</label>
                  <input
                    type={f.type}
                    required={f.req}
                    value={(formProveedor as any)[f.key]}
                    placeholder={f.ph}
                    onChange={e => {
                      const val = f.key === 'telefono'
                        ? e.target.value.replace(/[^0-9]/g, '')
                        : e.target.value
                      setFormProveedor({ ...formProveedor, [f.key]: val })
                    }}
                    style={inputStyle}
                  />
                </div>
              ))}
            </div>
            <button type="submit" style={btnPrimario}>Crear Proveedor</button>
          </form>
        </div>
      )}

      {/* Form nuevo usuario */}
      {mostrarFormUsuario && (
        <div style={cardStyle}>
          <h3 style={tituloCard}>Nuevo Usuario</h3>
          <form onSubmit={handleCrearUsuario}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={labelStyle}>Nombre *</label>
                <input required value={formUsuario.nombre} onChange={e => setFormUsuario({ ...formUsuario, nombre: e.target.value })} placeholder="Nombre completo" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Email *</label>
                <input required type="email" value={formUsuario.email} onChange={e => setFormUsuario({ ...formUsuario, email: e.target.value })} placeholder="correo@ejemplo.com" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Rol</label>
                <select value={formUsuario.rol} onChange={e => setFormUsuario({ ...formUsuario, rol: e.target.value })} style={inputStyle}>
                  <option value="bodeguero">Bodeguero</option>
                  <option value="administrador">Administrador</option>
                </select>
              </div>
            </div>
            <button type="submit" style={btnPrimario}>Crear Usuario</button>
          </form>
        </div>
      )}

      {/* Form nueva solicitud */}
      {mostrarForm && (
        <div style={cardStyle}>
          <h3 style={tituloCard}>Nueva Solicitud</h3>
          <form onSubmit={handleCrear}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={labelStyle}>Proveedor *</label>
                <select required value={form.id_proveedor} onChange={e => setForm({ ...form, id_proveedor: e.target.value })} style={inputStyle}>
                  <option value="">Selecciona proveedor</option>
                  {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Colección destino *</label>
                <select required value={form.id_coleccion} onChange={e => setForm({ ...form, id_coleccion: e.target.value })} style={inputStyle}>
                  <option value="">Selecciona colección</option>
                  {colecciones.map(c => <option key={c.id} value={c.id}>{c.nombre} {c.extra === 'activa' ? '★' : ''}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Registrado por *</label>
                <select required value={form.id_usuario} onChange={e => setForm({ ...form, id_usuario: e.target.value })} style={inputStyle}>
                  <option value="">Selecciona usuario</option>
                  {usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" disabled={guardando} style={{ ...btnPrimario, opacity: guardando ? 0.6 : 1 }}>
              {guardando ? 'Creando...' : 'Crear Solicitud'}
            </button>
          </form>
        </div>
      )}

      {/* Lista de solicitudes */}
      <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #27272a' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff' }}>
            Todas las solicitudes
            <span style={{ marginLeft: '10px', fontSize: '13px', color: '#52525b', fontWeight: '400' }}>({solicitudes.length})</span>
          </h3>
        </div>

        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <p style={{ color: '#3f3f46', fontSize: '13px', letterSpacing: '2px' }}>CARGANDO...</p>
          </div>
        ) : solicitudes.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <p style={{ color: '#3f3f46', fontSize: '14px' }}>No hay solicitudes registradas</p>
            <p style={{ color: '#27272a', fontSize: '12px', marginTop: '8px' }}>Primero crea un proveedor y un usuario, luego crea la solicitud</p>
          </div>
        ) : (
          solicitudes.map((sol, i) => (
            <div key={sol.id_solicitud}>
              {/* Fila solicitud */}
              <div
                onClick={() => toggleSolicitud(sol.id_solicitud)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1.5fr 1.5fr 1fr 1fr',
                  alignItems: 'center',
                  padding: '16px 24px',
                  borderBottom: '1px solid #1c1c1f',
                  cursor: 'pointer',
                  backgroundColor: expandida === sol.id_solicitud ? '#1c1c1f' : 'transparent',
                }}
              >
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>
                    {sol.proveedor?.nombre ?? '—'}
                  </p>
                  <p style={{ fontSize: '12px', color: '#52525b', marginTop: '2px' }}>
                    {sol.usuario?.nombre ?? '—'}
                  </p>
                </div>
                <p style={{ fontSize: '13px', color: '#a1a1aa' }}>{sol.coleccion?.nombre ?? '—'}</p>
                <p style={{ fontSize: '12px', color: '#71717a' }}>
                  {new Date(sol.fecha_solicitud).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
                <EstadoBadge estado={sol.estado} />
                <p style={{ fontSize: '20px', color: '#3f3f46', textAlign: 'right' }}>
                  {expandida === sol.id_solicitud ? '▲' : '▼'}
                </p>
              </div>

              {/* Detalles expandidos */}
              {expandida === sol.id_solicitud && (
                <div style={{ backgroundColor: '#111113', borderBottom: '1px solid #27272a', padding: '20px 32px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <p style={{ fontSize: '13px', color: '#71717a', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      Ítems de la solicitud
                    </p>
                    {sol.estado !== 'recibido_completo' && (
                      <button
                        onClick={() => setMostrarFormDetalle(mostrarFormDetalle === sol.id_solicitud ? null : sol.id_solicitud)}
                        style={{ ...btnSecundario, color: '#ffffff', borderColor: '#3f3f46' }}
                      >
                        + Agregar ítem
                      </button>
                    )}
                  </div>

                  {/* Form agregar ítem */}
                  {mostrarFormDetalle === sol.id_solicitud && (
                    <form
                      onSubmit={e => handleAgregarDetalle(e, sol.id_solicitud)}
                      style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', marginBottom: '16px', backgroundColor: '#18181b', padding: '16px', borderRadius: '8px', border: '1px solid #27272a' }}
                    >
                      <div style={{ flex: 2 }}>
                        <label style={labelStyle}>SKU *</label>
                        <select required value={formDetalle.id_sku} onChange={e => setFormDetalle({ ...formDetalle, id_sku: e.target.value })} style={inputStyle}>
                          <option value="">Selecciona SKU</option>
                          {skusDisponibles.map((s: any) => (
                            <option key={s.id_sku} value={s.id_sku}>
                              {s.codigo_sku} — Talla {s.talla}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={labelStyle}>Cantidad solicitada *</label>
                        <input required type="number" min="1" value={formDetalle.cantidad_solicitada}
                          onChange={e => setFormDetalle({ ...formDetalle, cantidad_solicitada: e.target.value })}
                          placeholder="ej: 20" style={inputStyle} />
                      </div>
                      <button type="submit" style={btnPrimario}>Agregar</button>
                    </form>
                  )}

                  {/* Tabla de detalles */}
                  {!detalles[sol.id_solicitud] ? (
                    <p style={{ color: '#3f3f46', fontSize: '13px' }}>Cargando ítems...</p>
                  ) : detalles[sol.id_solicitud].length === 0 ? (
                    <p style={{ color: '#3f3f46', fontSize: '13px' }}>No hay ítems — agrega productos a esta solicitud</p>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #27272a' }}>
                          {['SKU', 'Prenda', 'Talla', 'Solicitado', 'Recibido', 'Estado', 'Acción'].map(h => (
                            <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: '11px', color: '#52525b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {detalles[sol.id_solicitud].map(det => (
                          <tr key={det.id_detalle} style={{ borderBottom: '1px solid #1c1c1f' }}>
                            <td style={{ padding: '12px', fontSize: '12px', color: '#71717a', fontFamily: 'monospace' }}>
                              {det.sku?.codigo_sku}
                            </td>
                            <td style={{ padding: '12px', fontSize: '13px', color: '#ffffff' }}>
                              {det.sku?.prenda?.nombre}
                            </td>
                            <td style={{ padding: '12px', fontSize: '13px', fontWeight: '700', color: '#ffffff' }}>
                              {det.sku?.talla}
                            </td>
                            <td style={{ padding: '12px', fontSize: '14px', color: '#a1a1aa', fontWeight: '600' }}>
                              {det.cantidad_solicitada}
                            </td>
                            <td style={{ padding: '12px', fontSize: '14px', fontWeight: '700', color: det.cantidad_recibida >= det.cantidad_solicitada ? '#22c55e' : det.cantidad_recibida > 0 ? '#f59e0b' : '#71717a' }}>
                              {det.cantidad_recibida}
                            </td>
                            <td style={{ padding: '12px' }}>
                              <EstadoBadge estado={det.estado_verificacion} />
                            </td>
                            <td style={{ padding: '12px' }}>
                              {det.estado_verificacion !== 'recibido_completo' ? (
                                editandoCantidad === det.id_detalle ? (
                                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                    <input
                                      type="number" min="0"
                                      value={cantidadRecibida}
                                      onChange={e => setCantidadRecibida(e.target.value)}
                                      placeholder="Cant."
                                      style={{ ...inputStyle, width: '70px', padding: '6px 8px', fontSize: '13px' }}
                                    />
                                    <button onClick={() => handleRegistrarRecibido(det)} style={{ ...btnPrimario, padding: '6px 12px', fontSize: '12px' }}>
                                      ✓
                                    </button>
                                    <button onClick={() => setEditandoCantidad(null)} style={{ ...btnSecundario, padding: '6px 10px', fontSize: '12px' }}>
                                      ✕
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => { setEditandoCantidad(det.id_detalle); setCantidadRecibida(String(det.cantidad_recibida)) }}
                                    style={{ ...btnSecundario, fontSize: '12px', color: '#f59e0b', borderColor: '#78350f' }}
                                  >
                                    Registrar llegada
                                  </button>
                                )
                              ) : (
                                <span style={{ fontSize: '12px', color: '#3f3f46' }}>Verificado ✓</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ── Estilos ────────────────────────────────────────────
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
const btnSecundario: React.CSSProperties = {
  backgroundColor: 'transparent', border: '1px solid #27272a',
  borderRadius: '6px', padding: '6px 14px', fontSize: '12px', color: '#a1a1aa', cursor: 'pointer',
}
const cardStyle: React.CSSProperties = {
  backgroundColor: '#18181b', border: '1px solid #27272a',
  borderRadius: '12px', padding: '24px', marginBottom: '24px',
}
const tituloCard: React.CSSProperties = {
  fontSize: '15px', fontWeight: '600', marginBottom: '20px', color: '#ffffff',
}
const estiloError: React.CSSProperties = {
  backgroundColor: '#1c0a0a', border: '1px solid #7f1d1d', borderRadius: '8px',
  padding: '14px 18px', marginBottom: '20px', color: '#ef4444', fontSize: '14px',
}
const estiloExito: React.CSSProperties = {
  backgroundColor: '#052e16', border: '1px solid #166534', borderRadius: '8px',
  padding: '14px 18px', marginBottom: '20px', color: '#22c55e', fontSize: '14px',
}