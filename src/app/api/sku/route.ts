import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// GET /api/sku?id_prenda=xxx → SKUs de una prenda específica
export async function GET(request: Request) {
  const supabase = createServiceClient()
  const { searchParams } = new URL(request.url)
  const id_prenda = searchParams.get('id_prenda')

  let query = supabase
    .from('sku')
    .select('*')
    .order('talla')

  if (id_prenda) {
    query = query.eq('id_prenda', id_prenda)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/sku → crear nuevo SKU
export async function POST(request: Request) {
  const supabase = createServiceClient()
  const body = await request.json()

  const { data, error } = await supabase
    .from('sku')
    .insert([{
      id_prenda:   body.id_prenda,
      codigo_sku:  body.codigo_sku,
      talla:       body.talla,
      stock:       0,
      stock_inicial: 0,
    }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}