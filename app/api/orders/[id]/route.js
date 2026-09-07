import mongoose from "mongoose";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import Order from "@/models/Order";

export async function PATCH(request, { params }) {
  const admin = await getSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
  }

  const { status } = await request.json();
  if (!["approved", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Invalid order status" }, { status: 400 });
  }

  await dbConnect();
  const order = await Order.findByIdAndUpdate(id, { $set: { status } }, { new: true }).lean();
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json({ order });
}
