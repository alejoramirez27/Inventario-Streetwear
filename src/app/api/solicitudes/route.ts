import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('solicitud_proveedor')
    .select(`
      *,
      proveedor:id_proveedor(nombre),
      coleccion:id_coleccion(nombre),
      usuario:id_usuario(nombre)
    `)
    .order('fecha_solicitud', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = createServiceClient()
  const body = await request.json()
  const { data, error } = await supabase
    .from('solicitud_proveedor')
    .insert([{
      id_proveedor: body.id_proveedor,
      id_coleccion: body.id_coleccion,
      id_usuario:   body.id_usuario,
      estado:       'pendiente',
    }])
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}