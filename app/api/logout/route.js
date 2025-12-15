import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  // FIX: Await cookies() here
  (await cookies()).delete('admin_token');
  
  return NextResponse.json({ success: true });
}