import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// POST /api/detalles
// Recibe: { id_solicitud, nombre_prenda, categoria, subcategoria, codigo_sku, talla, cantidad_solicitada }
// Crea automáticamente la prenda y el SKU si no existen, luego crea el detalle.
export async function POST(request: Request) {
  const supabase = createServiceClient()
  const body = await request.json()

  const {
    id_solicitud,
    nombre_prenda,
    categoria,
    subcategoria,
    codigo_sku,
    talla,
    cantidad_solicitada,
  } = body

  if (!id_solicitud || !nombre_prenda || !categoria || !codigo_sku || !talla || !cantidad_solicitada) {
    return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
  }

  // ── 1. Obtener la colección de la solicitud ──────────────
  const { data: solicitud, error: errSol } = await supabase
    .from('solicitud_proveedor')
    .select('id_coleccion')
    .eq('id_solicitud', id_solicitud)
    .single()

  if (errSol || !solicitud) {
    return NextResponse.json({ error: 'Solicitud no encontrada' }, { status: 404 })
  }

  // ── 2. Buscar o crear la prenda ──────────────────────────
  let { data: prenda } = await supabase
    .from('prenda')
    .select('id_prenda')
    .eq('nombre', nombre_prenda)
    .eq('id_coleccion', solicitud.id_coleccion)
    .maybeSingle()

  if (!prenda) {
    const { data: nueva, error: errPrenda } = await supabase
      .from('prenda')
      .insert([{
        id_coleccion: solicitud.id_coleccion,
        nombre:       nombre_prenda,
        categoria:    categoria,
        subcategoria: subcategoria || categoria,
      }])
      .select('id_prenda')
      .single()

    if (errPrenda) {
      return NextResponse.json({ error: 'Error al crear prenda: ' + errPrenda.message }, { status: 400 })
    }
    prenda = nueva
  }

  // ── 3. Buscar o crear el SKU ─────────────────────────────
  let { data: sku } = await supabase
    .from('sku')
    .select('id_sku')
    .eq('codigo_sku', codigo_sku)
    .maybeSingle()

  if (!sku) {
    const { data: nuevoSku, error: errSku } = await supabase
      .from('sku')
      .insert([{
        id_prenda:     prenda.id_prenda,
        codigo_sku:    codigo_sku,
        talla:         talla,
        stock:         0,
        stock_inicial: 0,
      }])
      .select('id_sku')
      .single()

    if (errSku) {
      return NextResponse.json({ error: 'Error al crear SKU: ' + errSku.message }, { status: 400 })
    }
    sku = nuevoSku
  }

  // ── 4. Crear el detalle de solicitud ─────────────────────
  const { data, error } = await supabase
    .from('detalle_solicitud')
    .insert([{
      id_solicitud:        id_solicitud,
      id_sku:              sku.id_sku,
      cantidad_solicitada: Number(cantidad_solicitada),
      cantidad_recibida:   0,
      estado_verificacion: 'pendiente',
    }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}
