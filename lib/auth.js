import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

// Runtime check: Prevents the server from starting in a compromised state
if (!process.env.JWT_SECRET) {
  throw new Error('AUTH_ERR: JWT_SECRET is not defined in environment variables.');
}

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
const TOKEN_NAME = 'admin_token';

export async function signToken(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(SECRET);
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload;
  } catch (error) {
    // Distinguish between expired vs. tampered tokens in logs if needed
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_NAME)?.value;
  return token ? verifyToken(token) : null;
}