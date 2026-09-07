import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/lib/mongodb";
import { authCookies, signToken } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import Customer from "@/models/Customer";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();
    const cleanName = name?.trim();
    const cleanEmail = email?.trim().toLowerCase();

    if (!cleanName || !emailPattern.test(cleanEmail || "")) {
      return NextResponse.json({ error: "Enter a valid name and email" }, { status: 400 });
    }
    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    await dbConnect();
    if (await Customer.exists({ email: cleanEmail })) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const customer = await Customer.create({
      name: cleanName,
      email: cleanEmail,
      passwordHash: await hashPassword(password),
    });
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

    return NextResponse.json({ customer: { name: customer.name, email: customer.email } }, { status: 201 });
  } catch (error) {
    if (error?.code === 11000) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }
    console.error("CUSTOMER_SIGNUP_ERROR:", error);
    return NextResponse.json({ error: "Unable to create account" }, { status: 500 });
  }
}
