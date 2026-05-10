'use client'
import { useEffect, useState } from 'react'

// ── Tipos ──────────────────────────────────────────────
interface ItemStock {
  id_sku: string
  codigo_sku: string
  talla: string
  stock: number
  stock_inicial: number
  nombre_prenda: string
  categoria: string
  subcategoria: string
  coleccion: string
  estado_coleccion: string
  temporada: string
}

// ── Página principal ───────────────────────────────────
export default function InventarioPage() {
  const [items, setItems]           = useState<ItemStock[]>([])
  const [loading, setLoading]       = useState(true)
  const [filtroColeccion, setFiltroColeccion] = useState<'activa' | 'todas' | 'rezagadas'>('activa')
  const [filtroCategoria, setFiltroCategoria] = useState<'TODAS' | 'ROPA' | 'ACCESORIOS'>('TODAS')
  const [busqueda, setBusqueda]     = useState('')

  // ── Cargar inventario ──────────────────────────────
  const cargarInventario = () => {
    setLoading(true)

    let url = '/api/inventario'
    if (filtroColeccion === 'activa')    url += '?soloActiva=true'
    if (filtroColeccion === 'rezagadas') url += '?soloRezagadas=true'

    fetch(url)
      .then(r => r.json())
      .then(data => {
        setItems(data)
        setLoading(false)
      })
  }

  useEffect(() => { cargarInventario() }, [filtroColeccion])

  // ── Filtros locales ────────────────────────────────
  const itemsFiltrados = items.filter(item => {
    const matchCategoria = filtroCategoria === 'TODAS' || item.categoria === filtroCategoria
    const matchBusqueda  = busqueda === '' ||
      item.nombre_prenda.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.codigo_sku.toLowerCase().includes(busqueda.toLowerCase())
    return matchCategoria && matchBusqueda
  })

  // ── Totales ────────────────────────────────────────
  const totalUnidades  = itemsFiltrados.reduce((s, i) => s + i.stock, 0)
  const itemsBajoStock = itemsFiltrados.filter(i => i.stock <= 5 && i.stock > 0).length
  const itemsSinStock  = itemsFiltrados.filter(i => i.stock === 0).length

  // ── Render ─────────────────────────────────────────
  return (
    <div>

      {/* Encabezado */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff' }}>Inventario</h2>
        <p style={{ fontSize: '14px', color: '#52525b', marginTop: '4px' }}>
          Consulta el stock en tiempo real por SKU, talla y colección
        </p>
      </div>

      {/* Tarjetas de resumen rápido */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { label: 'Total unidades',  value: totalUnidades,  color: '#ffffff' },
          { label: 'SKUs mostrados',  value: itemsFiltrados.length, color: '#ffffff' },
          { label: 'Stock bajo (≤5)', value: itemsBajoStock, color: itemsBajoStock > 0 ? '#f59e0b' : '#ffffff' },
          { label: 'Sin stock',       value: itemsSinStock,  color: itemsSinStock > 0 ? '#ef4444' : '#ffffff' },
        ].map(card => (
          <div key={card.label} style={{
            flex: 1, minWidth: '160px',
            backgroundColor: '#18181b',
            border: '1px solid #27272a',
            borderRadius: '10px',
            padding: '18px 20px',
          }}>
            <p style={{ fontSize: '11px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>
              {card.label}
            </p>
            <p style={{ fontSize: '28px', fontWeight: '700', color: card.color }}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{
        backgroundColor: '#18181b',
        border: '1px solid #27272a',
        borderRadius: '12px',
        padding: '20px 24px',
        marginBottom: '20px',
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap',
        alignItems: 'flex-end',
      }}>

        {/* Búsqueda */}
        <div style={{ flex: 2, minWidth: '200px' }}>
          <label style={labelStyle}>Buscar prenda o código SKU</label>
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="ej: Hoodie, OVER-BLK-M..."
            style={inputStyle}
          />
        </div>

        {/* Filtro colección */}
        <div style={{ flex: 1, minWidth: '160px' }}>
          <label style={labelStyle}>Colección</label>
          <div style={{ display: 'flex', gap: '6px' }}>
            {(['activa', 'todas', 'rezagadas'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFiltroColeccion(f)}
                style={{
                  flex: 1,
                  padding: '8px 6px',
                  borderRadius: '6px',
                  border: '1px solid',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  borderColor: filtroColeccion === f ? '#ffffff' : '#27272a',
                  backgroundColor: filtroColeccion === f ? '#ffffff' : 'transparent',
                  color: filtroColeccion === f ? '#09090b' : '#71717a',
                }}
              >
                {f === 'activa' ? 'Activa' : f === 'todas' ? 'Todas' : 'Rezagadas'}
              </button>
            ))}
          </div>
        </div>

        {/* Filtro categoría */}
        <div style={{ flex: 1, minWidth: '160px' }}>
          <label style={labelStyle}>Categoría</label>
          <div style={{ display: 'flex', gap: '6px' }}>
            {(['TODAS', 'ROPA', 'ACCESORIOS'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFiltroCategoria(f)}
                style={{
                  flex: 1,
                  padding: '8px 4px',
                  borderRadius: '6px',
                  border: '1px solid',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  borderColor: filtroCategoria === f ? '#ffffff' : '#27272a',
                  backgroundColor: filtroCategoria === f ? '#ffffff' : 'transparent',
                  color: filtroCategoria === f ? '#09090b' : '#71717a',
                }}
              >
                {f === 'TODAS' ? 'Todas' : f === 'ROPA' ? 'Ropa' : 'Acces.'}
              </button>
            ))}
          </div>
        </div>

        {/* Botón refrescar */}
        <button
          onClick={cargarInventario}
          style={{
            padding: '10px 18px',
            borderRadius: '8px',
            border: '1px solid #27272a',
            backgroundColor: 'transparent',
            color: '#a1a1aa',
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          ↺ Refrescar
        </button>
      </div>

      {/* Tabla de inventario */}
      <div style={{
        backgroundColor: '#18181b',
        border: '1px solid #27272a',
        borderRadius: '12px',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #27272a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff' }}>
            Stock en Bodega
            <span style={{ marginLeft: '10px', fontSize: '13px', color: '#52525b', fontWeight: '400' }}>
              ({itemsFiltrados.length} SKUs)
            </span>
          </h3>
          {filtroColeccion === 'rezagadas' && (
            <span style={{ fontSize: '12px', color: '#f59e0b', backgroundColor: '#451a03', padding: '4px 12px', borderRadius: '999px', border: '1px solid #78350f' }}>
              ⚠ Mostrando colecciones anteriores con stock
            </span>
          )}
        </div>

        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <p style={{ color: '#3f3f46', fontSize: '13px', letterSpacing: '2px' }}>CARGANDO...</p>
          </div>
        ) : itemsFiltrados.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <p style={{ color: '#3f3f46', fontSize: '14px' }}>No hay items que coincidan con los filtros</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #27272a' }}>
                {['Código SKU', 'Prenda', 'Categoría', 'Subcategoría', 'Talla', 'Colección', 'Stock', 'Inicial', 'Estado'].map(h => (
                  <th key={h} style={{
                    padding: '12px 20px',
                    textAlign: 'left',
                    fontSize: '11px',
                    color: '#52525b',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    whiteSpace: 'nowrap',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {itemsFiltrados.map((item, i) => (
                <tr
                  key={item.id_sku}
                  style={{
                    borderBottom: i < itemsFiltrados.length - 1 ? '1px solid #1c1c1f' : 'none',
                    backgroundColor: item.stock === 0 ? '#0f0f10' : 'transparent',
                  }}
                >
                  <td style={{ padding: '14px 20px', fontSize: '12px', color: '#71717a', fontFamily: 'monospace' }}>
                    {item.codigo_sku}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '14px', color: '#ffffff', fontWeight: '500' }}>
                    {item.nombre_prenda}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      fontSize: '11px', padding: '3px 8px', borderRadius: '999px',
                      backgroundColor: '#27272a', color: '#a1a1aa', border: '1px solid #3f3f46',
                    }}>
                      {item.categoria}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: '#71717a' }}>
                    {item.subcategoria}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '14px', fontWeight: '700', color: '#ffffff' }}>
                    {item.talla}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: '#71717a' }}>
                    {item.coleccion}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      fontSize: '18px',
                      fontWeight: '800',
                      color: item.stock === 0
                        ? '#3f3f46'
                        : item.stock <= 5
                        ? '#ef4444'
                        : '#22c55e',
                    }}>
                      {item.stock}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: '#52525b' }}>
                    {item.stock_inicial}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    {item.stock === 0 ? (
                      <span style={{ fontSize: '11px', color: '#52525b', backgroundColor: '#18181b', padding: '3px 10px', borderRadius: '999px', border: '1px solid #27272a' }}>
                        AGOTADO
                      </span>
                    ) : item.stock <= 5 ? (
                      <span style={{ fontSize: '11px', color: '#f59e0b', backgroundColor: '#1c1003', padding: '3px 10px', borderRadius: '999px', border: '1px solid #78350f' }}>
                        BAJO
                      </span>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#22c55e', backgroundColor: '#052e16', padding: '3px 10px', borderRadius: '999px', border: '1px solid #166534' }}>
                        OK
                      </span>
                    )}
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

// ── Estilos ────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#71717a',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  display: 'block',
  marginBottom: '8px',
}

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