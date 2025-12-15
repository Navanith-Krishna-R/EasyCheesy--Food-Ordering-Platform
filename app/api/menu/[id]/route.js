import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import MenuItem from '@/models/MenuItem';

export async function PUT(request, { params }) {
  const { id } = await params;
  await dbConnect();
  try {
    const body = await request.json();
    const updatedItem = await MenuItem.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json(updatedItem);
  } catch (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  await dbConnect();
  try {
    await MenuItem.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}