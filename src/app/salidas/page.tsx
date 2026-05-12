'use client'
import { useEffect, useState } from 'react'

interface Salida {
  id_salida:    string
  fecha_salida: string
  cantidad:     number
  observacion:  string | null
  sku:          { codigo_sku: string; talla: string; prenda: { nombre: string; categoria: string } }
  usuario:      { nombre: string }
  cliente:      { nombre: string; ciudad: string; departamento: string }
}

interface Opcion { id: string; nombre: string }

export default function SalidasPage() {
  const [salidas, setSalidas]           = useState<Salida[]>([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState('')
  const [exito, setExito]               = useState('')
  const [mostrarForm, setMostrarForm]   = useState(false)
  const [guardando, setGuardando]       = useState(false)

  const [skus, setSkus]           = useState<any[]>([])
  const [usuarios, setUsuarios]   = useState<Opcion[]>([])
  const [clientes, setClientes]   = useState<any[]>([])

  const [form, setForm] = useState({
    id_sku: '', id_usuario: '', id_cliente: '', cantidad: '', observacion: ''
  })

  const cargarSalidas = () => {
    setLoading(true)
    fetch('/api/salidas')
      .then(r => r.json())
      .then(d => { setSalidas(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => { setSalidas([]); setLoading(false) })
  }

  const cargarSelects = () => {
    fetch('/api/sku').then(r => r.json()).then(setSkus)
    fetch('/api/usuarios').then(r => r.json())
      .then(d => setUsuarios(d.map((u: any) => ({ id: u.id_usuario, nombre: `${u.nombre} (${u.rol})` }))))
    fetch('/api/clientes').then(r => r.json())
      .then(d => setClientes(Array.isArray(d) ? d.filter((c: any) => c.estado === 'activo') : []))
  }

  useEffect(() => { cargarSalidas(); cargarSelects() }, [])

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault()
    setGuardando(true); setError('')
    const res = await fetch('/api/salidas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, cantidad: Number(form.cantidad) }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error) }
    else {
      setExito('Salida registrada — stock descontado automáticamente')
      setForm({ id_sku: '', id_usuario: '', id_cliente: '', cantidad: '', observacion: '' })
      setMostrarForm(false)
      cargarSalidas()
      setTimeout(() => setExito(''), 4000)
    }
    setGuardando(false)
  }

  const skuSeleccionado      = skus.find(s => s.id_sku === form.id_sku)
  const clienteSeleccionado  = clientes.find(c => c.id_cliente === form.id_cliente)

  return (
    <div>
      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff' }}>Salidas de Bodega</h2>
          <p style={{ fontSize: '14px', color: '#52525b', marginTop: '4px' }}>
            Registra despachos hacia aliados multimarca — el stock se descuenta automáticamente
          </p>
        </div>
        <button onClick={() => setMostrarForm(!mostrarForm)} style={btnPrimario}>
          {mostrarForm ? 'Cancelar' : '+ Nueva Salida'}
        </button>
      </div>

      {error && <div style={estiloError}>⚠ {error}</div>}
      {exito && <div style={estiloExito}>✓ {exito}</div>}

      {/* Formulario */}
      {mostrarForm && (
        <div style={cardStyle}>
          <h3 style={tituloCard}>Registrar Salida</h3>
          <form onSubmit={handleCrear}>

            {/* Fila 1: SKU + Cantidad + Responsable */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={labelStyle}>SKU *</label>
                <select required value={form.id_sku}
                  onChange={e => setForm({ ...form, id_sku: e.target.value })}
                  style={inputStyle}>
                  <option value="">Selecciona SKU</option>
                  {skus.map((s: any) => (
                    <option key={s.id_sku} value={s.id_sku}>
                      {s.codigo_sku} — Talla {s.talla} (Stock: {s.stock})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Cantidad *</label>
                <input required type="number" min="1"
                  value={form.cantidad}
                  onChange={e => setForm({ ...form, cantidad: e.target.value })}
                  placeholder="ej: 5"
                  style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Responsable *</label>
                <select required value={form.id_usuario}
                  onChange={e => setForm({ ...form, id_usuario: e.target.value })}
                  style={inputStyle}>
                  <option value="">Selecciona usuario</option>
                  {usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                </select>
              </div>
            </div>

            {/* Preview SKU seleccionado */}
            {skuSeleccionado && (
              <div style={previewBox}>
                <div style={previewItem}>
                  <p style={labelPreview}>Prenda</p>
                  <p style={valorPreview}>{skuSeleccionado.prenda?.nombre ?? '—'}</p>
                </div>
                <div style={previewItem}>
                  <p style={labelPreview}>Talla</p>
                  <p style={{ ...valorPreview, fontWeight: '700' }}>{skuSeleccionado.talla}</p>
                </div>
                <div style={previewItem}>
                  <p style={labelPreview}>Stock disponible</p>
                  <p style={{ ...valorPreview, fontWeight: '700', color: skuSeleccionado.stock > 0 ? '#22c55e' : '#ef4444' }}>
                    {skuSeleccionado.stock} unidades
                  </p>
                </div>
              </div>
            )}

            {/* Fila 2: Cliente destino */}
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Aliado / Cliente destino *</label>
              <select required value={form.id_cliente}
                onChange={e => setForm({ ...form, id_cliente: e.target.value })}
                style={inputStyle}>
                <option value="">Selecciona el aliado multimarca</option>
                {clientes.map((c: any) => (
                  <option key={c.id_cliente} value={c.id_cliente}>
                    {c.nombre} — {c.ciudad}, {c.departamento}
                  </option>
                ))}
              </select>
            </div>

            {/* Preview cliente seleccionado */}
            {clienteSeleccionado && (
              <div style={previewBox}>
                <div style={previewItem}>
                  <p style={labelPreview}>Aliado</p>
                  <p style={valorPreview}>{clienteSeleccionado.nombre}</p>
                </div>
                <div style={previewItem}>
                  <p style={labelPreview}>Ciudad</p>
                  <p style={valorPreview}>{clienteSeleccionado.ciudad}</p>
                </div>
                <div style={previewItem}>
                  <p style={labelPreview}>Departamento</p>
                  <p style={valorPreview}>{clienteSeleccionado.departamento ?? '—'}</p>
                </div>
                {clienteSeleccionado.telefono && (
                  <div style={previewItem}>
                    <p style={labelPreview}>Teléfono</p>
                    <p style={valorPreview}>{clienteSeleccionado.telefono}</p>
                  </div>
                )}
              </div>
            )}

            {/* Observación */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Observación</label>
              <input value={form.observacion}
                onChange={e => setForm({ ...form, observacion: e.target.value })}
                placeholder="Notas adicionales sobre el despacho..."
                style={inputStyle} />
            </div>

            <button type="submit" disabled={guardando}
              style={{ ...btnPrimario, opacity: guardando ? 0.6 : 1 }}>
              {guardando ? 'Registrando...' : 'Registrar Salida'}
            </button>
          </form>
        </div>
      )}

      {/* Historial */}
      <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #27272a' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff' }}>
            Historial de salidas
            <span style={{ marginLeft: '10px', fontSize: '13px', color: '#52525b', fontWeight: '400' }}>
              ({salidas.length})
            </span>
          </h3>
        </div>

        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <p style={{ color: '#3f3f46', fontSize: '13px', letterSpacing: '2px' }}>CARGANDO...</p>
          </div>
        ) : salidas.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <p style={{ color: '#3f3f46', fontSize: '14px' }}>No hay salidas registradas</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 2fr 1fr', padding: '12px 24px', borderBottom: '1px solid #27272a' }}>
              {['Prenda', 'SKU / Talla', 'Cantidad', 'Aliado destino', 'Fecha'].map(h => (
                <p key={h} style={{ fontSize: '11px', color: '#52525b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</p>
              ))}
            </div>

            {salidas.map((s) => (
              <div key={s.id_salida} style={{
                display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 2fr 1fr',
                alignItems: 'center', padding: '16px 24px',
                borderBottom: '1px solid #1c1c1f',
              }}>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>
                    {s.sku?.prenda?.nombre ?? '—'}
                  </p>
                  <p style={{ fontSize: '12px', color: '#52525b', marginTop: '2px', textTransform: 'uppercase' }}>
                    {s.sku?.prenda?.categoria ?? '—'}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#a1a1aa', fontFamily: 'monospace' }}>{s.sku?.codigo_sku}</p>
                  <p style={{ fontSize: '13px', fontWeight: '700', color: '#ffffff', marginTop: '2px' }}>Talla {s.sku?.talla}</p>
                </div>
                <p style={{ fontSize: '22px', fontWeight: '700', color: '#ef4444' }}>
                  -{s.cantidad}
                </p>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>
                    {s.cliente?.nombre ?? '—'}
                  </p>
                  <p style={{ fontSize: '12px', color: '#52525b', marginTop: '2px' }}>
                    {s.cliente?.ciudad}{s.cliente?.departamento ? `, ${s.cliente.departamento}` : ''}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#71717a' }}>
                    {new Date(s.fecha_salida).toLocaleDateString('es-CO', {
                      day: '2-digit', month: 'short', year: 'numeric'
                    })}
                  </p>
                  {s.observacion && (
                    <p style={{ fontSize: '11px', color: '#3f3f46', marginTop: '4px', fontStyle: 'italic' }}>
                      "{s.observacion}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </>
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
const previewBox: React.CSSProperties = {
  backgroundColor: '#09090b', border: '1px solid #27272a',
  borderRadius: '8px', padding: '16px 20px', marginBottom: '16px',
  display: 'flex', gap: '0',
}
const previewItem: React.CSSProperties = {
  flex: 1, paddingRight: '20px',
  borderRight: '1px solid #27272a', marginRight: '20px',
}
const labelPreview: React.CSSProperties = {
  fontSize: '11px', color: '#52525b', textTransform: 'uppercase',
  letterSpacing: '1px', marginBottom: '6px',
}
const valorPreview: React.CSSProperties = {
  fontSize: '14px', color: '#ffffff', fontWeight: '500',
}
const btnPrimario: React.CSSProperties = {
  backgroundColor: '#ffffff', color: '#09090b', border: 'none',
  borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
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
