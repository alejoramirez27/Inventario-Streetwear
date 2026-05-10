import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }  // ← ahora es Promise
) {
  const supabase = createServiceClient()
  const { id } = await params  // ← hay que hacer await

  const { error } = await supabase
    .from('prenda')
    .delete()
    .eq('id_prenda', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ message: 'Prenda eliminada correctamente' })
}
