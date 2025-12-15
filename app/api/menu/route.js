import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import MenuItem from '@/models/MenuItem';
import Category from '@/models/Category';

export async function GET() {
  await dbConnect();
  try {
    // Run fetches in parallel for speed
    const [categories, items] = await Promise.all([
      Category.find({}),
      MenuItem.find({})
    ]);

    return NextResponse.json({ categories, items });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

// POST for items remains the same as previous step...
export async function POST(request) {
  await dbConnect();
  try {
    const body = await request.json();
    const newItem = await MenuItem.create(body);
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create item' }, { status: 400 });
  }
}