import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';
import MenuItem from '@/models/MenuItem';

export async function DELETE(request, { params }) {
  // FIX: Await params before accessing id
  const { id } = await params;
  
  await dbConnect();
  try {
    // 1. Find the category to get its slug
    const category = await Category.findById(id);
    if (!category) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // 2. Check if any Menu Items use this category slug
    const itemsUsingCategory = await MenuItem.find({ category: category.slug });
    
    if (itemsUsingCategory.length > 0) {
        return NextResponse.json(
            { error: `Cannot delete: ${itemsUsingCategory.length} items still in this category.` }, 
            { status: 409 } // 409 Conflict
        );
    }

    // 3. Safe to delete
    await Category.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}