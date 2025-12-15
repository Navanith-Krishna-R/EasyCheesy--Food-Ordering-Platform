import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request) {
  const path = request.nextUrl.pathname;

  // Only protect /admin/dashboard routes
  if (path.startsWith("/admin/dashboard")) {
    const token = request.cookies.get("admin_token")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch (err) {
      // Token invalid
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/dashboard/:path*",
};
