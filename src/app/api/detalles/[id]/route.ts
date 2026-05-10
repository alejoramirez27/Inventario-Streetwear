import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// PATCH /api/detalles/:id → registrar cantidad recibida
// El trigger de Supabase se encarga del resto automáticamente
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServiceClient()
  const { id } = await params
  const body = await request.json()

  const { data, error } = await supabase
    .from('detalle_solicitud')
    .update({ cantidad_recibida: body.cantidad_recibida })
    .eq('id_detalle', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}