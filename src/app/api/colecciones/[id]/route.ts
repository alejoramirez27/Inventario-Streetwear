import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// PUT /api/colecciones/:id → actualizar (activar/desactivar)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServiceClient()
  const { id } = await params
  const body = await request.json()

  const { data, error } = await supabase
    .from('coleccion')
    .update({
      nombre: body.nombre,
      temporada: body.temporada,
      fecha_lanzamiento: body.fecha_lanzamiento,
      estado: body.estado,
    })
    .eq('id_coleccion', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

// DELETE /api/colecciones/:id → eliminar (trigger bloquea si tiene stock)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServiceClient()
  const { id } = await params

  const { error } = await supabase
    .from('coleccion')
    .delete()
    .eq('id_coleccion', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ message: 'Colección eliminada correctamente' })
}