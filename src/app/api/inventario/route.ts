import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// GET /api/inventario → devuelve el stock actual
export async function GET(request: Request) {
  const supabase = createServiceClient()
  const { searchParams } = new URL(request.url)

  const soloActiva = searchParams.get('soloActiva')
  const soloRezagadas = searchParams.get('soloRezagadas')

  // Si piden prendas rezagadas (colecciones inactivas con stock > 0)
  if (soloRezagadas === 'true') {
    const { data, error } = await supabase
      .from('prendas_aun_en_bodega')
      .select('*')
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  // Consulta normal de stock
  let query = supabase.from('stock_actual_en_bodega').select('*')

  if (soloActiva === 'true') {
    query = query.eq('estado_coleccion', 'activa')
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}