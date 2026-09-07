import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import MenuItem from "@/models/MenuItem";
import Category from "@/models/Category";
import { getSession } from "@/lib/auth";

export async function GET(request) {
  try {
    await dbConnect();
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

  try {
    await dbConnect();
    const body = await request.json();

    let categoryId = body.category;

    // --- FIX START: SMART DETECTION ---
    if (typeof body.category === 'string') {
      // 1. Is it a valid 24-character Mongo ID?
      if (/^[0-9a-fA-F]{24}$/.test(body.category)) {
         categoryId = body.category; // It's already an ID, use it directly
      } 
      // 2. Otherwise, treat it as a Slug
      else {
         const categoryDoc = await Category.findOne({ slug: body.category });
         if (!categoryDoc) {
            return NextResponse.json({ error: "Invalid Category slug: " + body.category }, { status: 400 });
         }
         categoryId = categoryDoc._id;
      }
    }
    // ----------------------------------

    // Sanitize offerPrice
    if (body.offerPrice === "" || body.offerPrice === undefined) {
      body.offerPrice = null;
    }

    const newItem = await MenuItem.create({
      ...body,
      category: categoryId, // Uses the resolved ID
      offerPrice: body.offerPrice,
      isVisible: body.isVisible ?? true,
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error("MENU_POST_ERR:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
