import { NextResponse } from 'next/server';
import { signToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    // Read from environment variables
    const validUser = process.env.ADMIN_USERNAME;
    const validPass = process.env.ADMIN_PASSWORD;

    // Safety check: Ensure env vars are actually set
    if (!validUser || !validPass) {
      console.error("❌ ADMIN_USERNAME or ADMIN_PASSWORD not set in .env.local");
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    if (username === validUser && password === validPass) {
      
      // Use the actual username in the token, not the password or hardcoded string
      const token = await signToken({ role: 'admin', username: validUser });

      const cookieStore = await cookies();

      cookieStore.set('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 1 day
        path: '/',
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}