import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// PATCH /api/detalles/:id → registrar llegada de mercancía (modo incremental)
// Recibe { incremento: number } — la cantidad que llegó en este envío.
// La suma acumulada (cantidad_recibida + incremento) se guarda en la BD.
// El trigger de Supabase compara con cantidad_solicitada y actualiza estado + stock.
// Aquí también actualizamos stock_inicial con el mismo incremento.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServiceClient()
  const { id }   = await params
  const body     = await request.json()

  const incremento = Number(body.incremento)
  if (!incremento || incremento <= 0) {
    return NextResponse.json({ error: 'El incremento debe ser mayor a 0' }, { status: 400 })
  }

  // 1. Leer el detalle actual para sumar el incremento y obtener id_sku
  const { data: actual, error: errActual } = await supabase
    .from('detalle_solicitud')
    .select('id_sku, cantidad_recibida, cantidad_solicitada')
    .eq('id_detalle', id)
    .single()

  if (errActual || !actual) {
    return NextResponse.json({ error: 'Detalle no encontrado' }, { status: 404 })
  }

  const nuevaCantidad = Number(actual.cantidad_recibida) + incremento

  // 2. Actualizar cantidad_recibida con el acumulado (trigger actualiza stock y estado)
  const { data, error } = await supabase
    .from('detalle_solicitud')
    .update({ cantidad_recibida: nuevaCantidad })
    .eq('id_detalle', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // 3. Actualizar stock_inicial sumando el mismo incremento
  const { data: skuData } = await supabase
    .from('sku')
    .select('stock_inicial')
    .eq('id_sku', actual.id_sku)
    .single()

  if (skuData) {
    await supabase
      .from('sku')
      .update({ stock_inicial: skuData.stock_inicial + incremento })
      .eq('id_sku', actual.id_sku)
  }

  return NextResponse.json(data)
}
