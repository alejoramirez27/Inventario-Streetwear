'use client'
import { useEffect, useState } from 'react'

interface DashboardData {
  coleccionActiva:       { id_coleccion: string; nombre: string; temporada: string; fecha_lanzamiento: string } | null
  totalSkusActivos:      number
  totalUnidades:         number
  solicitudesPendientes: number
  prendasRezagadas:      number
  stockReciente:         StockItem[]
}

interface StockItem {
  id_sku:          string
  codigo_sku:      string
  nombre_prenda:   string
  talla:           string
  stock:           number
  stock_inicial:   number
  categoria:       string
  coleccion:       string
  estado_coleccion:string
}

function skuColor(stock: number) {
  if (stock === 0)   return '#b84444'
  if (stock <= 5)    return '#c8922a'
  return '#5a9e72'
}

function fmtFecha(s: string) {
  return new Date(s + 'T00:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function DashboardPage() {
  const [data, setData]       = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <p style={{ color: '#3f3f46', fontSize: '13px', letterSpacing: '2px' }}>CARGANDO…</p>
    </div>
  )

  const col = data?.coleccionActiva

  return (
    <div>
      {/* Título */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', letterSpacing: '1px' }}>
          Dashboard
        </h2>
        <p style={{ fontSize: '12px', color: '#52525b', marginTop: '4px' }}>
          Resumen del sistema en tiempo real
        </p>
      </div>

      {/* Colección activa */}
      {col && (
        <div style={{
          backgroundColor: '#18181b', border: '1px solid #27272a',
          borderRadius: '12px', padding: '18px 24px',
          marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '14px',
        }}>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            backgroundColor: '#22c55e', boxShadow: '0 0 6px #22c55e', flexShrink: 0,
          }} />
          <div>
            <p style={{ fontSize: '9px', color: '#52525b', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '2px' }}>
              Colección activa
            </p>
            <p style={{ fontSize: '15px', fontWeight: '700', color: '#ffffff' }}>{col.nombre}</p>
            <p style={{ fontSize: '11px', color: '#52525b', marginTop: '2px' }}>
              {col.temporada} · {fmtFecha(col.fecha_lanzamiento)}
            </p>
          </div>
        </div>
      )}

      {/* Métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '32px' }}>
        {[
          { label: 'Unidades en bodega', value: data?.totalUnidades ?? 0,         sub: 'Stock disponible',       color: '#ffffff' },
          { label: 'Referencias SKU',    value: data?.totalSkusActivos ?? 0,       sub: 'SKUs activos',           color: '#ffffff' },
          { label: 'Solicitudes pend.',  value: data?.solicitudesPendientes ?? 0,  sub: 'Sin procesar',           color: data?.solicitudesPendientes ? '#c8922a' : '#ffffff' },
          { label: 'Prendas rezagadas',  value: data?.prendasRezagadas ?? 0,       sub: 'Colecciones inactivas',  color: data?.prendasRezagadas ? '#b84444' : '#ffffff' },
        ].map(m => (
          <div key={m.label} style={{
            backgroundColor: '#18181b', border: '1px solid #27272a',
            borderRadius: '12px', padding: '20px',
          }}>
            <p style={{ fontSize: '11px', color: '#52525b', marginBottom: '10px', letterSpacing: '0.5px' }}>
              {m.label}
            </p>
            <p style={{ fontSize: '28px', fontWeight: '700', color: m.color, lineHeight: 1 }}>
              {m.value}
            </p>
            <p style={{ fontSize: '11px', color: '#3f3f46', marginTop: '6px' }}>{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabla stock reciente */}
      <div style={{
        backgroundColor: '#18181b', border: '1px solid #27272a',
        borderRadius: '12px', overflow: 'hidden',
      }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #27272a' }}>
          <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>
            Stock colección activa
          </h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #27272a' }}>
                {['Código SKU', 'Prenda', 'Talla', 'Stock inicial', 'Stock actual'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '10px', color: '#52525b', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data?.stockReciente ?? []).length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#3f3f46' }}>
                    Sin datos de stock
                  </td>
                </tr>
              )}
              {(data?.stockReciente ?? []).map(item => (
                <tr key={item.id_sku} style={{ borderBottom: '1px solid #1c1c1f' }}>
                  <td style={{ padding: '12px 16px', color: '#52525b', fontFamily: 'monospace', fontSize: '12px' }}>
                    {item.codigo_sku}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#e4e4e7', fontWeight: '500' }}>
                    {item.nombre_prenda}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      backgroundColor: '#27272a', color: '#a1a1aa',
                      padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace',
                    }}>
                      {item.talla}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#52525b', fontFamily: 'monospace' }}>
                    {item.stock_inicial}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      fontWeight: '700', fontSize: '14px',
                      color: skuColor(item.stock),
                    }}>
                      {item.stock}
                    </span>
                    {item.stock === 0 && (
                      <span style={{ marginLeft: '8px', fontSize: '10px', color: '#b84444' }}>AGOTADO</span>
                    )}
                    {item.stock > 0 && item.stock <= 5 && (
                      <span style={{ marginLeft: '8px', fontSize: '10px', color: '#c8922a' }}>BAJO</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
