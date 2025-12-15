import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function middleware(request) {
  // 1. Get the path
  const path = request.nextUrl.pathname;

  // 2. Define protected paths
  const isProtectedPath = path.startsWith('/admin');
  const isProtectedApi = path.startsWith('/api/menu') && ['POST', 'PUT', 'DELETE'].includes(request.method);
  const isProtectedCategoryApi = path.startsWith('/api/categories') && ['POST', 'DELETE'].includes(request.method);

  // 3. Check for token if path is protected
  if (isProtectedPath || isProtectedApi || isProtectedCategoryApi) {
    const token = request.cookies.get('admin_token')?.value;
    const session = token ? await verifyToken(token) : null;

    if (!session) {
      // If trying to access API, return JSON error
      if (path.startsWith('/api')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      // If trying to access Page, redirect to Login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

// Optimize middleware to only run on relevant paths
export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};