'use client'
import { useEffect, useState } from 'react'

interface Coleccion {
  id_coleccion: string
  nombre: string
  temporada: string
  fecha_lanzamiento: string
  estado: 'activa' | 'inactiva'
}

// ── Componente badge de estado ─────────────────────────
function EstadoBadge({ estado }: { estado: string }) {
  const activa = estado === 'activa'
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 12px',
      borderRadius: '999px',
      fontSize: '12px',
      fontWeight: '600',
      backgroundColor: activa ? '#14532d' : '#1c1c1f',
      color: activa ? '#22c55e' : '#71717a',
      border: `1px solid ${activa ? '#166534' : '#27272a'}`,
    }}>
      <span style={{
        width: '6px', height: '6px',
        borderRadius: '50%',
        backgroundColor: activa ? '#22c55e' : '#52525b',
      }} />
      {activa ? 'ACTIVA' : 'INACTIVA'}
    </span>
  )
}

// ── Página principal ───────────────────────────────────
export default function ColeccionesPage() {
  const [colecciones, setColecciones] = useState<Coleccion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const [mostrarForm, setMostrarForm] = useState(false)

  // Estado del formulario
  const [form, setForm] = useState({
    nombre: '',
    temporada: '',
    fecha_lanzamiento: '',
    estado: 'inactiva',
  })
  const [guardando, setGuardando] = useState(false)

  // ── Cargar colecciones ─────────────────────────────
  const cargarColecciones = () => {
    setLoading(true)
    fetch('/api/colecciones')
      .then(res => res.json())
      .then(data => {
        setColecciones(data)
        setLoading(false)
      })
  }

  useEffect(() => { cargarColecciones() }, [])

  // ── Crear colección ────────────────────────────────
  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault()
    setGuardando(true)
    setError('')

    const res = await fetch('/api/colecciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
    } else {
      setExito('Colección creada correctamente')
      setForm({ nombre: '', temporada: '', fecha_lanzamiento: '', estado: 'inactiva' })
      setMostrarForm(false)
      cargarColecciones()
      setTimeout(() => setExito(''), 3000)
    }
    setGuardando(false)
  }

  // ── Activar colección ──────────────────────────────
  const handleActivar = async (coleccion: Coleccion) => {
    if (coleccion.estado === 'activa') return
    setError('')

    const res = await fetch(`/api/colecciones/${coleccion.id_coleccion}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...coleccion, estado: 'activa' }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
    } else {
      setExito(`"${coleccion.nombre}" activada correctamente`)
      cargarColecciones()
      setTimeout(() => setExito(''), 3000)
    }
  }

  // ── Eliminar colección ─────────────────────────────
  const handleEliminar = async (coleccion: Coleccion) => {
    if (!confirm(`¿Eliminar la colección "${coleccion.nombre}"?`)) return
    setError('')

    const res = await fetch(`/api/colecciones/${coleccion.id_coleccion}`, {
      method: 'DELETE',
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
    } else {
      setExito('Colección eliminada')
      cargarColecciones()
      setTimeout(() => setExito(''), 3000)
    }
  }

  // ── Render ─────────────────────────────────────────
  return (
    <div>

      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff' }}>Colecciones</h2>
          <p style={{ fontSize: '14px', color: '#52525b', marginTop: '4px' }}>
            Gestiona las colecciones de la tienda — solo puede haber una activa a la vez
          </p>
        </div>
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          style={{
            backgroundColor: '#ffffff',
            color: '#09090b',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 20px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          {mostrarForm ? 'Cancelar' : '+ Nueva Colección'}
        </button>
      </div>

      {/* Mensajes de error / éxito */}
      {error && (
        <div style={{
          backgroundColor: '#1c0a0a',
          border: '1px solid #7f1d1d',
          borderRadius: '8px',
          padding: '14px 18px',
          marginBottom: '20px',
          color: '#ef4444',
          fontSize: '14px',
        }}>
          ⚠ {error}
        </div>
      )}
      {exito && (
        <div style={{
          backgroundColor: '#052e16',
          border: '1px solid #166534',
          borderRadius: '8px',
          padding: '14px 18px',
          marginBottom: '20px',
          color: '#22c55e',
          fontSize: '14px',
        }}>
          ✓ {exito}
        </div>
      )}

      {/* Formulario de nueva colección */}
      {mostrarForm && (
        <div style={{
          backgroundColor: '#18181b',
          border: '1px solid #27272a',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '20px', color: '#ffffff' }}>
            Nueva Colección
          </h3>
          <form onSubmit={handleCrear}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>

              {/* Nombre */}
              <div>
                <label style={{ fontSize: '12px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>
                  Nombre *
                </label>
                <input
                  required
                  value={form.nombre}
                  onChange={e => setForm({ ...form, nombre: e.target.value })}
                  placeholder="ej: Colección Otoño 2025"
                  style={inputStyle}
                />
              </div>

              {/* Temporada */}
              <div>
                <label style={{ fontSize: '12px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>
                  Temporada *
                </label>
                <input
                  required
                  value={form.temporada}
                  onChange={e => setForm({ ...form, temporada: e.target.value })}
                  placeholder="ej: Otoño-Invierno 2025"
                  style={inputStyle}
                />
              </div>

              {/* Fecha lanzamiento */}
              <div>
                <label style={{ fontSize: '12px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>
                  Fecha de Lanzamiento
                </label>
                <input
                  type="date"
                  value={form.fecha_lanzamiento}
                  onChange={e => setForm({ ...form, fecha_lanzamiento: e.target.value })}
                  style={inputStyle}
                />
              </div>

              {/* Estado inicial */}
              <div>
                <label style={{ fontSize: '12px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>
                  Estado Inicial
                </label>
                <select
                  value={form.estado}
                  onChange={e => setForm({ ...form, estado: e.target.value })}
                  style={inputStyle}
                >
                  <option value="inactiva">Inactiva</option>
                  <option value="activa">Activa</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={guardando}
              style={{
                backgroundColor: '#ffffff',
                color: '#09090b',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 24px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: guardando ? 'not-allowed' : 'pointer',
                opacity: guardando ? 0.6 : 1,
              }}
            >
              {guardando ? 'Guardando...' : 'Crear Colección'}
            </button>
          </form>
        </div>
      )}

      {/* Tabla de colecciones */}
      <div style={{
        backgroundColor: '#18181b',
        border: '1px solid #27272a',
        borderRadius: '12px',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #27272a' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff' }}>
            Todas las colecciones
            <span style={{ marginLeft: '10px', fontSize: '13px', color: '#52525b', fontWeight: '400' }}>
              ({colecciones.length})
            </span>
          </h3>
        </div>

        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <p style={{ color: '#3f3f46', fontSize: '13px', letterSpacing: '2px' }}>CARGANDO...</p>
          </div>
        ) : colecciones.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <p style={{ color: '#3f3f46', fontSize: '14px' }}>No hay colecciones registradas</p>
            <p style={{ color: '#27272a', fontSize: '12px', marginTop: '8px' }}>Crea la primera usando el botón de arriba</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #27272a' }}>
                {['Nombre', 'Temporada', 'Lanzamiento', 'Estado', 'Acciones'].map(h => (
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
              {colecciones.map((col, i) => (
                <tr
                  key={col.id_coleccion}
                  style={{ borderBottom: i < colecciones.length - 1 ? '1px solid #1c1c1f' : 'none' }}
                >
                  <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>
                    {col.nombre}
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '13px', color: '#a1a1aa' }}>
                    {col.temporada || '—'}
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '13px', color: '#a1a1aa' }}>
                    {col.fecha_lanzamiento
                      ? new Date(col.fecha_lanzamiento).toLocaleDateString('es-CO')
                      : '—'}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <EstadoBadge estado={col.estado} />
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {/* Botón activar */}
                      {col.estado === 'inactiva' && (
                        <button
                          onClick={() => handleActivar(col)}
                          style={{
                            backgroundColor: 'transparent',
                            border: '1px solid #27272a',
                            borderRadius: '6px',
                            padding: '6px 14px',
                            fontSize: '12px',
                            color: '#a1a1aa',
                            cursor: 'pointer',
                            fontWeight: '500',
                          }}
                        >
                          Activar
                        </button>
                      )}
                      {/* Botón eliminar */}
                      <button
                        onClick={() => handleEliminar(col)}
                        style={{
                          backgroundColor: 'transparent',
                          border: '1px solid #27272a',
                          borderRadius: '6px',
                          padding: '6px 14px',
                          fontSize: '12px',
                          color: '#ef4444',
                          cursor: 'pointer',
                          fontWeight: '500',
                        }}
                      >
                        Eliminar
                      </button>
                    </div>
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