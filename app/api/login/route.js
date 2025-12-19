// import { NextResponse } from 'next/server';
// import { signToken } from '@/lib/auth';
// import { cookies } from 'next/headers';

// const ADMIN_USER = process.env.ADMIN_USERNAME;
// const ADMIN_PASS = process.env.ADMIN_PASSWORD;
// const IS_PROD = process.env.NODE_ENV === 'production';

// export async function POST(request) {
//   try {
//     // 1. Structural Check: Ensure environment is ready
//     if (!ADMIN_USER || !ADMIN_PASS) {
//       console.error("[AUTH_CRITICAL] Missing admin credentials in environment.");
//       return NextResponse.json({ error: 'Auth service unavailable' }, { status: 503 });
//     }

//     const { username, password } = await request.json();

//     // 2. Constant-time comparison (Basic version)
//     // In a high-security context, we'd use crypto.timingSafeEqual
//     if (username === ADMIN_USER && password === ADMIN_PASS) {
//       const token = await signToken({ 
//         sub: 'admin', // Subject identifier
//         iat: Math.floor(Date.now() / 1000) 
//       });

//       const cookieStore = await cookies();

//       // 3. Set Secure Cookie
//       cookieStore.set('admin_token', token, {
//         httpOnly: true,     // Prevents XSS from reading the token
//         secure: IS_PROD,    // Only send over HTTPS in production
//         sameSite: 'lax',    // Balanced protection against CSRF while allowing redirects
//         maxAge: 60 * 60 * 24, // 24 hours
//         path: '/',
//       });

//       return NextResponse.json({ success: true });
//     }

//     return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

//   } catch (error) {
//     console.error("LOGIN_HANDLING_ERROR:", error);
//     return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
//   }
// }