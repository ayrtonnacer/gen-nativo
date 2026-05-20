import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/admin', '/etapas', '/lotes', '/cambiar-password']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // If user is not logged in and trying to access protected route, redirect to login
  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // If user is logged in, check their profile for admin routes and password change
  if (user && isProtectedRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('rol, debe_cambiar_password')
      .eq('id', user.id)
      .single()

    // If user must change password and is not on the change password page, redirect
    if (profile?.debe_cambiar_password && !pathname.startsWith('/cambiar-password')) {
      const url = request.nextUrl.clone()
      url.pathname = '/cambiar-password'
      return NextResponse.redirect(url)
    }

    // If user is on change password page but doesn't need to change, redirect to dashboard
    if (!profile?.debe_cambiar_password && pathname.startsWith('/cambiar-password')) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }

    // Admin routes require admin role
    if (pathname.startsWith('/admin') && profile?.rol !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  // If user is logged in and on login page, redirect to dashboard
  if (user && pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
