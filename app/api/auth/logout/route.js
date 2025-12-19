import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * NAMED EXPORT: POST
 * Next.js requires specific HTTP verb exports for API routes.
 */
export async function POST() {
  const cookieStore = await cookies();

  // Standard practice: Clear the cookie by setting it to empty with an immediate expiry
  cookieStore.set('admin_token', '', { 
    maxAge: 0,
    path: '/' 
  });

  return NextResponse.json({ 
    success: true, 
    message: 'Session terminated' 
  });
}