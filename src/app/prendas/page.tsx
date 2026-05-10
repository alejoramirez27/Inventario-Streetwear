'use client'
import { useEffect, useState } from 'react'

// ── Tipos ──────────────────────────────────────────────
interface Coleccion {
  id_coleccion: string
  nombre: string
  estado: string
}

interface Prenda {
  id_prenda: string
  id_coleccion: string
  nombre: string
  categoria: 'ROPA' | 'ACCESORIOS'
  subcategoria: string
  coleccion: { nombre: string; estado: string }
}

interface SKU {
  id_sku: string
  id_prenda: string
  codigo_sku: string
  talla: string
  stock: number
  stock_inicial: number
}

// ── Opciones de subcategoría según categoría ───────────
const subcategorias = {
  ROPA: ['Camiseta Oversize', 'Camiseta Slim Fit', 'Hoodie', 'Chaqueta', 'Sudadera', 'Jean', 'Short'],
  ACCESORIOS: ['Gorra', 'Underwear'],
}

const tallas = {
  ROPA: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  ACCESORIOS: ['Única', 'S/M', 'M/L', 'L/XL'],
}

// ── Estilos reutilizables ──────────────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%',
  backgroundColor: '#09090b',
  border: '1px solid #27272a',
  borderRadius: '8px',
  padding: '10px 14px',
  fontSize: '14px',
  color: '#ffffff',
  outline: 'none',
}

const btnSecundario: React.CSSProperties = {
  backgroundColor: 'transparent',
  border: '1px solid #27272a',
  borderRadius: '6px',
  padding: '6px 14px',
  fontSize: '12px',
  color: '#a1a1aa',
  cursor: 'pointer',
  fontWeight: '500',
}

