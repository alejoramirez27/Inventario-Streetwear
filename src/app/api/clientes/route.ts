import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// GET /api/clientes
export async function GET() {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('cliente')
    .select('*')
    .order('nombre')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/clientes
export async function POST(request: Request) {
  const supabase = createServiceClient()
  const body = await request.json()

  const { data, error } = await supabase
    .from('cliente')
    .insert([{
      nombre:       body.nombre,
      ciudad:       body.ciudad,
      departamento: body.departamento ?? null,
      telefono:     body.telefono    ?? null,
      email:        body.email       ?? null,
      estado:       'activo',
    }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}
