import mongoose from "mongoose";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { getCustomerSession, getSession } from "@/lib/auth";
import MenuItem from "@/models/MenuItem";
import Order from "@/models/Order";

export async function GET() {
  try {
    await dbConnect();
    const admin = await getSession();
    if (admin) {
      const orders = await Order.find({}).sort({ createdAt: -1 }).lean();
      return NextResponse.json({ orders });
    }

    const customer = await getCustomerSession();
    if (!customer?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const orders = await Order.find({ customer: customer.sub }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ orders });
  } catch (error) {
    console.error("ORDER_LIST_ERROR:", error);
    return NextResponse.json({ error: "Unable to load orders" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const customer = await getCustomerSession();
    if (!customer?.sub || customer.role !== "customer") {
      return NextResponse.json({ error: "Sign in before placing an order" }, { status: 401 });
    }

    const { items, phone, address, note = "" } = await request.json();
    if (!Array.isArray(items) || items.length === 0 || !phone?.trim() || !address?.trim()) {
      return NextResponse.json({ error: "Cart, phone and address are required" }, { status: 400 });
    }

    const quantities = new Map();
    for (const item of items) {
      if (!mongoose.Types.ObjectId.isValid(item.id)) continue;
      const quantity = Math.min(20, Math.max(1, Number.parseInt(item.quantity, 10) || 1));
      quantities.set(item.id, quantity);
    }
    const ids = [...quantities.keys()];
    if (!ids.length) return NextResponse.json({ error: "Cart contains no valid items" }, { status: 400 });

    await dbConnect();
    const menuItems = await MenuItem.find({ _id: { $in: ids }, isVisible: true }).lean();
    if (menuItems.length !== ids.length) {
      return NextResponse.json({ error: "One or more menu items are unavailable" }, { status: 409 });
    }

    const orderItems = menuItems.map((item) => ({
      menuItem: item._id,
      name: item.name,
      price: item.offerPrice ?? item.price,
      quantity: quantities.get(item._id.toString()),
    }));
    const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const order = await Order.create({
      customer: customer.sub,
      customerName: customer.name,
      customerEmail: customer.email,
      phone: phone.trim(),
      address: address.trim(),
      note: note.trim(),
      items: orderItems,
      total,
    });
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("ORDER_CREATE_ERROR:", error);
    return NextResponse.json({ error: "Unable to place order" }, { status: 500 });
  }
}
