import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// PATCH /api/detalles/:id → registrar cantidad recibida
// El trigger de Supabase actualiza `stock`. Aquí también actualizamos `stock_inicial`
// sumando el delta (nueva cantidad - cantidad anterior) para que refleje el total recibido.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServiceClient()
  const { id }   = await params
  const body     = await request.json()

  // 1. Leer detalle actual para calcular el delta y obtener id_sku
  const { data: actual } = await supabase
    .from('detalle_solicitud')
    .select('id_sku, cantidad_recibida')
    .eq('id_detalle', id)
    .single()

  // 2. Actualizar cantidad_recibida (el trigger de BD actualiza stock)
  const { data, error } = await supabase
    .from('detalle_solicitud')
    .update({ cantidad_recibida: body.cantidad_recibida })
    .eq('id_detalle', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // 3. Actualizar stock_inicial sumando el mismo delta que recibió el stock
  if (actual) {
    const delta = Number(body.cantidad_recibida) - Number(actual.cantidad_recibida)
    if (delta > 0) {
      // Leer stock_inicial actual del SKU y sumar el delta
      const { data: skuData } = await supabase
        .from('sku')
        .select('stock_inicial')
        .eq('id_sku', actual.id_sku)
        .single()

      if (skuData) {
        await supabase
          .from('sku')
          .update({ stock_inicial: skuData.stock_inicial + delta })
          .eq('id_sku', actual.id_sku)
      }
    }
  }

  return NextResponse.json(data)
}
