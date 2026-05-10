'use client'
import { useEffect, useState } from 'react'

interface Salida {
  id_salida: string
  fecha_salida: string
  cantidad: number
  observacion: string | null
  sku: { codigo_sku: string; talla: string; prenda: { nombre: string; categoria: string } }
  usuario: { nombre: string }
}

interface Opcion { id: string; nombre: string }

export default function SalidasPage() {
  const [salidas, setSalidas]       = useState<Salida[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [exito, setExito]           = useState('')
  const [mostrarForm, setMostrarForm] = useState(false)
  const [guardando, setGuardando]   = useState(false)

  const [skus, setSkus]         = useState<any[]>([])
  const [usuarios, setUsuarios] = useState<Opcion[]>([])

  const [form, setForm] = useState({
    id_sku: '', id_usuario: '', cantidad: '', observacion: ''
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
      setForm({ id_sku: '', id_usuario: '', cantidad: '', observacion: '' })
      setMostrarForm(false)
      cargarSalidas()
      setTimeout(() => setExito(''), 4000)
    }
    setGuardando(false)
  }

  const skuSeleccionado = skus.find(s => s.id_sku === form.id_sku)

  return (
    <div>
      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff' }}>Salidas de Bodega</h2>
          <p style={{ fontSize: '14px', color: '#52525b', marginTop: '4px' }}>
            Registra despachos y salidas de mercancía — el stock se descuenta automáticamente
          </p>
        </div>
        <button onClick={() => setMostrarForm(!mostrarForm)} style={btnPrimario}>
          {mostrarForm ? 'Cancelar' : '+ Nueva Salida'}
        </button>
      </div>

      {/* Mensajes */}
      {error && <div style={estiloError}>⚠ {error}</div>}
      {exito && <div style={estiloExito}>✓ {exito}</div>}

      {/* Formulario nueva salida */}
      {mostrarForm && (
        <div style={cardStyle}>
          <h3 style={tituloCard}>Registrar Salida</h3>
          <form onSubmit={handleCrear}>
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

            {/* Info del SKU seleccionado */}
            {skuSeleccionado && (
              <div style={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', display: 'flex', gap: '32px' }}>
                <div>
                  <p style={{ fontSize: '11px', color: '#52525b', textTransform: 'uppercase', letterSpacing: '1px' }}>Prenda</p>
                  <p style={{ fontSize: '14px', color: '#ffffff', marginTop: '4px' }}>{skuSeleccionado.prenda?.nombre ?? '—'}</p>
                </div>
                <div>
                  <p style={{ fontSize: '11px', color: '#52525b', textTransform: 'uppercase', letterSpacing: '1px' }}>Talla</p>
                  <p style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff', marginTop: '4px' }}>{skuSeleccionado.talla}</p>
                </div>
                <div>
                  <p style={{ fontSize: '11px', color: '#52525b', textTransform: 'uppercase', letterSpacing: '1px' }}>Stock disponible</p>
                  <p style={{ fontSize: '14px', fontWeight: '700', color: skuSeleccionado.stock > 0 ? '#22c55e' : '#ef4444', marginTop: '4px' }}>
                    {skuSeleccionado.stock} unidades
                  </p>
                </div>
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Observación</label>
              <input value={form.observacion}
                onChange={e => setForm({ ...form, observacion: e.target.value })}
                placeholder="Motivo de salida, destino, etc."
                style={inputStyle} />
            </div>

            <button type="submit" disabled={guardando}
              style={{ ...btnPrimario, opacity: guardando ? 0.6 : 1 }}>
              {guardando ? 'Registrando...' : 'Registrar Salida'}
            </button>
          </form>
        </div>
      )}

      {/* Tabla de historial */}
      <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #27272a' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff' }}>
            Historial de salidas
            <span style={{ marginLeft: '10px', fontSize: '13px', color: '#52525b', fontWeight: '400' }}>({salidas.length})</span>
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
            {/* Header tabla */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 2fr', padding: '12px 24px', borderBottom: '1px solid #27272a' }}>
              {['Prenda', 'SKU / Talla', 'Cantidad', 'Responsable', 'Fecha / Observación'].map(h => (
                <p key={h} style={{ fontSize: '11px', color: '#52525b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</p>
              ))}
            </div>

            {salidas.map((s) => (
              <div key={s.id_salida} style={{
                display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 2fr',
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
                <p style={{ fontSize: '13px', color: '#a1a1aa' }}>{s.usuario?.nombre ?? '—'}</p>
                <div>
                  <p style={{ fontSize: '12px', color: '#71717a' }}>
                    {new Date(s.fecha_salida).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {s.observacion && (
                    <p style={{ fontSize: '12px', color: '#52525b', marginTop: '4px', fontStyle: 'italic' }}>
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

// ── Estilos ─────────────────────────────────────────────
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