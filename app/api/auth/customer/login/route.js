import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/lib/mongodb";
import { authCookies, signToken } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import Customer from "@/models/Customer";

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    const cleanEmail = email?.trim().toLowerCase();
    await dbConnect();
    const customer = await Customer.findOne({ email: cleanEmail }).select("+passwordHash");

    if (!customer || !(await verifyPassword(password || "", customer.passwordHash))) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = await signToken({
      sub: customer._id.toString(),
      role: "customer",
      name: customer.name,
      email: customer.email,
    });
    const cookieStore = await cookies();
    cookieStore.set(authCookies.customer, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return NextResponse.json({ customer: { name: customer.name, email: customer.email } });
  } catch (error) {
    console.error("CUSTOMER_LOGIN_ERROR:", error);
    return NextResponse.json({ error: "Unable to sign in" }, { status: 500 });
  }
}
