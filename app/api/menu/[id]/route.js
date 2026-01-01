import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import MenuItem from '@/models/MenuItem';
import { getSession } from '@/lib/auth';
import mongoose from 'mongoose';

export async function PUT(request, { params }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid Item ID' }, { status: 400 });
  }

  await dbConnect();
  try {
    const body = await request.json();
    console.log("PUT Request Body:", body);

    // Sanitize
    if (body.offerPrice === "") {
        body.offerPrice = null;
    }

    // Explicitly construct the update object to ensure fields aren't lost
    const updateData = {
        name: body.name,
        description: body.description,
        price: body.price,
        offerPrice: body.offerPrice, // Ensure this is passed
        category: body.category,
        image: body.image,
        isVisible: body.isVisible
    };

    const updatedItem = await MenuItem.findByIdAndUpdate(
      id, 
      { $set: updateData }, 
      { new: true, runValidators: true } 
    ).lean();

    console.log("Updated DB Result:", updatedItem); // Check console to see if offerPrice is here

    if (!updatedItem) return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("PUT_ERR", error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
  }

  await dbConnect();
  try {
    const deleted = await MenuItem.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    return NextResponse.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}