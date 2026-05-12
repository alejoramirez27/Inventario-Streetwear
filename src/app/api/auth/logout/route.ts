import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ ok: true })
  response.cookies.delete('inv_session')
  // doble garantía — sobreescribe con expiración inmediata
  response.cookies.set('inv_session', '', {
    path: '/',
    maxAge: 0,
    expires: new Date(0),
    sameSite: 'lax',
    httpOnly: false,
  })
  return response
}
