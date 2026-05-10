import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// GET /api/solicitudes/:id → solicitud con sus detalles
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServiceClient()
  const { id } = await params

  const { data, error } = await supabase
    .from('detalle_solicitud')
    .select(`
      *,
      sku:id_sku(codigo_sku, talla, stock,
        prenda:id_prenda(nombre, categoria)
      )
    `)
    .eq('id_solicitud', id)
    .order('id_detalle')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}