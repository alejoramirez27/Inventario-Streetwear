import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// PATCH /api/clientes/[id] → editar cliente
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createServiceClient()
  const body = await request.json()

  const { data, error } = await supabase
    .from('cliente')
    .update({
      nombre:       body.nombre,
      ciudad:       body.ciudad,
      departamento: body.departamento ?? null,
      telefono:     body.telefono    ?? null,
      email:        body.email       ?? null,
      estado:       body.estado,
    })
    .eq('id_cliente', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}
