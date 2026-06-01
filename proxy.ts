import { NextRequest, NextResponse } from 'next/server'

export function proxy(req: NextRequest) {
  const hasToken = req.cookies.has('sakan_token')

  if (!hasToken) {
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = '/auth'
    loginUrl.searchParams.set('redirect', req.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/espace-client/:path*', '/admin/:path*'],
}
