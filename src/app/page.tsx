'use client'
import { useEffect, useState } from 'react'

// ── Tipos ──────────────────────────────────────────────
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

// ── Componente tarjeta de resumen ──────────────────────
function StatCard({
  label,
  value,
  sublabel,
  color = '#ffffff',
}: {
  label: string
  value: string | number
  sublabel?: string
  color?: string
}) {
  return (
    <div style={{
      backgroundColor: '#18181b',
      border: '1px solid #27272a',
      borderRadius: '12px',
      padding: '24px',
      flex: 1,
      minWidth: '200px',
    }}>
      <p style={{ fontSize: '12px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>
        {label}
      </p>
      <p style={{ fontSize: '32px', fontWeight: '700', color, lineHeight: 1 }}>
        {value}
      </p>
      {sublabel && (
        <p style={{ fontSize: '12px', color: '#52525b', marginTop: '8px' }}>
          {sublabel}
        </p>
      )}
    </div>
  )
}

// ── Página principal ───────────────────────────────────
export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(d => {
        setData(d)
        setLoading(false)
      })
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

      {/* Título de la página */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff' }}>Dashboard</h2>
        <p style={{ fontSize: '14px', color: '#52525b', marginTop: '4px' }}>
          Resumen general del inventario en bodega
        </p>
      </div>

      {/* Colección activa — banner */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '20px 28px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <p style={{ fontSize: '11px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '2px' }}>
            Colección Activa
          </p>
          <p style={{ fontSize: '22px', fontWeight: '700', color: '#09090b', marginTop: '2px' }}>
            {data?.coleccionActiva?.nombre ?? 'Sin colección activa'}
          </p>
          {data?.coleccionActiva?.temporada && (
            <p style={{ fontSize: '13px', color: '#71717a', marginTop: '2px' }}>
              Temporada: {data.coleccionActiva.temporada}
            </p>
          )}
        </div>
        <div style={{
          backgroundColor: '#09090b',
          color: '#ffffff',
          padding: '6px 16px',
          borderRadius: '999px',
          fontSize: '12px',
          fontWeight: '600',
          letterSpacing: '1px',
        }}>
          ACTIVA
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <StatCard
          label="SKUs en Bodega"
          value={data?.totalSkusActivos ?? 0}
          sublabel="Referencias con stock disponible"
        />
        <StatCard
          label="Unidades Totales"
          value={data?.totalUnidades ?? 0}
          sublabel="Prendas físicas en bodega"
        />
        <StatCard
          label="Solicitudes Pendientes"
          value={data?.solicitudesPendientes ?? 0}
          sublabel="Pedidos sin recibir"
          color={data?.solicitudesPendientes ? '#f59e0b' : '#ffffff'}
        />
        <StatCard
          label="Prendas Rezagadas"
          value={data?.prendasRezagadas ?? 0}
          sublabel="De colecciones anteriores"
          color={data?.prendasRezagadas ? '#f59e0b' : '#ffffff'}
        />
      </div>

      {/* Tabla de stock reciente */}
      <div style={{
        backgroundColor: '#18181b',
        border: '1px solid #27272a',
        borderRadius: '12px',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #27272a' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff' }}>
            Stock — Colección Activa
          </h3>
          <p style={{ fontSize: '12px', color: '#52525b', marginTop: '2px' }}>
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
                    padding: '12px 24px',
                    textAlign: 'left',
                    fontSize: '11px',
                    color: '#52525b',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data?.stockReciente.map((item, i) => (
                <tr
                  key={item.id_sku}
                  style={{
                    borderBottom: i < (data.stockReciente.length - 1) ? '1px solid #1c1c1f' : 'none',
                  }}
                >
                  <td style={{ padding: '14px 24px', fontSize: '13px', color: '#a1a1aa', fontFamily: 'monospace' }}>
                    {item.codigo_sku}
                  </td>
                  <td style={{ padding: '14px 24px', fontSize: '14px', color: '#ffffff', fontWeight: '500' }}>
                    {item.nombre_prenda}
                  </td>
                  <td style={{ padding: '14px 24px' }}>
                    <span style={{
                      fontSize: '11px',
                      padding: '3px 10px',
                      borderRadius: '999px',
                      backgroundColor: item.categoria === 'ROPA' ? '#1c1c1f' : '#27272a',
                      color: '#a1a1aa',
                      border: '1px solid #27272a',
                    }}>
                      {item.categoria}
                    </span>
                  </td>
                  <td style={{ padding: '14px 24px', fontSize: '14px', color: '#ffffff', fontWeight: '600' }}>
                    {item.talla}
                  </td>
                  <td style={{ padding: '14px 24px' }}>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '700',
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
