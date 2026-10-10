import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { ROLE_COOKIE } from '@/lib/role-cookie';

function isAdminOnlyPath(pathname: string) {
  return pathname.startsWith('/admin');
}

function isStorePath(pathname: string) {
  if (pathname === '/') return true;
  return ['/products', '/cart', '/checkout', '/orders', '/profile'].some((path) =>
    pathname.startsWith(path)
  );
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isAdmin = request.cookies.get(ROLE_COOKIE)?.value === 'ADMIN';

  if (isAdminOnlyPath(pathname) && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isAdmin) {
    const allowed =
      pathname.startsWith('/admin') ||
      pathname.startsWith('/api') ||
      pathname.startsWith('/login');
    if (!allowed) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  if (isAdminOnlyPath(pathname) && user && !isAdmin) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const isProtectedPath = ['/profile', '/orders', '/checkout'].some((path) =>
    pathname.startsWith(path)
  );

  if (isProtectedPath && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL(isAdmin ? '/admin' : '/', request.url));
  }

  if (user && isAdmin && isStorePath(pathname)) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
