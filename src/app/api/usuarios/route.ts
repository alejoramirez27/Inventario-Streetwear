import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('usuario')
    .select('id_usuario, nombre, rol, estado')
    .eq('estado', 'activo')
    .order('nombre')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = createServiceClient()
  const body = await request.json()
  const { data, error } = await supabase
    .from('usuario')
    .insert([{
      nombre:          body.nombre,
      email:           body.email,
      contrasena_hash: body.contrasena ?? '---',
      rol:             body.rol ?? 'bodeguero',
      estado:          'activo',
    }])
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}