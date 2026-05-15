'use client'
import { useEffect, useState } from 'react'
import { toast }    from 'sonner'
import { Button }   from '@/components/ui/button'
import { Badge }    from '@/components/ui/badge'
import { Input }    from '@/components/ui/input'
import { Label }    from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, ChevronDown, ChevronRight, Trash2 } from 'lucide-react'

interface Prenda {
  id_prenda:   string
  id_coleccion: string
  nombre:      string
  categoria:   'ROPA' | 'ACCESORIOS'
  subcategoria: string
  coleccion:   { nombre: string; estado: string }
}
interface SKU {
  id_sku: string; id_prenda: string
  codigo_sku: string; talla: string
  stock: number; stock_inicial: number
}

const subcategorias = {
  ROPA:       ['Camiseta Oversize', 'Camiseta Slim Fit', 'Hoodie', 'Chaqueta', 'Sudadera', 'Jean', 'Short'],
  ACCESORIOS: ['Gorra', 'Underwear'],
}
const tallas = {
  ROPA:       ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  ACCESORIOS: ['Única', 'S/M', 'M/L', 'L/XL'],
}

export default function PrendasPage() {
  const [prendas, setPrendas]         = useState<Prenda[]>([])
  const [loading, setLoading]         = useState(true)
  const [expandida, setExpandida]     = useState<string | null>(null)
  const [skus, setSkus]               = useState<Record<string, SKU[]>>({})
  const [mostrarFormSku, setMostrarFormSku] = useState<string | null>(null)

  const [formSku, setFormSku] = useState({ codigo_sku: '', talla: '' })

  const cargarPrendas = () => {
    setLoading(true)
    fetch('/api/prendas').then(r => r.json()).then(d => { setPrendas(d); setLoading(false) })
  }

  useEffect(() => {
    cargarPrendas()
  }, [])

  const cargarSkus = (id: string) => {
    fetch(`/api/sku?id_prenda=${id}`).then(r => r.json()).then(d => setSkus(p => ({ ...p, [id]: d })))
  }

  const togglePrenda = (id: string) => {
    if (expandida === id) { setExpandida(null) }
    else { setExpandida(id); if (!skus[id]) cargarSkus(id) }
  }

  const handleCrearSku = async (e: React.FormEvent, id_prenda: string) => {
    e.preventDefault()
    const res  = await fetch('/api/sku', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...formSku, id_prenda }) })
    const data = await res.json()
    if (!res.ok) toast.error(data.error ?? 'Error al agregar SKU')
    else {
      toast.success('SKU agregado correctamente')
      setFormSku({ codigo_sku: '', talla: '' }); setMostrarFormSku(null); cargarSkus(id_prenda)
    }
  }

  const handleEliminar = async (prenda: Prenda) => {
    if (!confirm(`¿Eliminar "${prenda.nombre}"?`)) return
    const res  = await fetch(`/api/prendas/${prenda.id_prenda}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) toast.error(data.error ?? 'Error al eliminar')
    else { toast.success('Prenda eliminada'); cargarPrendas() }
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

      {/* ── Lista de prendas ── */}
      <div style={{ backgroundColor: '#111113', border: '1px solid #27272a', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 22px', borderBottom: '1px solid #27272a' }}>
          <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>
            Todas las prendas{' '}
            <span style={{ color: '#52525b', fontWeight: '400' }}>({prendas.length})</span>
          </h3>
        </div>

        {loading ? (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} style={{ height: '56px', borderRadius: '6px' }} />)}
          </div>
        ) : prendas.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#3f3f46', fontSize: '13px' }}>
            No hay prendas registradas
          </div>
        ) : (
          prendas.map(prenda => (
            <div key={prenda.id_prenda}>
              {/* ── Fila prenda ── */}
              <div
                onClick={() => togglePrenda(prenda.id_prenda)}
                style={{
                  display: 'grid', gridTemplateColumns: '28px 2fr auto 1fr auto auto',
                  alignItems: 'center', gap: '12px', padding: '14px 22px',
                  borderBottom: '1px solid #1c1c1f', cursor: 'pointer',
                  backgroundColor: expandida === prenda.id_prenda ? '#18181b' : 'transparent',
                  transition: 'background-color 0.1s',
                }}
                onMouseEnter={e => { if (expandida !== prenda.id_prenda) e.currentTarget.style.backgroundColor = '#16161a' }}
                onMouseLeave={e => { if (expandida !== prenda.id_prenda) e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                {/* Chevron */}
                <span style={{ color: '#3f3f46' }}>
                  {expandida === prenda.id_prenda
                    ? <ChevronDown style={{ width: '14px', height: '14px' }} />
                    : <ChevronRight style={{ width: '14px', height: '14px' }} />
                  }
                </span>
                {/* Nombre */}
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>{prenda.nombre}</p>
                  <p style={{ fontSize: '11px', color: '#52525b', marginTop: '2px' }}>{prenda.subcategoria}</p>
                </div>
                {/* Categoría */}
                <Badge variant="secondary">{prenda.categoria}</Badge>
                {/* Colección */}
                <p style={{ fontSize: '12px', color: '#71717a' }}>{prenda.coleccion?.nombre ?? '—'}</p>
                {/* Estado colección */}
                <Badge variant={prenda.coleccion?.estado === 'activa' ? 'success' : 'secondary'}>
                  {prenda.coleccion?.estado?.toUpperCase() ?? '—'}
                </Badge>
                {/* Acción */}
                <div onClick={e => e.stopPropagation()}>
                  <Button variant="destructive" size="icon-sm" onClick={() => handleEliminar(prenda)}>
                    <Trash2 style={{ width: '12px', height: '12px' }} />
                  </Button>
                </div>
              </div>

              {/* ── SKUs expandidos ── */}
              {expandida === prenda.id_prenda && (
                <div style={{ backgroundColor: '#0d0d0f', borderBottom: '1px solid #27272a', padding: '18px 32px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <p style={{ fontSize: '10px', color: '#3f3f46', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '2px' }}>
                      Variantes por talla (SKU)
                    </p>
                    <Button variant="outline" size="sm"
                      onClick={() => setMostrarFormSku(mostrarFormSku === prenda.id_prenda ? null : prenda.id_prenda)}>
                      <Plus style={{ width: '12px', height: '12px' }} />
                      Agregar SKU
                    </Button>
                  </div>

                  {/* Form nuevo SKU */}
                  {mostrarFormSku === prenda.id_prenda && (
                    <form onSubmit={e => handleCrearSku(e, prenda.id_prenda)}
                      style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', marginBottom: '14px', backgroundColor: '#111113', padding: '14px', borderRadius: '8px', border: '1px solid #27272a' }}>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <Label>Código SKU *</Label>
                        <Input required value={formSku.codigo_sku} onChange={e => setFormSku({ ...formSku, codigo_sku: e.target.value })} placeholder="ej: HOD-BLK-M" />
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <Label>Talla *</Label>
                        <select required value={formSku.talla} onChange={e => setFormSku({ ...formSku, talla: e.target.value })} style={selectStyle}>
                          <option value="">Selecciona talla</option>
                          {tallas[prenda.categoria].map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <Button type="submit" size="sm">Agregar</Button>
                    </form>
                  )}

                  {/* Tabla SKUs */}
                  {!skus[prenda.id_prenda] ? (
                    <p style={{ color: '#3f3f46', fontSize: '12px' }}>Cargando SKUs…</p>
                  ) : skus[prenda.id_prenda].length === 0 ? (
                    <p style={{ color: '#3f3f46', fontSize: '12px' }}>No hay SKUs — agrega la primera talla</p>
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
                            <td style={{ padding: '10px 16px', fontSize: '11px', color: '#52525b', fontFamily: 'var(--font-mono)' }}>{sku.codigo_sku}</td>
                            <td style={{ padding: '10px 16px', fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>{sku.talla}</td>
                            <td style={{ padding: '10px 16px' }}>
                              <span style={{ fontSize: '15px', fontWeight: '700', fontFamily: 'var(--font-mono)', color: sku.stock <= 5 ? '#b84444' : '#22c55e' }}>
                                {sku.stock}
                              </span>
                            </td>
                            <td style={{ padding: '10px 16px', fontSize: '12px', color: '#52525b', fontFamily: 'var(--font-mono)' }}>{sku.stock_inicial}</td>
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
  padding: '8px 16px', textAlign: 'left',
  fontSize: '10px', color: '#3f3f46', fontWeight: '500',
  textTransform: 'uppercase', letterSpacing: '1.5px',
}

const selectStyle: React.CSSProperties = {
  width: '100%', height: '36px',
  backgroundColor: '#18181b', border: '1px solid #27272a',
  borderRadius: '6px', padding: '0 12px',
  fontSize: '13px', color: '#e4e4e7', outline: 'none',
}
