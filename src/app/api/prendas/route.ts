import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// GET /api/prendas → lista todas las prendas con su colección
export async function GET() {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('prenda')
    .select('*, coleccion(nombre, estado)')
    .order('nombre')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/prendas → registra una nueva prenda
export async function POST(request: Request) {
  const supabase = createServiceClient()
  const body = await request.json()

  const { data, error } = await supabase
    .from('prenda')
    .insert([{
      id_coleccion: body.id_coleccion,
      nombre: body.nombre,
      categoria: body.categoria,
      subcategoria: body.subcategoria
    }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}