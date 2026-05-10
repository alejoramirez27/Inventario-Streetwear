'use client'
import { useEffect, useState } from 'react'

interface Resumen {
  totalStock: number
  totalRezagadas: number
  totalSalidas: number
  skusActivos: number
  solicitudesPendientes: number
}

interface StockItem {
  codigo_sku: string
  nombre_prenda: string
  categoria: string
  talla: string
  stock: number
  nombre_coleccion: string
}

interface Rezagada {
  codigo_sku: string
  nombre_prenda: string
  talla: string
  stock: number
  nombre_coleccion: string
}

interface Salida {
  id_salida: string
  fecha_salida: string
  cantidad: number
  observacion: string | null
  sku: { codigo_sku: string; talla: string; prenda: { nombre: string } }
  usuario: { nombre: string }
}

interface Solicitud {
  id_solicitud: string
  fecha_solicitud: string
  estado: string
  proveedor: { nombre: string }
}

type Tab = 'stock' | 'rezagadas' | 'salidas' | 'solicitudes'

export default function ReportesPage() {
  const [loading, setLoading]       = useState(true)
  const [resumen, setResumen]       = useState<Resumen | null>(null)
  const [stockActual, setStockActual] = useState<StockItem[]>([])
  const [rezagadas, setRezagadas]   = useState<Rezagada[]>([])
  const [salidas, setSalidas]       = useState<Salida[]>([])
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [tab, setTab]               = useState<Tab>('stock')
  const [busqueda, setBusqueda]     = useState('')

  useEffect(() => {
    fetch('/api/reportes')
      .then(r => r.json())
      .then(d => {
        setResumen(d.resumen)
        setStockActual(d.stockActual)
        setRezagadas(d.rezagadas)
        setSalidas(d.salidas)
        setSolicitudes(d.solicitudes)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Filtros por búsqueda
  const stockFiltrado = stockActual.filter(i =>
    i.nombre_prenda?.toLowerCase().includes(busqueda.toLowerCase()) ||
    i.codigo_sku?.toLowerCase().includes(busqueda.toLowerCase()) ||
    i.categoria?.toLowerCase().includes(busqueda.toLowerCase())
  )
  const rezagadasFiltradas = rezagadas.filter(i =>
    i.nombre_prenda?.toLowerCase().includes(busqueda.toLowerCase()) ||
    i.codigo_sku?.toLowerCase().includes(busqueda.toLowerCase())
  )
  const salidasFiltradas = salidas.filter(i =>
    i.sku?.prenda?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    i.sku?.codigo_sku?.toLowerCase().includes(busqueda.toLowerCase()) ||
    i.usuario?.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  )
  const solicitudesFiltradas = solicitudes.filter(i =>
    i.proveedor?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    i.estado?.toLowerCase().includes(busqueda.toLowerCase())
  )

  if (loading) return (
    <div style={{ padding: '80px', textAlign: 'center' }}>
      <p style={{ color: '#3f3f46', fontSize: '13px', letterSpacing: '3px' }}>CARGANDO REPORTES...</p>
    </div>
  )

  return (
    <div>
      {/* Encabezado */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff' }}>Reportes</h2>
        <p style={{ fontSize: '14px', color: '#52525b', marginTop: '4px' }}>
          Visión general del inventario, movimientos y estado de solicitudes
        </p>
      </div>

      {/* Tarjetas resumen */}
      {resumen && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Unidades en bodega',     value: resumen.totalStock,             color: '#ffffff' },
            { label: 'SKUs activos',            value: resumen.skusActivos,            color: '#a1a1aa' },
            { label: 'Unidades rezagadas',      value: resumen.totalRezagadas,         color: '#f59e0b' },
            { label: 'Unidades despachadas',    value: resumen.totalSalidas,           color: '#ef4444' },
            { label: 'Solicitudes pendientes',  value: resumen.solicitudesPendientes,  color: '#22c55e' },
          ].map(c => (
            <div key={c.label} style={{
              backgroundColor: '#18181b', border: '1px solid #27272a',
              borderRadius: '12px', padding: '20px',
            }}>
              <p style={{ fontSize: '11px', color: '#52525b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                {c.label}
              </p>
              <p style={{ fontSize: '32px', fontWeight: '700', color: c.color }}>{c.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Buscador */}
      <div style={{ marginBottom: '20px' }}>
        <input
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar por prenda, SKU, usuario..."
          style={{
            width: '100%', maxWidth: '400px',
            backgroundColor: '#18181b', border: '1px solid #27272a',
            borderRadius: '8px', padding: '10px 16px',
            fontSize: '14px', color: '#ffffff', outline: 'none',
          }}
        />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', backgroundColor: '#18181b', padding: '4px', borderRadius: '10px', width: 'fit-content', border: '1px solid #27272a' }}>
        {([
          { key: 'stock',       label: 'Stock Activo' },
          { key: 'rezagadas',   label: 'Rezagadas' },
          { key: 'salidas',     label: 'Salidas' },
          { key: 'solicitudes', label: 'Solicitudes' },
        ] as { key: Tab; label: string }[]).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '8px 20px', borderRadius: '7px', border: 'none', cursor: 'pointer',
            fontSize: '13px', fontWeight: tab === t.key ? '600' : '400',
            backgroundColor: tab === t.key ? '#ffffff' : 'transparent',
            color: tab === t.key ? '#09090b' : '#71717a',
            transition: 'all 0.15s',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Contenido por tab */}
      <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', overflow: 'hidden' }}>

        {/* ── STOCK ACTIVO ── */}
        {tab === 'stock' && (
          <>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #27272a' }}>
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>
                Stock en colección activa
                <span style={{ marginLeft: '10px', color: '#52525b', fontWeight: '400' }}>({stockFiltrado.length} SKUs)</span>
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '12px 24px', borderBottom: '1px solid #27272a' }}>
              {['Prenda', 'Categoría', 'SKU', 'Talla', 'Stock'].map(h => (
                <p key={h} style={{ fontSize: '11px', color: '#52525b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</p>
              ))}
            </div>
            {stockFiltrado.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <p style={{ color: '#3f3f46', fontSize: '14px' }}>Sin resultados</p>
              </div>
            ) : stockFiltrado.map((item, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                alignItems: 'center', padding: '14px 24px', borderBottom: '1px solid #1c1c1f',
              }}>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>{item.nombre_prenda}</p>
                <p style={{ fontSize: '12px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.categoria}</p>
                <p style={{ fontSize: '12px', color: '#52525b', fontFamily: 'monospace' }}>{item.codigo_sku}</p>
                <p style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff' }}>{item.talla}</p>
                <p style={{
                  fontSize: '16px', fontWeight: '700',
                  color: item.stock > 10 ? '#22c55e' : item.stock > 0 ? '#f59e0b' : '#ef4444'
                }}>
                  {item.stock}
                </p>
              </div>
            ))}
          </>
        )}

        {/* ── REZAGADAS ── */}
        {tab === 'rezagadas' && (
          <>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #27272a' }}>
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>
                Prendas rezagadas
                <span style={{ marginLeft: '10px', color: '#52525b', fontWeight: '400' }}>
                  SKUs con stock en colecciones inactivas ({rezagadasFiltradas.length})
                </span>
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '12px 24px', borderBottom: '1px solid #27272a' }}>
              {['Prenda', 'SKU / Talla', 'Colección', 'Stock rezagado'].map(h => (
                <p key={h} style={{ fontSize: '11px', color: '#52525b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</p>
              ))}
            </div>
            {rezagadasFiltradas.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <p style={{ color: '#3f3f46', fontSize: '14px' }}>No hay prendas rezagadas ✓</p>
              </div>
            ) : rezagadasFiltradas.map((item, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr',
                alignItems: 'center', padding: '14px 24px', borderBottom: '1px solid #1c1c1f',
              }}>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>{item.nombre_prenda}</p>
                <div>
                  <p style={{ fontSize: '12px', color: '#52525b', fontFamily: 'monospace' }}>{item.codigo_sku}</p>
                  <p style={{ fontSize: '13px', fontWeight: '700', color: '#a1a1aa', marginTop: '2px' }}>Talla {item.talla}</p>
                </div>
                <p style={{ fontSize: '13px', color: '#71717a' }}>{item.nombre_coleccion}</p>
                <p style={{ fontSize: '16px', fontWeight: '700', color: '#f59e0b' }}>{item.stock}</p>
              </div>
            ))}
          </>
        )}

        {/* ── SALIDAS ── */}
        {tab === 'salidas' && (
          <>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #27272a' }}>
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>
                Últimas 50 salidas de bodega
                <span style={{ marginLeft: '10px', color: '#52525b', fontWeight: '400' }}>({salidasFiltradas.length})</span>
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 2fr', padding: '12px 24px', borderBottom: '1px solid #27272a' }}>
              {['Prenda', 'SKU / Talla', 'Cantidad', 'Responsable', 'Fecha'].map(h => (
                <p key={h} style={{ fontSize: '11px', color: '#52525b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</p>
              ))}
            </div>
            {salidasFiltradas.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <p style={{ color: '#3f3f46', fontSize: '14px' }}>Sin resultados</p>
              </div>
            ) : salidasFiltradas.map(s => (
              <div key={s.id_salida} style={{
                display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 2fr',
                alignItems: 'center', padding: '14px 24px', borderBottom: '1px solid #1c1c1f',
              }}>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>{s.sku?.prenda?.nombre ?? '—'}</p>
                <div>
                  <p style={{ fontSize: '12px', color: '#52525b', fontFamily: 'monospace' }}>{s.sku?.codigo_sku}</p>
                  <p style={{ fontSize: '13px', fontWeight: '700', color: '#ffffff', marginTop: '2px' }}>Talla {s.sku?.talla}</p>
                </div>
                <p style={{ fontSize: '20px', fontWeight: '700', color: '#ef4444' }}>-{s.cantidad}</p>
                <p style={{ fontSize: '13px', color: '#a1a1aa' }}>{s.usuario?.nombre ?? '—'}</p>
                <div>
                  <p style={{ fontSize: '12px', color: '#71717a' }}>
                    {new Date(s.fecha_salida).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                  {s.observacion && (
                    <p style={{ fontSize: '11px', color: '#52525b', marginTop: '3px', fontStyle: 'italic' }}>"{s.observacion}"</p>
                  )}
                </div>
              </div>
            ))}
          </>
        )}

        {/* ── SOLICITUDES ── */}
        {tab === 'solicitudes' && (
          <>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #27272a' }}>
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>
                Historial de solicitudes a proveedor
                <span style={{ marginLeft: '10px', color: '#52525b', fontWeight: '400' }}>({solicitudesFiltradas.length})</span>
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '12px 24px', borderBottom: '1px solid #27272a' }}>
              {['Proveedor', 'Fecha', 'Estado'].map(h => (
                <p key={h} style={{ fontSize: '11px', color: '#52525b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</p>
              ))}
            </div>
            {solicitudesFiltradas.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <p style={{ color: '#3f3f46', fontSize: '14px' }}>Sin resultados</p>
              </div>
            ) : solicitudesFiltradas.map(s => (
              <div key={s.id_solicitud} style={{
                display: 'grid', gridTemplateColumns: '2fr 1fr 1fr',
                alignItems: 'center', padding: '14px 24px', borderBottom: '1px solid #1c1c1f',
              }}>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>{s.proveedor?.nombre ?? '—'}</p>
                <p style={{ fontSize: '13px', color: '#71717a' }}>
                  {new Date(s.fecha_solicitud).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
                <EstadoBadge estado={s.estado} />
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}

function EstadoBadge({ estado }: { estado: string }) {
  const config: Record<string, { bg: string; color: string; border: string; label: string }> = {
    pendiente:           { bg: '#1c1003', color: '#f59e0b', border: '#78350f', label: 'PENDIENTE'  },
    recibido_parcial:    { bg: '#1c1003', color: '#fb923c', border: '#7c2d12', label: 'PARCIAL'    },
    recibido_completo:   { bg: '#052e16', color: '#22c55e', border: '#166534', label: 'COMPLETO'   },
  }
  const c = config[estado] ?? { bg: '#18181b', color: '#71717a', border: '#27272a', label: estado.toUpperCase() }
  return (
    <span style={{
      fontSize: '11px', padding: '3px 10px', borderRadius: '999px', fontWeight: '600',
      backgroundColor: c.bg, color: c.color, border: `1px solid ${c.border}`,
    }}>
      {c.label}
    </span>
  )
}
