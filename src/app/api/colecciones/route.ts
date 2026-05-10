import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// GET /api/colecciones → lista todas las colecciones
export async function GET() {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('coleccion')
    .select('*')
    .order('fecha_lanzamiento', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/colecciones → crea una nueva colección
export async function POST(request: Request) {
  const supabase = createServiceClient()
  const body = await request.json()

  const { data, error } = await supabase
    .from('coleccion')
    .insert([{
      nombre: body.nombre,
      temporada: body.temporada,
      fecha_lanzamiento: body.fecha_lanzamiento,
      estado: body.estado ?? 'inactiva'
    }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}