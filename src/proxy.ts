import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rutas públicas — no requieren sesión
  if (
    pathname === '/login' ||
    pathname.startsWith('/api/auth/') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  const session = request.cookies.get('inv_session')?.value

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
