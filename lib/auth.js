import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);

export async function signToken(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secretKey);
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function getSession() {
  // FIX: Await cookies() here
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) return null;
  return await verifyToken(token);
}