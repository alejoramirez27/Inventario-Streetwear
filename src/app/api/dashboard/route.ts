import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createServiceClient()

  // 1. Colección activa
  const { data: coleccionActiva } = await supabase
    .from('coleccion')
    .select('*')
    .eq('estado', 'activa')
    .single()

  // 2. Total de SKUs con stock > 0 en colección activa
  const { count: totalSkusActivos } = await supabase
    .from('stock_actual')
    .select('*', { count: 'exact', head: true })
    .eq('estado_coleccion', 'activa')
    .gt('stock', 0)

  // 3. Total de unidades en bodega (colección activa)
  const { data: stockData } = await supabase
    .from('stock_actual')
    .select('stock')
    .eq('estado_coleccion', 'activa')

  const totalUnidades = stockData?.reduce((sum, item) => sum + item.stock, 0) ?? 0

  // 4. Solicitudes pendientes
  const { count: solicitudesPendientes } = await supabase
    .from('solicitud_proveedor')
    .select('*', { count: 'exact', head: true })
    .eq('estado', 'pendiente')

  // 5. Prendas rezagadas (colecciones inactivas con stock > 0)
  const { count: prendasRezagadas } = await supabase
    .from('prendas_rezagadas')
    .select('*', { count: 'exact', head: true })

  // 6. Últimas 5 entradas del inventario activo
  const { data: stockReciente } = await supabase
    .from('stock_actual')
    .select('*')
    .eq('estado_coleccion', 'activa')
    .gt('stock', 0)
    .limit(8)

  return NextResponse.json({
    coleccionActiva,
    totalSkusActivos: totalSkusActivos ?? 0,
    totalUnidades,
    solicitudesPendientes: solicitudesPendientes ?? 0,
    prendasRezagadas: prendasRezagadas ?? 0,
    stockReciente: stockReciente ?? [],
  })
}