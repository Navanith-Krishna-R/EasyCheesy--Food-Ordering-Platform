import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';

export async function GET() {
  await dbConnect();
  try {
    const categories = await Category.find({});
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request) {
  await dbConnect();
  try {
    const body = await request.json();

    // 1. Validate Name
    if (!body.name) {
        return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    
    // 2. Auto-Generate Slug
    // Example: "Spicy Burger!" -> "spicy-burger"
    const slug = body.name.toLowerCase().trim()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '');

    if (!slug) {
        return NextResponse.json({ error: 'Category name invalid (resulted in empty slug)' }, { status: 400 });
    }

    // 3. Check for Duplicate
    const existing = await Category.findOne({ slug });
    if (existing) {
        return NextResponse.json({ error: 'Category already exists' }, { status: 409 });
    }

    // 4. Create
    const newCategory = await Category.create({
        name: body.name,
        slug: slug
    });
    
    return NextResponse.json(newCategory, { status: 201 });

  } catch (error) {
    // CRITICAL: Log the actual error to your terminal
    console.error("❌ CATEGORY API ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}