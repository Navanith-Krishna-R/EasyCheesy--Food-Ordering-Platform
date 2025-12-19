// import { NextResponse } from 'next/server';
// import { cookies } from 'next/headers';

// export async function POST() {
//   const cookieStore = await cookies();
  
//   // Explicitly clear the cookie by setting maxAge to 0
//   // This is more reliable across different browsers than just .delete()
//   cookieStore.set('admin_token', '', { 
//     maxAge: 0,
//     path: '/' 
//   });
  
//   return NextResponse.json({ success: true, message: 'Logged out' });
// }