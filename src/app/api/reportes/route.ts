import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createServiceClient()

  // 1. Stock actual por colección activa
  const { data: stockActual } = await supabase
    .from('stock_actual')
    .select('*')
    .eq('estado_coleccion', 'activa')
    .order('stock', { ascending: false })

  // 2. Prendas rezagadas (colecciones inactivas con stock > 0)
  const { data: rezagadas } = await supabase
    .from('prendas_rezagadas')
    .select('*')
    .order('stock', { ascending: false })

  // 3. Historial completo de salidas
  const { data: salidas } = await supabase
    .from('salida_bodega')
    .select(`
      *,
      sku:id_sku(codigo_sku, talla, prenda:id_prenda(nombre, categoria)),
      usuario:id_usuario(nombre)
    `)
    .order('fecha_salida', { ascending: false })
    .limit(50)

  // 4. Solicitudes por estado
  const { data: solicitudes } = await supabase
    .from('solicitud_proveedor')
    .select(`*, proveedor:id_proveedor(nombre)`)
    .order('fecha_solicitud', { ascending: false })

  // 5. Resumen general
  const totalStock = stockActual?.reduce((sum, i) => sum + (i.stock ?? 0), 0) ?? 0
  const totalRezagadas = rezagadas?.reduce((sum, i) => sum + (i.stock ?? 0), 0) ?? 0
  const totalSalidas = salidas?.reduce((sum, i) => sum + (i.cantidad ?? 0), 0) ?? 0

  return NextResponse.json({
    stockActual:   stockActual   ?? [],
    rezagadas:     rezagadas     ?? [],
    salidas:       salidas       ?? [],
    solicitudes:   solicitudes   ?? [],
    resumen: {
      totalStock,
      totalRezagadas,
      totalSalidas,
      skusActivos:       stockActual?.length ?? 0,
      solicitudesPendientes: solicitudes?.filter(s => s.estado === 'pendiente').length ?? 0,
    }
  })
}
