import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';
import { getSession } from '@/lib/auth';

export async function GET() {
  await dbConnect();
  try {
    // Lean queries for faster read-only metadata
    const categories = await Category.find({}).sort({ name: 1 }).lean();
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  try {
    const { name } = await request.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    // Senior Approach: Use Regex for robust slugification
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special chars
      .replace(/[\s_-]+/g, '-')  // Replace spaces/underscores with single hyphen
      .replace(/^-+|-+$/g, '');  // Trim hyphens from ends

    // Atomic creation handles the "Duplicate Check" via MongoDB unique index
    // This avoids the "Check-then-Act" race condition
    const newCategory = await Category.create({ name, slug });
    return NextResponse.json(newCategory, { status: 201 });

  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'A category with this name already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}