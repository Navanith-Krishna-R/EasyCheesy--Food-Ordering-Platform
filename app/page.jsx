
import HomeShell from "./components/HomeShell";
import dbConnect from "@/lib/mongodb";
import Category from "@/models/Category";
import MenuItem from "@/models/MenuItem";

// Force dynamic ensures the server always gets the latest menu data
export const dynamic = "force-dynamic";

async function getMenuData() {
  try {
    await dbConnect();
    const [rawCategories, rawItems] = await Promise.all([
      Category.find({ isVisible: true }).sort({ name: 1 }).lean(),
      MenuItem.find({ isVisible: true }).sort({ createdAt: -1 }).lean(),
    ]);

    // React Server Components only accept plain serializable values. Mongoose's
    // ObjectId and Date instances must be converted before crossing into HomeShell.
    const categories = rawCategories.map((category) => ({
      ...category,
      _id: category._id.toString(),
      createdAt: category.createdAt?.toISOString?.() || null,
      updatedAt: category.updatedAt?.toISOString?.() || null,
    }));
    const items = rawItems.map((item) => ({
      ...item,
      _id: item._id.toString(),
      category: item.category?.toString() || null,
      createdAt: item.createdAt?.toISOString?.() || null,
      updatedAt: item.updatedAt?.toISOString?.() || null,
    }));
    return { categories, items, error: false };
  } catch (error) {
    console.error("SSR Fetch Error:", error);
    return { categories: [], items: [], error: true };
  }
}

export default async function Page() {
  const data = await getMenuData();

  return (
    <HomeShell
      initialCategories={data.categories || []}
      initialItems={data.items || []}
      fetchError={data.error || false}
    />
  );
}
