import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Category from "@/models/Category";
import MenuItem from "@/models/MenuItem";
import { getSession } from "@/lib/auth";
import mongoose from "mongoose";

export async function PUT(request, { params }) {
  console.log("PUT /api/categories/[id] called");
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 1. Await params (Next.js 15 requirement)
  const { id } = await params;
  console.log("Updating Category ID:", id);

  // 2. Validate ID format to prevent 500 errors
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid Category ID" }, { status: 400 });
  }

  await dbConnect();

  try {
    const body = await request.json();

    // 3. Perform Update
    const updated = await Category.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    // 4. If null, the ID doesn't exist in DB
    if (!updated)
      return NextResponse.json(
        { error: "Category not found in DB" },
        { status: 404 }
      );

    return NextResponse.json(updated);
  } catch (error) {
    console.error("CAT_UPDATE_ERR:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

// export async function DELETE(request, { params }) {
//   const session = await getSession();
//   if (!session)
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//   const { id } = await params;

//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     return NextResponse.json({ error: "Invalid Category ID" }, { status: 400 });
//   }

//   await dbConnect();

//   try {
//     // Check if items are linked to this category
//     // NOTE: This assumes MenuItem.category stores the ObjectId.
//     // If your MenuItems store the "slug", change this query to match the slug.
//     const itemWithCategory = await MenuItem.findOne({ category: id }).lean();

//     if (itemWithCategory) {
//       return NextResponse.json(
//         {
//           error: "Cannot delete: This category contains items.",
//         },
//         { status: 422 }
//       );
//     }

//     const deleted = await Category.findByIdAndDelete(id);

//     if (!deleted)
//       return NextResponse.json(
//         { error: "Category not found" },
//         { status: 404 }
//       );

//     return NextResponse.json({ message: "Category deleted successfully" });
//   } catch (error) {
//     return NextResponse.json({ error: "Delete failed" }, { status: 500 });
//   }
// }

export async function DELETE(request, { params }) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
  }

  await dbConnect();

  try {
    // 1. Get the category details first
    const categoryToDelete = await Category.findById(id);
    if (!categoryToDelete) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // 2. SAFETY CHECK (Using Raw Database Access)
    // We use mongoose.connection.db to bypass Schema validation errors (CastError)
    // This allows us to check for "pizza" (string) AND ObjectId(12345...) without crashing.
    const rawCollection = mongoose.connection.db.collection("menuitems");

    const conflictingItem = await rawCollection.findOne({
      $or: [
        { category: new mongoose.Types.ObjectId(id) }, // Check for ID match
        { category: id }, // Check for ID string match
        { category: categoryToDelete.slug }, // Check for Slug match (e.g., "pizza")
      ],
    });

    if (conflictingItem) {
      return NextResponse.json(
        {
          error: `Cannot delete: Category "${categoryToDelete.name}" not empty".`,
        },
        { status: 422 }
      );
    }

    // 3. Proceed to delete if safe
    await Category.findByIdAndDelete(id);

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("DELETE_CAT_ERROR:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
