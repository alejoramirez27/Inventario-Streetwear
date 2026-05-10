import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// POST /api/detalles → agregar ítem a una solicitud
export async function POST(request: Request) {
  const supabase = createServiceClient()
  const body = await request.json()

  const { data, error } = await supabase
    .from('detalle_solicitud')
    .insert([{
      id_solicitud:       body.id_solicitud,
      id_sku:             body.id_sku,
      cantidad_solicitada: body.cantidad_solicitada,
      cantidad_recibida:  0,
      estado_verificacion: 'pendiente',
    }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}