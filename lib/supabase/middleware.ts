import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/lib/supabase/database.types';

function isProtectedAdminPath(pathname: string) {
  const isAdminLogin = pathname === '/admin/login';
  const isAdminRoute =
    pathname === '/admin' ||
    pathname.startsWith('/admin/') ||
    pathname.startsWith('/api/admin/');

  return { isAdminRoute, isAdminLogin, isPublicAdminPath: isAdminLogin };
}

function misconfiguredAdminResponse(pathname: string) {
  if (pathname.startsWith('/api/admin/')) {
    return NextResponse.json(
      { error: 'Server misconfigured. Missing Supabase environment variables.' },
      { status: 503 },
    );
  }

  return new NextResponse(
    'Application misconfigured. Set Supabase environment variables before using admin.',
    { status: 503 },
  );
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;
  const { isAdminRoute, isPublicAdminPath } = isProtectedAdminPath(pathname);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    if (isAdminRoute && !isPublicAdminPath) {
      return misconfiguredAdminResponse(pathname);
    }

    return supabaseResponse;
  }

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        supabaseResponse = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  async function getIsAdmin() {
    if (!user) {
      return false;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    return profile?.role === 'admin';
  }

  if (isAdminRoute && !isPublicAdminPath) {
    const isAdmin = await getIsAdmin();

    if (!user || !isAdmin) {
      if (pathname.startsWith('/api/admin/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/admin/login';
      redirectUrl.searchParams.set(
        'redirect',
        `${pathname}${request.nextUrl.search}`,
      );
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (isPublicAdminPath && user && (await getIsAdmin())) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/admin';
    redirectUrl.search = '';
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}
