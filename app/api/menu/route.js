import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import MenuItem from "@/models/MenuItem";
import Category from "@/models/Category";
import { getSession } from "@/lib/auth";
import mongoose from "mongoose";

export async function GET(request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const forcePublic = searchParams.get("public") === "true";
    const session = await getSession();

    const isAdmin = !!session && !forcePublic;
    const filter = isAdmin ? {} : { isVisible: true };

    // 1. Fetch data separately to avoid "Population" crashes with slugs
    const [categories, rawItems] = await Promise.all([
      Category.find(filter).sort({ name: 1 }).lean(),
      MenuItem.find(filter).sort({ createdAt: -1 }).lean(),
    ]);

    // 2. Map items to ensure 'category' field is just a string/ID
    // This prevents Mongoose from trying to cast 'cakes' to an ObjectId
    const items = rawItems.map((item) => ({
      ...item,
      category: item.category ? item.category.toString() : null,
    }));

    const response = NextResponse.json({ categories, items });

    // 3. High Traffic Optimization: Edge Caching
    if (!isAdmin) {
      response.headers.set(
        "Cache-Control",
        "public, s-maxage=10, stale-while-revalidate=59"
      );
    }

    return response;
  } catch (error) {
    console.error("MENU_GET_ERR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();

  try {
    const body = await request.json();
    
    console.log("POST /api/menu called with:", body);

    // FIX: Convert "slug" (string) to "ObjectId"
    let categoryId = body.category;

    // If the frontend sent a slug string (e.g., "burger"), look up the real ID
    if (typeof body.category === 'string') {
      const categoryDoc = await Category.findOne({ slug: body.category });
      
      if (!categoryDoc) {
         return NextResponse.json({ error: "Invalid Category: " + body.category }, { status: 400 });
      }
      categoryId = categoryDoc._id;
    }

    // Create the item with the resolved ObjectId
    const newItem = await MenuItem.create({
      ...body,
      category: categoryId, // Use the ID, not the string
      isVisible: body.isVisible ?? true,
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error("MENU_POST_ERR:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
