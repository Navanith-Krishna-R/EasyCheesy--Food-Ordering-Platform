import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Define protection rules
  const isAdminPath = pathname.startsWith('/admin');
  const isWriteAction = ['POST', 'PUT', 'DELETE'].includes(request.method);
  
  const isProtectedApi = isWriteAction && (
    pathname.startsWith('/api/menu') || 
    pathname.startsWith('/api/categories')
  );

  // Early exit if route doesn't require auth
  if (!isAdminPath && !isProtectedApi) {
    return NextResponse.next();
  }

  const token = request.cookies.get('admin_token')?.value;
  const verified = token ? await verifyToken(token) : null;

  if (!verified) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Construct login URL with a 'callback' query to improve UX
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Explicitly exclude static files and images to save compute cycles
  matcher: [
    '/admin/:path*',
    '/api/menu/:path*',
    '/api/categories/:path*'
  ],
};