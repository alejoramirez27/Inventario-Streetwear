import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// GET /api/salidas → historial de salidas
export async function GET() {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('salida_bodega')
    .select(`
      *,
      sku:id_sku(codigo_sku, talla,
        prenda:id_prenda(nombre, categoria)
      ),
      usuario:id_usuario(nombre)
    `)
    .order('fecha_salida', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/salidas → registra una salida de bodega (el trigger descuenta el stock)
export async function POST(request: Request) {
  const supabase = createServiceClient()
  const body = await request.json()

  const { data, error } = await supabase
    .from('salida_bodega')
    .insert([{
      id_sku:      body.id_sku,
      id_usuario:  body.id_usuario,
      cantidad:    body.cantidad,
      observacion: body.observacion ?? null,
    }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}
