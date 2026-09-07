import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authCookies } from "@/lib/auth";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set(authCookies.customer, "", { maxAge: 0, path: "/" });
  return NextResponse.json({ success: true });
}
