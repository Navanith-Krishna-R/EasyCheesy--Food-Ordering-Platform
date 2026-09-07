import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/auth";

export async function GET() {
  const session = await getCustomerSession();
  if (!session || session.role !== "customer") {
    return NextResponse.json({ customer: null });
  }
  return NextResponse.json({
    customer: { name: session.name, email: session.email },
  });
}
