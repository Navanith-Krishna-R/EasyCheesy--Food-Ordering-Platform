import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import MenuItem from '@/models/MenuItem';

export async function PUT(request, { params }) {
  const { id } = await params; // FIX ADDED HERE
  await dbConnect();
  
  try {
    const body = await request.json();
    const updatedItem = await MenuItem.findByIdAndUpdate(id, body, { new: true });
    if (!updatedItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    return NextResponse.json(updatedItem);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params; // FIX ADDED HERE
  await dbConnect();
  
  try {
    const deletedItem = await MenuItem.findByIdAndDelete(id);
    if (!deletedItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Item deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}