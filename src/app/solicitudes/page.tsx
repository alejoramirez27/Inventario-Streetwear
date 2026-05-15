'use client'
import { useEffect, useState } from 'react'
import { toast }    from 'sonner'
import { Button }   from '@/components/ui/button'
import { Badge }    from '@/components/ui/badge'
import { Input }    from '@/components/ui/input'
import { Label }    from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, ChevronDown, ChevronRight } from 'lucide-react'

interface Solicitud {
  id_solicitud:    string
  fecha_solicitud: string
  estado:          'pendiente' | 'recibido_parcial' | 'recibido_completo'
  proveedor:       { nombre: string }
  coleccion:       { nombre: string }
  usuario:         { nombre: string }
}
interface Detalle {
  id_detalle:          string
  id_solicitud:        string
  cantidad_solicitada: number
  cantidad_recibida:   number
  estado_verificacion: 'pendiente' | 'recibido_parcial' | 'recibido_completo'
  sku: {
    codigo_sku: string; talla: string; stock: number
    prenda: { nombre: string; categoria: string }
  }
}
interface Opcion { id: string; nombre: string; extra?: string }

const subcategorias = {
  ROPA:       ['Camiseta Oversize', 'Camiseta Slim Fit', 'Hoodie', 'Chaqueta', 'Sudadera', 'Jean', 'Short'],
  ACCESORIOS: ['Gorra', 'Underwear'],
}
const tallas = {
  ROPA:       ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  ACCESORIOS: ['Única', 'S/M', 'M/L', 'L/XL'],
}

function estadoVariant(e: string) {
  if (e === 'recibido_completo') return 'success'  as const
  if (e === 'recibido_parcial')  return 'warning'  as const
  return 'outline' as const
}
function estadoLabel(e: string) {
  if (e === 'recibido_completo') return 'Completo'
  if (e === 'recibido_parcial')  return 'Parcial'
  return 'Pendiente'
}

