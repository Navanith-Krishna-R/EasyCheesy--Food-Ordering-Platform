import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';
import MenuItem from '@/models/MenuItem';
import { getSession } from '@/lib/auth';

export async function PUT(request, { params }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await dbConnect();

  try {
    const body = await request.json();
    const updated = await Category.findByIdAndUpdate(
      id, 
      { $set: body }, 
      { new: true, runValidators: true }
    );
    
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await dbConnect();

  try {
    // 1. Check if category is empty before allowing delete
    // Note: We search by the ObjectId 'id' in MenuItem.category
    const itemWithCategory = await MenuItem.findOne({ category: id }).lean();
    
    if (itemWithCategory) {
      return NextResponse.json({ 
        error: 'Cannot delete category while it contains menu items. Reassign items first.' 
      }, { status: 422 }); // 422 Unprocessable Entity is more semantic here
    }

    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}