// ── Página principal ───────────────────────────────────
export default function PrendasPage() {
  const [prendas, setPrendas]         = useState<Prenda[]>([])
  const [colecciones, setColecciones] = useState<Coleccion[]>([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [exito, setExito]             = useState('')
  const [mostrarForm, setMostrarForm] = useState(false)
  const [guardando, setGuardando]     = useState(false)

  // Prenda expandida para ver sus SKUs
  const [prendaExpandida, setPrendaExpandida] = useState<string | null>(null)
  const [skus, setSkus]                       = useState<Record<string, SKU[]>>({})
  const [mostrarFormSku, setMostrarFormSku]   = useState<string | null>(null)

  // Formulario prenda
  const [form, setForm] = useState({
    id_coleccion: '',
    nombre: '',
    categoria: 'ROPA',
    subcategoria: '',
  })

  // Formulario SKU
  const [formSku, setFormSku] = useState({
    codigo_sku: '',
    talla: '',
  })

  // ── Cargar datos ───────────────────────────────────
  const cargarPrendas = () => {
    setLoading(true)
    fetch('/api/prendas')
      .then(r => r.json())
      .then(d => { setPrendas(d); setLoading(false) })
  }

  useEffect(() => {
    cargarPrendas()
    fetch('/api/colecciones')
      .then(r => r.json())
      .then(setColecciones)
  }, [])

  // ── Cargar SKUs de una prenda ──────────────────────
  const cargarSkus = (id_prenda: string) => {
    fetch(`/api/sku?id_prenda=${id_prenda}`)
      .then(r => r.json())
      .then(data => setSkus(prev => ({ ...prev, [id_prenda]: data })))
  }

  const togglePrenda = (id_prenda: string) => {
    if (prendaExpandida === id_prenda) {
      setPrendaExpandida(null)
    } else {
      setPrendaExpandida(id_prenda)
      if (!skus[id_prenda]) cargarSkus(id_prenda)
    }
  }

  // ── Crear prenda ───────────────────────────────────
  const handleCrearPrenda = async (e: React.FormEvent) => {
    e.preventDefault()
    setGuardando(true)
    setError('')

    const res = await fetch('/api/prendas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
    } else {
      setExito('Prenda creada correctamente')
      setForm({ id_coleccion: '', nombre: '', categoria: 'ROPA', subcategoria: '' })
      setMostrarForm(false)
      cargarPrendas()
      setTimeout(() => setExito(''), 3000)
    }
    setGuardando(false)
  }

  // ── Crear SKU ──────────────────────────────────────
  const handleCrearSku = async (e: React.FormEvent, id_prenda: string) => {
    e.preventDefault()
    setError('')

    const res = await fetch('/api/sku', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formSku, id_prenda }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
    } else {
      setExito('SKU agregado correctamente')
      setFormSku({ codigo_sku: '', talla: '' })
      setMostrarFormSku(null)
      cargarSkus(id_prenda)
      setTimeout(() => setExito(''), 3000)
    }
  }

  // ── Eliminar prenda ────────────────────────────────
  const handleEliminar = async (prenda: Prenda) => {
    if (!confirm(`¿Eliminar "${prenda.nombre}"?`)) return
    setError('')

    const res = await fetch(`/api/prendas/${prenda.id_prenda}`, { method: 'DELETE' })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
    } else {
      setExito('Prenda eliminada')
      cargarPrendas()
      setTimeout(() => setExito(''), 3000)
    }
  }

  // ── Render ─────────────────────────────────────────
  return (
    <div>
      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff' }}>Prendas</h2>
          <p style={{ fontSize: '14px', color: '#52525b', marginTop: '4px' }}>
            Registra las prendas y sus variantes por talla (SKU)
          </p>
        </div>
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          style={{ backgroundColor: '#ffffff', color: '#09090b', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
        >
          {mostrarForm ? 'Cancelar' : '+ Nueva Prenda'}
        </button>
      </div>

      {/* Mensajes */}
      {error && (
        <div style={{ backgroundColor: '#1c0a0a', border: '1px solid #7f1d1d', borderRadius: '8px', padding: '14px 18px', marginBottom: '20px', color: '#ef4444', fontSize: '14px' }}>
          ⚠ {error}
        </div>
      )}
      {exito && (
        <div style={{ backgroundColor: '#052e16', border: '1px solid #166534', borderRadius: '8px', padding: '14px 18px', marginBottom: '20px', color: '#22c55e', fontSize: '14px' }}>
          ✓ {exito}
        </div>
      )}

      {/* Formulario nueva prenda */}
      {mostrarForm && (
        <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '20px', color: '#ffffff' }}>Nueva Prenda</h3>
          <form onSubmit={handleCrearPrenda}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>

              {/* Colección */}
              <div>
                <label style={labelStyle}>Colección *</label>
                <select required value={form.id_coleccion} onChange={e => setForm({ ...form, id_coleccion: e.target.value })} style={inputStyle}>
                  <option value="">Selecciona una colección</option>
                  {colecciones.map(c => (
                    <option key={c.id_coleccion} value={c.id_coleccion}>
                      {c.nombre} {c.estado === 'activa' ? '★' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nombre */}
              <div>
                <label style={labelStyle}>Nombre *</label>
                <input required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="ej: Hoodie Logo Central" style={inputStyle} />
              </div>

              {/* Categoría */}
              <div>
                <label style={labelStyle}>Categoría *</label>
                <select
                  value={form.categoria}
                  onChange={e => setForm({ ...form, categoria: e.target.value as 'ROPA' | 'ACCESORIOS', subcategoria: '' })}
                  style={inputStyle}
                >
                  <option value="ROPA">ROPA</option>
                  <option value="ACCESORIOS">ACCESORIOS</option>
                </select>
              </div>

              {/* Subcategoría */}
              <div>
                <label style={labelStyle}>Subcategoría *</label>
                <select required value={form.subcategoria} onChange={e => setForm({ ...form, subcategoria: e.target.value })} style={inputStyle}>
                  <option value="">Selecciona subcategoría</option>
                  {subcategorias[form.categoria as 'ROPA' | 'ACCESORIOS'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit" disabled={guardando} style={{ backgroundColor: '#ffffff', color: '#09090b', border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', opacity: guardando ? 0.6 : 1 }}>
              {guardando ? 'Guardando...' : 'Crear Prenda'}
            </button>
          </form>
        </div>
      )}

      {/* Lista de prendas */}
      <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #27272a' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff' }}>
            Todas las prendas
            <span style={{ marginLeft: '10px', fontSize: '13px', color: '#52525b', fontWeight: '400' }}>({prendas.length})</span>
          </h3>
        </div>

        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <p style={{ color: '#3f3f46', fontSize: '13px', letterSpacing: '2px' }}>CARGANDO...</p>
          </div>
        ) : prendas.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <p style={{ color: '#3f3f46', fontSize: '14px' }}>No hay prendas registradas</p>
          </div>
        ) : (
          prendas.map((prenda, i) => (
            <div key={prenda.id_prenda}>
              {/* Fila de la prenda */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
                  alignItems: 'center',
                  padding: '16px 24px',
                  borderBottom: '1px solid #1c1c1f',
                  cursor: 'pointer',
                  backgroundColor: prendaExpandida === prenda.id_prenda ? '#1c1c1f' : 'transparent',
                }}
                onClick={() => togglePrenda(prenda.id_prenda)}
              >
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>{prenda.nombre}</p>
                  <p style={{ fontSize: '12px', color: '#52525b', marginTop: '2px' }}>{prenda.subcategoria}</p>
                </div>
                <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '999px', backgroundColor: '#27272a', color: '#a1a1aa', border: '1px solid #3f3f46', width: 'fit-content' }}>
                  {prenda.categoria}
                </span>
                <p style={{ fontSize: '13px', color: '#71717a' }}>
                  {prenda.coleccion?.nombre ?? '—'}
                </p>
                <span style={{
                  fontSize: '11px', padding: '3px 10px', borderRadius: '999px', width: 'fit-content',
                  backgroundColor: prenda.coleccion?.estado === 'activa' ? '#14532d' : '#1c1c1f',
                  color: prenda.coleccion?.estado === 'activa' ? '#22c55e' : '#71717a',
                  border: `1px solid ${prenda.coleccion?.estado === 'activa' ? '#166534' : '#27272a'}`,
                }}>
                  {prenda.coleccion?.estado?.toUpperCase() ?? '—'}
                </span>
                <div style={{ display: 'flex', gap: '8px' }} onClick={e => e.stopPropagation()}>
                  <button onClick={() => handleEliminar(prenda)} style={{ ...btnSecundario, color: '#ef4444' }}>
                    Eliminar
                  </button>
                </div>
              </div>

              {/* SKUs expandidos */}
              {prendaExpandida === prenda.id_prenda && (
                <div style={{ backgroundColor: '#111113', borderBottom: '1px solid #27272a', padding: '20px 32px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <p style={{ fontSize: '13px', color: '#71717a', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      SKUs — Variantes por talla
                    </p>
                    <button
                      onClick={() => setMostrarFormSku(mostrarFormSku === prenda.id_prenda ? null : prenda.id_prenda)}
                      style={{ ...btnSecundario, color: '#ffffff', borderColor: '#3f3f46' }}
                    >
                      + Agregar SKU
                    </button>
                  </div>

                  {/* Formulario nuevo SKU */}
                  {mostrarFormSku === prenda.id_prenda && (
                    <form
                      onSubmit={e => handleCrearSku(e, prenda.id_prenda)}
                      style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', marginBottom: '16px', backgroundColor: '#18181b', padding: '16px', borderRadius: '8px', border: '1px solid #27272a' }}
                    >
                      <div style={{ flex: 1 }}>
                        <label style={labelStyle}>Código SKU *</label>
                        <input
                          required
                          value={formSku.codigo_sku}
                          onChange={e => setFormSku({ ...formSku, codigo_sku: e.target.value })}
                          placeholder="ej: HOD-BLK-M"
                          style={inputStyle}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={labelStyle}>Talla *</label>
                        <select
                          required
                          value={formSku.talla}
                          onChange={e => setFormSku({ ...formSku, talla: e.target.value })}
                          style={inputStyle}
                        >
                          <option value="">Selecciona talla</option>
                          {tallas[prenda.categoria].map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                      <button type="submit" style={{ backgroundColor: '#ffffff', color: '#09090b', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                        Agregar
                      </button>
                    </form>
                  )}

                  {/* Tabla de SKUs */}
                  {!skus[prenda.id_prenda] ? (
                    <p style={{ color: '#3f3f46', fontSize: '13px' }}>Cargando SKUs...</p>
                  ) : skus[prenda.id_prenda].length === 0 ? (
                    <p style={{ color: '#3f3f46', fontSize: '13px' }}>No hay SKUs registrados — agrega la primera talla</p>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #27272a' }}>
                          {['Código SKU', 'Talla', 'Stock Actual', 'Stock Inicial'].map(h => (
                            <th key={h} style={{ padding: '8px 16px', textAlign: 'left', fontSize: '11px', color: '#52525b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {skus[prenda.id_prenda].map(sku => (
                          <tr key={sku.id_sku}>
                            <td style={{ padding: '10px 16px', fontSize: '13px', color: '#a1a1aa', fontFamily: 'monospace' }}>{sku.codigo_sku}</td>
                            <td style={{ padding: '10px 16px', fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>{sku.talla}</td>
                            <td style={{ padding: '10px 16px' }}>
                              <span style={{ fontSize: '14px', fontWeight: '700', color: sku.stock <= 5 ? '#ef4444' : '#22c55e' }}>
                                {sku.stock}
                              </span>
                            </td>
                            <td style={{ padding: '10px 16px', fontSize: '13px', color: '#52525b' }}>{sku.stock_inicial}</td>
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

// ── Estilos label ──────────────────────────────────────
const labelStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#71717a',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  display: 'block',
  marginBottom: '8px',
}