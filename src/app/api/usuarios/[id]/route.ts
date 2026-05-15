import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// PATCH /api/usuarios/:id → actualizar rol, estado o contraseña
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServiceClient()
  const { id }   = await params
  const body     = await request.json()

  const campos: Record<string, unknown> = {}
  if (body.rol    !== undefined) campos.rol    = body.rol
  if (body.estado !== undefined) campos.estado = body.estado
  if (body.nombre !== undefined) campos.nombre = body.nombre
  if (body.contrasena !== undefined) campos.contrasena_hash = body.contrasena

  const { data, error } = await supabase
    .from('usuario')
    .update(campos)
    .eq('id_usuario', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}
