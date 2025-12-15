import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';
import MenuItem from '@/models/MenuItem';

export async function PUT(request, { params }) {
  const { id } = await params;
  await dbConnect();
  try {
    const body = await request.json();
    const updated = await Category.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  await dbConnect();
  try {
    const category = await Category.findById(id);
    if (!category) return NextResponse.json({ error: 'Category not found' }, { status: 404 });

    const itemsInCat = await MenuItem.find({ category: category.slug });
    if (itemsInCat.length > 0) {
        return NextResponse.json({ error: `Cannot delete: ${itemsInCat.length} items present.` }, { status: 409 });
    }

    await Category.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}