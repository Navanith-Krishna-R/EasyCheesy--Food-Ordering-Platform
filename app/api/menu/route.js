import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import MenuItem from '@/models/MenuItem';
import Category from '@/models/Category';
import { getSession } from '@/lib/auth';

export async function GET(request) {
  await dbConnect();
  try {
    // 1. Check for Query Params
    const { searchParams } = new URL(request.url);
    const forcePublic = searchParams.get('public') === 'true';

    // 2. Check Session
    const session = await getSession();
    
    // 3. Determine Mode
    // You are an admin ONLY if you have a session AND you didn't ask for the public view
    const isAdmin = !!session && !forcePublic;

    // 4. Set Query
    // Admin sees everything. Public sees only { isVisible: true }
    const query = isAdmin ? {} : { isVisible: true };

    const [categories, items] = await Promise.all([
      Category.find(query).sort({ createdAt: 1 }), 
      MenuItem.find(query)
    ]);

    return NextResponse.json({ categories, items });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(request) {
  await dbConnect();
  try {
    const body = await request.json();
    const newItem = await MenuItem.create({ ...body, isVisible: true });
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create item' }, { status: 400 });
  }
}