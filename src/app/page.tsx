'use client'
import { useEffect, useState } from 'react'

interface DashboardData {
  coleccionActiva: { nombre: string; temporada: string } | null
  totalSkusActivos: number
  totalUnidades: number
  solicitudesPendientes: number
  prendasRezagadas: number
  stockReciente: {
    id_sku: string
    codigo_sku: string
    nombre_prenda: string
    categoria: string
    talla: string
    stock: number
    stock_inicial: number
  }[]
}

function StatCard({
  label,
  value,
  sublabel,
  accent = '#ffffff',
}: {
  label: string
  value: string | number
  sublabel: string
  accent?: string
}) {
  return (
    <div style={{
      backgroundColor: '#18181b',
      border: '1px solid #27272a',
      borderTop: `3px solid ${accent}`,
      borderRadius: '12px',
      padding: '24px',
      flex: 1,
      minWidth: '200px',
    }}>
      <p style={{
        fontSize: '11px', color: '#71717a', textTransform: 'uppercase',
        letterSpacing: '2px', fontWeight: '600', marginBottom: '12px',
      }}>
        {label}
      </p>
      <p style={{
        fontSize: '40px', fontWeight: '800', color: '#ffffff',
        lineHeight: 1, marginBottom: '10px',
      }}>
        {value}
      </p>
      <p style={{
        fontSize: '12px',
        color: accent !== '#ffffff' && accent !== '#a1a1aa' && accent !== '#52525b'
          ? accent : '#52525b',
        fontWeight: accent !== '#ffffff' && accent !== '#a1a1aa' && accent !== '#52525b'
          ? '600' : '400',
      }}>
        {sublabel}
      </p>
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData]       = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(d => { setData(d); setLoading(false) })
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <p style={{ color: '#52525b', letterSpacing: '3px', fontSize: '13px' }}>CARGANDO...</p>
      </div>
    )
  }

  return (
    <div>

      {/* Título */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.5px' }}>
          Dashboard
        </h2>
        <p style={{ fontSize: '14px', color: '#71717a', marginTop: '4px' }}>
          Resumen general del inventario en bodega
        </p>
      </div>

      {/* Banner colección activa */}
      <div style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #e4e4e7 100%)',
        borderRadius: '14px',
        padding: '24px 32px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <p style={{ fontSize: '10px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '6px' }}>
            Colección Activa
          </p>
          <p style={{ fontSize: '24px', fontWeight: '800', color: '#09090b', letterSpacing: '-0.5px' }}>
            {data?.coleccionActiva?.nombre ?? 'Sin colección activa'}
          </p>
          {data?.coleccionActiva?.temporada && (
            <p style={{ fontSize: '13px', color: '#71717a', marginTop: '6px' }}>
              Temporada: {data.coleccionActiva.temporada}
            </p>
          )}
        </div>
        <div style={{
          backgroundColor: '#09090b',
          color: '#ffffff',
          padding: '6px 18px',
          borderRadius: '999px',
          fontSize: '11px',
          fontWeight: '700',
          letterSpacing: '2px',
        }}>
          ACTIVA
        </div>
      </div>

      {/* Tarjetas de métricas */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <StatCard
          label="SKUs en Bodega"
          value={data?.totalSkusActivos ?? 0}
          sublabel="Referencias con stock disponible"
          accent="#ffffff"
        />
        <StatCard
          label="Unidades Totales"
          value={data?.totalUnidades ?? 0}
          sublabel="Prendas físicas en bodega"
          accent="#a1a1aa"
        />
        <StatCard
          label="Solicitudes Pendientes"
          value={data?.solicitudesPendientes ?? 0}
          sublabel="Pedidos sin recibir"
          accent={data?.solicitudesPendientes ? '#f59e0b' : '#52525b'}
        />
        <StatCard
          label="Prendas Rezagadas"
          value={data?.prendasRezagadas ?? 0}
          sublabel="De colecciones anteriores"
          accent={data?.prendasRezagadas ? '#f59e0b' : '#52525b'}
        />
      </div>

      {/* Tabla stock activo */}
      <div style={{
        backgroundColor: '#18181b',
        border: '1px solid #27272a',
        borderRadius: '12px',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '20px 28px',
          borderBottom: '1px solid #27272a',
          backgroundColor: '#1c1c1f',
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#ffffff' }}>
            Stock — Colección Activa
          </h3>
          <p style={{ fontSize: '12px', color: '#52525b', marginTop: '4px' }}>
            Primeras 8 referencias con stock disponible
          </p>
        </div>

        {data?.stockReciente.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <p style={{ color: '#3f3f46', fontSize: '14px' }}>
              No hay stock registrado en la colección activa
            </p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #27272a' }}>
                {['SKU', 'Prenda', 'Categoría', 'Talla', 'Stock', 'Inicial'].map(h => (
                  <th key={h} style={{
                    padding: '12px 24px', textAlign: 'left',
                    fontSize: '11px', color: '#52525b',
                    fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data?.stockReciente.map((item, i) => (
                <tr key={item.id_sku} style={{
                  borderBottom: i < (data.stockReciente.length - 1) ? '1px solid #1c1c1f' : 'none',
                }}>
                  <td style={{ padding: '14px 24px', fontSize: '12px', color: '#71717a', fontFamily: 'monospace' }}>
                    {item.codigo_sku}
                  </td>
                  <td style={{ padding: '14px 24px', fontSize: '14px', color: '#ffffff', fontWeight: '600' }}>
                    {item.nombre_prenda}
                  </td>
                  <td style={{ padding: '14px 24px' }}>
                    <span style={{
                      fontSize: '11px', padding: '3px 10px', borderRadius: '999px',
                      backgroundColor: '#27272a', color: '#a1a1aa',
                      border: '1px solid #3f3f46', fontWeight: '600',
                    }}>
                      {item.categoria}
                    </span>
                  </td>
                  <td style={{ padding: '14px 24px' }}>
                    <span style={{
                      fontSize: '13px', fontWeight: '700', color: '#ffffff',
                      backgroundColor: '#27272a', padding: '4px 10px', borderRadius: '6px',
                    }}>
                      {item.talla}
                    </span>
                  </td>
                  <td style={{ padding: '14px 24px' }}>
                    <span style={{
                      fontSize: '15px', fontWeight: '800',
                      color: item.stock <= 5 ? '#ef4444' : '#22c55e',
                    }}>
                      {item.stock}
                    </span>
                  </td>
                  <td style={{ padding: '14px 24px', fontSize: '13px', color: '#52525b' }}>
                    {item.stock_inicial}
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
