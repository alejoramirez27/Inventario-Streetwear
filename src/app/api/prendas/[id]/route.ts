import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// PATCH /api/prendas/:id → cambiar estado (activa / inactiva)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServiceClient()
  const { id }   = await params
  const body     = await request.json()

  const { data, error } = await supabase
    .from('prenda')
    .update({ estado: body.estado })
    .eq('id_prenda', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}
