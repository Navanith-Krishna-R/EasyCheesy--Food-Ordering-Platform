import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const isAdminPath = pathname.startsWith("/admin");
  const isWriteAction = ["POST", "PUT", "DELETE"].includes(request.method);
  const isProtectedApi =
    isWriteAction &&
    (pathname.startsWith("/api/menu") ||
      pathname.startsWith("/api/categories"));

  if (!isAdminPath && !isProtectedApi) {
    return NextResponse.next();
  }

  const token = request.cookies.get("admin_token")?.value;
  const verified = token ? await verifyToken(token) : null;

  if (!verified) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/menu/:path*",
    "/api/categories/:path*",
  ],
};
