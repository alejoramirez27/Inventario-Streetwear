import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const { email, password } = await request.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email y contraseña requeridos' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { data: user, error } = await supabase
    .from('usuario')
    .select('id_usuario, nombre, rol, contrasena_hash, estado')
    .eq('email', email)
    .eq('estado', 'activo')
    .single()

  if (error || !user) {
    return NextResponse.json({ error: 'Usuario no encontrado o inactivo' }, { status: 401 })
  }

  if (user.contrasena_hash !== password) {
    return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 })
  }

  const sessionData = JSON.stringify({
    id:     user.id_usuario,
    nombre: user.nombre,
    rol:    user.rol,
  })

  const response = NextResponse.json({ ok: true, rol: user.rol })
  response.cookies.set('inv_session', sessionData, {
    httpOnly: false,   // legible en cliente para mostrar nombre/rol en Sidebar
    path: '/',
    maxAge: 60 * 60 * 8, // 8 horas
    sameSite: 'lax',
  })

  return response
}
