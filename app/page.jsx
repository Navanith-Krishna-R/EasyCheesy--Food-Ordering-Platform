
import PublicMenu from "./components/PublicMenu";

// Force dynamic ensures the server always gets the latest menu data
export const dynamic = "force-dynamic";

async function getMenuData() {
  try {
    // We use the full URL if calling from the server,
    // or a direct database call if this is a local project.
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/menu?publictrue`, {
      cache: "no-store", // SSR: Don't cache, always get fresh menu
    });

    if (!res.ok) return { categories: [], items: [], error: true };

    return await res.json();
  } catch (error) {
    console.error("SSR Fetch Error:", error);
    return { categories: [], items: [], error: true };
  }
}

export default async function Page() {
  const data = await getMenuData();

  return (
    <PublicMenu
      initialCategories={data.categorie || []}
      initialItems={data.item || []}
      fetchError={data.error || false}
    />
  );
}
  