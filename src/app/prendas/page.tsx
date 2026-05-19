'use client'
import { useEffect, useState } from 'react'
import { toast }    from 'sonner'
import { Button }   from '@/components/ui/button'
import { Badge }    from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface Prenda {
  id_prenda:    string
  id_coleccion: string
  nombre:       string
  categoria:    'ROPA' | 'ACCESORIOS'
  subcategoria: string
  estado:       'activa' | 'inactiva'
  coleccion:    { nombre: string; estado: string }
}
interface SKU {
  id_sku: string; id_prenda: string
  codigo_sku: string; talla: string
  stock: number; stock_inicial: number
}

export default function PrendasPage() {
  const [prendas, setPrendas]     = useState<Prenda[]>([])
  const [loading, setLoading]     = useState(true)
  const [expandida, setExpandida] = useState<string | null>(null)
  const [skus, setSkus]           = useState<Record<string, SKU[]>>({})

  const cargarPrendas = () => {
    setLoading(true)
    fetch('/api/prendas').then(r => r.json()).then(d => { setPrendas(d); setLoading(false) })
  }

  useEffect(() => { cargarPrendas() }, [])

  const cargarSkus = (id: string) => {
    fetch(`/api/sku?id_prenda=${id}`).then(r => r.json()).then(d => setSkus(p => ({ ...p, [id]: d })))
  }

  const togglePrenda = (id: string) => {
    if (expandida === id) { setExpandida(null) }
    else { setExpandida(id); if (!skus[id]) cargarSkus(id) }
  }

  const toggleEstado = async (prenda: Prenda) => {
    const nuevoEstado = prenda.estado === 'activa' ? 'inactiva' : 'activa'
    const res  = await fetch(`/api/prendas/${prenda.id_prenda}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: nuevoEstado }),
    })
    const data = await res.json()
    if (!res.ok) toast.error(data.error ?? 'Error al cambiar estado')
    else {
      toast.success(nuevoEstado === 'activa'
        ? `"${prenda.nombre}" activada`
        : `"${prenda.nombre}" desactivada`)
      cargarPrendas()
    }
  }

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff' }}>Prendas</h2>
        <p style={{ fontSize: '12px', color: '#52525b', marginTop: '4px' }}>
          Catálogo de prendas y sus variantes por talla (SKU) — se registran automáticamente al recibir solicitudes
        </p>
      </div>

      {/* ── Tabla ── */}
      <div style={{ backgroundColor: '#111113', border: '1px solid #27272a', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 22px', borderBottom: '1px solid #27272a' }}>
          <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>
            Todas las prendas{' '}
            <span style={{ color: '#52525b', fontWeight: '400' }}>({prendas.length})</span>
          </h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1c1c1f' }}>
                {['', 'Prenda', 'Categoría', 'Colección', 'Estado colección', 'Estado prenda'].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={6} style={{ padding: '10px 22px' }}>
                    <Skeleton style={{ height: '14px', borderRadius: '4px' }} />
                  </td>
                </tr>
              ))}

              {!loading && prendas.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#3f3f46', fontSize: '13px' }}>
                    No hay prendas registradas
                  </td>
                </tr>
              )}

              {!loading && prendas.map(prenda => (
                <>
                  {/* ── Fila prenda ── */}
                  <tr
                    key={prenda.id_prenda}
                    onClick={() => togglePrenda(prenda.id_prenda)}
                    style={{
                      borderBottom: expandida === prenda.id_prenda ? 'none' : '1px solid #1c1c1f',
                      cursor: 'pointer',
                      backgroundColor: expandida === prenda.id_prenda ? '#18181b' : 'transparent',
                      opacity: prenda.estado === 'inactiva' ? 0.45 : 1,
                      transition: 'background-color 0.1s',
                    }}
                    onMouseEnter={e => { if (expandida !== prenda.id_prenda) e.currentTarget.style.backgroundColor = '#16161a' }}
                    onMouseLeave={e => { if (expandida !== prenda.id_prenda) e.currentTarget.style.backgroundColor = expandida === prenda.id_prenda ? '#18181b' : 'transparent' }}
                  >
                    {/* Chevron */}
                    <td style={{ padding: '13px 0 13px 22px', width: '36px', color: '#3f3f46' }}>
                      {expandida === prenda.id_prenda
                        ? <ChevronDown style={{ width: '14px', height: '14px' }} />
                        : <ChevronRight style={{ width: '14px', height: '14px' }} />
                      }
                    </td>
                    {/* Nombre */}
                    <td style={{ padding: '13px 22px' }}>
                      <p style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>{prenda.nombre}</p>
                      <p style={{ fontSize: '11px', color: '#52525b', marginTop: '2px' }}>{prenda.subcategoria}</p>
                    </td>
                    {/* Categoría */}
                    <td style={{ padding: '13px 22px' }}>
                      <Badge variant="secondary">{prenda.categoria}</Badge>
                    </td>
                    {/* Colección */}
                    <td style={{ padding: '13px 22px', fontSize: '12px', color: '#71717a' }}>
                      {prenda.coleccion?.nombre ?? '—'}
                    </td>
                    {/* Estado colección */}
                    <td style={{ padding: '13px 22px' }}>
                      <Badge variant={prenda.coleccion?.estado === 'activa' ? 'success' : 'secondary'}>
                        {prenda.coleccion?.estado?.toUpperCase() ?? '—'}
                      </Badge>
                    </td>
                    {/* Estado prenda */}
                    <td style={{ padding: '13px 22px' }} onClick={e => e.stopPropagation()}>
                      <Button
                        variant={prenda.estado === 'activa' ? 'destructive' : 'outline'}
                        size="sm"
                        onClick={() => toggleEstado(prenda)}
                      >
                        {prenda.estado === 'activa' ? 'Desactivar' : 'Activar'}
                      </Button>
                    </td>
                  </tr>

                  {/* ── SKUs expandidos ── */}
                  {expandida === prenda.id_prenda && (
                    <tr key={`${prenda.id_prenda}-skus`}>
                      <td colSpan={6} style={{ backgroundColor: '#0d0d0f', borderBottom: '1px solid #27272a', padding: '0' }}>
                        <div style={{ padding: '16px 48px 20px' }}>
                          <p style={{ fontSize: '10px', color: '#3f3f46', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>
                            Variantes por talla (SKU)
                          </p>
                          {!skus[prenda.id_prenda] ? (
                            <p style={{ color: '#3f3f46', fontSize: '12px' }}>Cargando SKUs…</p>
                          ) : skus[prenda.id_prenda].length === 0 ? (
                            <p style={{ color: '#3f3f46', fontSize: '12px' }}>Sin SKUs — se registrarán al recibir la solicitud del proveedor</p>
                          ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                              <thead>
                                <tr style={{ borderBottom: '1px solid #1c1c1f' }}>
                                  {['Código SKU', 'Talla', 'Stock actual', 'Stock inicial'].map(h => (
                                    <th key={h} style={thStyle}>{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {skus[prenda.id_prenda].map(sku => (
                                  <tr key={sku.id_sku} style={{ borderBottom: '1px solid #1c1c1f' }}>
                                    <td style={{ padding: '10px 22px', fontSize: '11px', color: '#52525b', fontFamily: 'var(--font-mono)' }}>{sku.codigo_sku}</td>
                                    <td style={{ padding: '10px 22px' }}>
                                      <span style={{ backgroundColor: '#1c1c1f', color: '#71717a', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                                        {sku.talla}
                                      </span>
                                    </td>
                                    <td style={{ padding: '10px 22px' }}>
                                      <span style={{ fontSize: '15px', fontWeight: '700', fontFamily: 'var(--font-mono)', color: sku.stock === 0 ? '#3f3f46' : sku.stock <= 5 ? '#c8922a' : '#22c55e' }}>
                                        {sku.stock}
                                      </span>
                                    </td>
                                    <td style={{ padding: '10px 22px', fontSize: '12px', color: '#52525b', fontFamily: 'var(--font-mono)' }}>{sku.stock_inicial}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const thStyle: React.CSSProperties = {
  padding: '10px 22px', textAlign: 'left',
  fontSize: '10px', color: '#3f3f46', fontWeight: '500',
  textTransform: 'uppercase', letterSpacing: '1.5px', whiteSpace: 'nowrap',
}