function fmtFecha(s: string) {
  return new Date(s).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

const formDetalleVacio = {
  nombre_prenda: '', categoria: 'ROPA', subcategoria: '',
  codigo_sku: '', talla: '', cantidad_solicitada: '',
}

export default function SolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [loading, setLoading]         = useState(true)
  const [proveedores, setProveedores] = useState<Opcion[]>([])
  const [colecciones, setColecciones] = useState<Opcion[]>([])
  const [usuarios, setUsuarios]       = useState<Opcion[]>([])

  const [mostrarForm, setMostrarForm]       = useState(false)
  const [mostrarFormProv, setMostrarFormProv] = useState(false)
  const [expandida, setExpandida]           = useState<string | null>(null)
  const [detalles, setDetalles]             = useState<Record<string, Detalle[]>>({})
  const [mostrarFormDetalle, setMostrarFormDetalle] = useState<string | null>(null)
  const [guardando, setGuardando]           = useState(false)

  const [form, setForm]         = useState({ id_proveedor: '', id_coleccion: '', id_usuario: '' })
  const [formDetalle, setFormDetalle] = useState(formDetalleVacio)
  const [formProv, setFormProv] = useState({ nombre: '', contacto: '', telefono: '', email: '', pais: '' })

  const [editandoCantidad, setEditandoCantidad] = useState<string | null>(null)
  const [cantidadRecibida, setCantidadRecibida] = useState('')

  const cargarSolicitudes = () => {
    setLoading(true)
    fetch('/api/solicitudes')
      .then(r => r.json())
      .then(d => { setSolicitudes(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => { setSolicitudes([]); setLoading(false) })
  }

  const cargarSelects = () => {
    fetch('/api/proveedores').then(r => r.json()).then(d =>
      setProveedores(d.map((p: any) => ({ id: p.id_proveedor, nombre: p.nombre }))))
    fetch('/api/colecciones').then(r => r.json()).then(d =>
      setColecciones(d.map((c: any) => ({ id: c.id_coleccion, nombre: c.nombre, extra: c.estado }))))
    fetch('/api/usuarios').then(r => r.json()).then(d =>
      setUsuarios(d.map((u: any) => ({ id: u.id_usuario, nombre: `${u.nombre} (${u.rol})` }))))
  }

  useEffect(() => { cargarSolicitudes(); cargarSelects() }, [])

  const cargarDetalles = (id: string) => {
    fetch(`/api/solicitudes/${id}`)
      .then(r => r.json())
      .then(d => setDetalles(p => ({ ...p, [id]: Array.isArray(d) ? d : [] })))
  }

  const toggleSolicitud = (id: string) => {
    if (expandida === id) setExpandida(null)
    else { setExpandida(id); if (!detalles[id]) cargarDetalles(id) }
  }

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault(); setGuardando(true)
    const res  = await fetch('/api/solicitudes', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) toast.error(data.error ?? 'Error al crear')
    else {
      toast.success('Solicitud creada correctamente')
      setForm({ id_proveedor: '', id_coleccion: '', id_usuario: '' })
      setMostrarForm(false); cargarSolicitudes()
    }
    setGuardando(false)
  }

  const handleAgregarDetalle = async (e: React.FormEvent, id_solicitud: string) => {
    e.preventDefault()
    if (!formDetalle.subcategoria) {
      toast.error('Selecciona una subcategoría')
      return
    }
    const res  = await fetch('/api/detalles', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formDetalle, id_solicitud }),
    })
    const data = await res.json()
    if (!res.ok) toast.error(data.error ?? 'Error al agregar ítem')
    else {
      toast.success('Ítem agregado — prenda y SKU registrados en el sistema')
      setFormDetalle(formDetalleVacio)
      setMostrarFormDetalle(null)
      cargarDetalles(id_solicitud)
    }
  }

  const handleRegistrarRecibido = async (det: Detalle) => {
    const res  = await fetch(`/api/detalles/${det.id_detalle}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cantidad_recibida: Number(cantidadRecibida) }),
    })
    const data = await res.json()
    if (!res.ok) toast.error(data.error ?? 'Error al registrar')
    else {
      toast.success('Cantidad registrada — stock actualizado en bodega')
      setEditandoCantidad(null); setCantidadRecibida('')
      cargarDetalles(det.id_solicitud); cargarSolicitudes()
    }
  }

  const handleCrearProveedor = async (e: React.FormEvent) => {
    e.preventDefault()
    const res  = await fetch('/api/proveedores', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formProv),
    })
    const data = await res.json()
    if (!res.ok) toast.error(data.error ?? 'Error')
    else {
      toast.success('Proveedor creado')
      setMostrarFormProv(false)
      setFormProv({ nombre: '', contacto: '', telefono: '', email: '', pais: '' })
      cargarSelects()
    }
  }

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff' }}>Solicitudes a Proveedor</h2>
          <p style={{ fontSize: '12px', color: '#52525b', marginTop: '4px' }}>
            Pedidos de mercancía — las prendas se registran automáticamente al llegar a bodega
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="outline" size="sm" onClick={() => setMostrarFormProv(!mostrarFormProv)}>
            + Proveedor
          </Button>
          <Button size="sm" onClick={() => setMostrarForm(!mostrarForm)}>
            <Plus style={{ width: '14px', height: '14px' }} />
            {mostrarForm ? 'Cancelar' : 'Nueva Solicitud'}
          </Button>
        </div>
      </div>

      {/* ── Form nuevo proveedor ── */}
      {mostrarFormProv && (
        <div style={cardStyle}>
          <p style={tituloCard}>Nuevo Proveedor</p>
          <form onSubmit={handleCrearProveedor}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              {[
                { key: 'nombre',   label: 'Nombre *',  req: true,  ph: 'Nombre del proveedor',  type: 'text'  },
                { key: 'contacto', label: 'Contacto',  req: false, ph: 'Nombre contacto',        type: 'text'  },
                { key: 'telefono', label: 'Teléfono',  req: false, ph: '3246732745',             type: 'tel'   },
                { key: 'email',    label: 'Email',     req: false, ph: 'correo@proveedor.com',   type: 'email' },
                { key: 'pais',     label: 'País',      req: false, ph: 'Colombia',               type: 'text'  },
              ].map(f => (
                <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <Label>{f.label}</Label>
                  <Input type={f.type} required={f.req} placeholder={f.ph}
                    value={(formProv as any)[f.key]}
                    onChange={e => setFormProv({ ...formProv, [f.key]: e.target.value })} />
                </div>
              ))}
            </div>
            <Button type="submit" size="sm">Crear Proveedor</Button>
          </form>
        </div>
      )}

      {/* ── Form nueva solicitud ── */}
      {mostrarForm && (
        <div style={cardStyle}>
          <p style={tituloCard}>Nueva Solicitud</p>
          <form onSubmit={handleCrear}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <Label>Proveedor *</Label>
                <select required value={form.id_proveedor}
                  onChange={e => setForm({ ...form, id_proveedor: e.target.value })} style={selectStyle}>
                  <option value="">Selecciona proveedor</option>
                  {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <Label>Colección destino *</Label>
                <select required value={form.id_coleccion}
                  onChange={e => setForm({ ...form, id_coleccion: e.target.value })} style={selectStyle}>
                  <option value="">Selecciona colección</option>
                  {colecciones.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}{c.extra === 'activa' ? ' ★' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <Label>Registrado por *</Label>
                <select required value={form.id_usuario}
                  onChange={e => setForm({ ...form, id_usuario: e.target.value })} style={selectStyle}>
                  <option value="">Selecciona usuario</option>
                  {usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                </select>
              </div>
            </div>
            <Button type="submit" disabled={guardando} size="sm">
              {guardando ? 'Creando…' : 'Crear Solicitud'}
            </Button>
          </form>
        </div>
      )}

      {/* ── Lista de solicitudes ── */}
      <div style={{ backgroundColor: '#111113', border: '1px solid #27272a', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 22px', borderBottom: '1px solid #27272a' }}>
          <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>
            Todas las solicitudes{' '}
            <span style={{ color: '#52525b', fontWeight: '400' }}>({solicitudes.length})</span>
          </h3>
        </div>

        {loading ? (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} style={{ height: '60px', borderRadius: '6px' }} />
            ))}
          </div>
        ) : solicitudes.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#3f3f46', fontSize: '13px' }}>
            No hay solicitudes — crea un proveedor primero, luego la solicitud
          </div>
        ) : (
          solicitudes.map(sol => (
            <div key={sol.id_solicitud}>
              {/* ── Fila solicitud ── */}
              <div
                onClick={() => toggleSolicitud(sol.id_solicitud)}
                style={{
                  display: 'grid', gridTemplateColumns: '24px 2fr 1.5fr 1.5fr auto',
                  alignItems: 'center', gap: '12px',
                  padding: '14px 22px', borderBottom: '1px solid #1c1c1f',
                  cursor: 'pointer',
                  backgroundColor: expandida === sol.id_solicitud ? '#18181b' : 'transparent',
                  transition: 'background-color 0.1s',
                }}
                onMouseEnter={e => { if (expandida !== sol.id_solicitud) e.currentTarget.style.backgroundColor = '#16161a' }}
                onMouseLeave={e => { if (expandida !== sol.id_solicitud) e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <span style={{ color: '#3f3f46' }}>
                  {expandida === sol.id_solicitud
                    ? <ChevronDown style={{ width: '14px', height: '14px' }} />
                    : <ChevronRight style={{ width: '14px', height: '14px' }} />
                  }
                </span>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>
                    {sol.proveedor?.nombre ?? '—'}
                  </p>
                  <p style={{ fontSize: '11px', color: '#52525b', marginTop: '2px' }}>
                    Por: {sol.usuario?.nombre ?? '—'}
                  </p>
                </div>
                <p style={{ fontSize: '12px', color: '#71717a' }}>{sol.coleccion?.nombre ?? '—'}</p>
                <p style={{ fontSize: '12px', color: '#71717a' }}>{fmtFecha(sol.fecha_solicitud)}</p>
                <Badge variant={estadoVariant(sol.estado)}>{estadoLabel(sol.estado)}</Badge>
              </div>

              {/* ── Detalles expandidos ── */}
              {expandida === sol.id_solicitud && (
                <div style={{ backgroundColor: '#0d0d0f', borderBottom: '1px solid #27272a', padding: '18px 32px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <p style={{ fontSize: '10px', color: '#3f3f46', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '2px' }}>
                      Ítems solicitados
                    </p>
                    {sol.estado !== 'recibido_completo' && (
                      <Button variant="outline" size="sm"
                        onClick={() => setMostrarFormDetalle(
                          mostrarFormDetalle === sol.id_solicitud ? null : sol.id_solicitud
                        )}>
                        <Plus style={{ width: '12px', height: '12px' }} />
                        Agregar prenda
                      </Button>
                    )}
                  </div>

                  {/* ── Formulario de ítem — datos de prenda ── */}
                  {mostrarFormDetalle === sol.id_solicitud && (
                    <form onSubmit={e => handleAgregarDetalle(e, sol.id_solicitud)}
                      style={{ backgroundColor: '#111113', border: '1px solid #27272a', borderRadius: '10px', padding: '18px', marginBottom: '16px' }}>

                      {/* Aviso */}
                      <p style={{ fontSize: '11px', color: '#52525b', marginBottom: '14px', lineHeight: 1.6 }}>
                        Ingresa los datos de la prenda a solicitar. La prenda y el SKU se crearán automáticamente en el catálogo cuando se registre la llegada a bodega.
                      </p>

                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                        {/* Nombre prenda */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <Label>Nombre de la prenda *</Label>
                          <Input required value={formDetalle.nombre_prenda}
                            onChange={e => setFormDetalle({ ...formDetalle, nombre_prenda: e.target.value })}
                            placeholder="ej: Hoodie Logo Central" />
                        </div>
                        {/* Categoría */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <Label>Categoría *</Label>
                          <select required value={formDetalle.categoria}
                            onChange={e => setFormDetalle({ ...formDetalle, categoria: e.target.value, subcategoria: '', talla: '' })}
                            style={selectStyle}>
                            <option value="ROPA">ROPA</option>
                            <option value="ACCESORIOS">ACCESORIOS</option>
                          </select>
                        </div>
                        {/* Subcategoría */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <Label>Subcategoría *</Label>
                          <select required value={formDetalle.subcategoria}
                            onChange={e => setFormDetalle({ ...formDetalle, subcategoria: e.target.value })}
                            style={selectStyle}>
                            <option value="">Selecciona</option>
                            {subcategorias[formDetalle.categoria as 'ROPA' | 'ACCESORIOS'].map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                        {/* Código SKU */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <Label>Código SKU *</Label>
                          <Input required value={formDetalle.codigo_sku}
                            onChange={e => setFormDetalle({ ...formDetalle, codigo_sku: e.target.value.toUpperCase() })}
                            placeholder="ej: HOD-BLK-M"
                            style={{ fontFamily: 'var(--font-mono)' }} />
                        </div>
                        {/* Talla */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <Label>Talla *</Label>
                          <select required value={formDetalle.talla}
                            onChange={e => setFormDetalle({ ...formDetalle, talla: e.target.value })}
                            style={selectStyle}>
                            <option value="">Selecciona</option>
                            {tallas[formDetalle.categoria as 'ROPA' | 'ACCESORIOS'].map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                        {/* Cantidad */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <Label>Cantidad solicitada *</Label>
                          <Input required type="number" min="1"
                            value={formDetalle.cantidad_solicitada}
                            onChange={e => setFormDetalle({ ...formDetalle, cantidad_solicitada: e.target.value })}
                            placeholder="ej: 20" />
                        </div>
                      </div>

                      <Button type="submit" size="sm">Agregar ítem a la solicitud</Button>
                    </form>
                  )}

                  {/* ── Tabla de detalles ── */}
                  {!detalles[sol.id_solicitud] ? (
                    <p style={{ color: '#3f3f46', fontSize: '12px' }}>Cargando ítems…</p>
                  ) : detalles[sol.id_solicitud].length === 0 ? (
                    <p style={{ color: '#3f3f46', fontSize: '12px' }}>
                      Sin ítems — agrega las prendas que vas a solicitar a este proveedor
                    </p>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #1c1c1f' }}>
                          {['SKU', 'Prenda', 'Talla', 'Solicitado', 'Recibido', 'Estado', 'Acción'].map(h => (
                            <th key={h} style={thStyle}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {detalles[sol.id_solicitud].map(det => (
                          <tr key={det.id_detalle} style={{ borderBottom: '1px solid #1c1c1f' }}>
                            <td style={{ padding: '11px 12px', fontSize: '11px', color: '#52525b', fontFamily: 'var(--font-mono)' }}>
                              {det.sku?.codigo_sku}
                            </td>
                            <td style={{ padding: '11px 12px', fontSize: '13px', color: '#e4e4e7' }}>
                              {det.sku?.prenda?.nombre}
                            </td>
                            <td style={{ padding: '11px 12px', fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>
                              {det.sku?.talla}
                            </td>
                            <td style={{ padding: '11px 12px', fontSize: '13px', color: '#71717a', fontFamily: 'var(--font-mono)' }}>
                              {det.cantidad_solicitada}
                            </td>
                            <td style={{ padding: '11px 12px', fontSize: '14px', fontWeight: '700', fontFamily: 'var(--font-mono)',
                              color: det.cantidad_recibida >= det.cantidad_solicitada ? '#22c55e'
                                : det.cantidad_recibida > 0 ? '#c8922a' : '#52525b' }}>
                              {det.cantidad_recibida}
                            </td>
                            <td style={{ padding: '11px 12px' }}>
                              <Badge variant={estadoVariant(det.estado_verificacion)}>
                                {estadoLabel(det.estado_verificacion)}
                              </Badge>
                            </td>
                            <td style={{ padding: '11px 12px' }}>
                              {det.estado_verificacion !== 'recibido_completo' ? (
                                editandoCantidad === det.id_detalle ? (
                                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                    <Input
                                      type="number" min="0"
                                      value={cantidadRecibida}
                                      onChange={e => setCantidadRecibida(e.target.value)}
                                      placeholder="Cant."
                                      style={{ width: '70px', height: '32px', padding: '0 8px', fontSize: '12px' }}
                                    />
                                    <Button size="icon-sm" onClick={() => handleRegistrarRecibido(det)}>✓</Button>
                                    <Button variant="outline" size="icon-sm" onClick={() => setEditandoCantidad(null)}>✕</Button>
                                  </div>
                                ) : (
                                  <Button variant="outline" size="sm"
                                    onClick={() => {
                                      setEditandoCantidad(det.id_detalle)
                                      setCantidadRecibida(String(det.cantidad_recibida))
                                    }}
                                    style={{ fontSize: '11px', color: '#c8922a', borderColor: '#78350f' }}>
                                    Registrar llegada
                                  </Button>
                                )
                              ) : (
                                <span style={{ fontSize: '11px', color: '#3f3f46' }}>Verificado ✓</span>
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

const thStyle: React.CSSProperties = {
  padding: '8px 12px', textAlign: 'left',
  fontSize: '10px', color: '#3f3f46', fontWeight: '500',
  textTransform: 'uppercase', letterSpacing: '1.5px', whiteSpace: 'nowrap',
}

const selectStyle: React.CSSProperties = {
  width: '100%', height: '36px',
  backgroundColor: '#18181b', border: '1px solid #27272a',
  borderRadius: '6px', padding: '0 12px',
  fontSize: '13px', color: '#e4e4e7', outline: 'none',
}

const cardStyle: React.CSSProperties = {
  backgroundColor: '#111113', border: '1px solid #27272a',
  borderRadius: '12px', padding: '22px', marginBottom: '20px',
}

const tituloCard: React.CSSProperties = {
  fontSize: '12px', fontWeight: '600', color: '#ffffff',
  marginBottom: '18px', textTransform: 'uppercase', letterSpacing: '1px',
}
