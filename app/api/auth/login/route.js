import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';

export async function POST(req) {
  const { username, password } = await req.json();

  // Simple Admin Check (In production, check against DB hash)
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD_HASH) {
    
    // Create JWT
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const alg = 'HS256';
    const jwt = await new SignJWT({ role: 'admin' })
      .setProtectedHeader({ alg })
      .setExpirationTime('24h')
      .sign(secret);

    const response = NextResponse.json({ success: true });
    
    // Set HttpOnly Cookie
    response.cookies.set('admin_token', jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });

    return response;
  }

  return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
}