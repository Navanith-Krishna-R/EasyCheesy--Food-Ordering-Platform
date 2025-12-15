"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Utensils,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  LayoutGrid,
  List,
  X,
  Loader2,
  Menu,
  Eye,
  EyeOff,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

// --- SUB-COMPONENTS (Separation of Concerns) ---

// 1. Toast Notification (Replaces window.alert)
const Toast = ({ message, type = "error", onClose }) => {
  if (!message) return null;
  return (
    <div className="fixed bottom-4 right-4 z-[150] animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border ${
          type === "error"
            ? "bg-white border-rose-100 text-rose-600"
            : "bg-white border-emerald-100 text-emerald-600"
        }`}>
        {type === "error" ? (
          <AlertCircle size={20} />
        ) : (
          <CheckCircle2 size={20} />
        )}
        <p className="text-sm font-medium text-slate-700">{message}</p>
        <button onClick={onClose} className="ml-2 opacity-50 hover:opacity-100">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

// 2. Confirmation Modal (Replaces window.confirm)
const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  title,
  message,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="h-12 w-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-1">
            <Trash2 size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <p className="text-sm text-slate-500">{message}</p>

          <div className="grid grid-cols-2 gap-3 w-full mt-4">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-slate-700 font-bold rounded-xl transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg shadow-rose-200 transition-all flex justify-center items-center gap-2 disabled:opacity-70">
              {isDeleting ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. Compact Item Row (Mobile & Desktop Grid)
const ItemCard = React.memo(({ item, onToggle, onEdit, onDelete }) => (
  <div className="group bg-white border-b border-gray-100 last:border-0 p-3 hover:bg-gray-50 transition-colors">
    {/* Grid Layout: [Image] [Info] [Actions] */}
    <div className="grid grid-cols-[50px_1fr_auto] md:grid-cols-[60px_2fr_1fr_auto] gap-3 items-center">
      {/* Col 1: Image */}
      <div className="h-12 w-12 md:h-14 md:w-14 bg-gray-100 rounded-md overflow-hidden shrink-0 border border-gray-200">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => (e.target.style.display = "none")}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <ImageIcon size={20} />
          </div>
        )}
      </div>

      {/* Col 2: Info (Name & Desc) */}
      <div className="min-w-0 flex flex-col justify-center">
        <div className="flex items-center gap-2">
          <h4
            className={`font-bold text-sm text-gray-800 truncate leading-tight ${
              !item.isVisible ? "opacity-50" : ""
            }`}>
            {item.name}
          </h4>
          {!item.isVisible && (
            <span className="hidden md:inline text-[9px] bg-gray-200 text-gray-500 px-1 rounded uppercase font-bold tracking-wider">
              Hidden
            </span>
          )}
        </div>
        <p className="text-[11px] md:text-xs text-gray-500 truncate mt-0.5">
          {item.description}
        </p>
        {/* Price shows here on Mobile, moves to Col 3 on Desktop */}
        <span className="md:hidden text-xs font-mono font-bold text-orange-600 mt-1 block">
          {parseFloat(item.price).toFixed(2)}
        </span>
      </div>

      {/* Col 3: Price (Desktop Only) */}
      <div className="hidden md:block">
        <span className="text-sm font-mono font-medium text-gray-700">
          {parseFloat(item.price).toFixed(2)}
        </span>
      </div>

      {/* Col 4: Actions (Grouped Tight) */}
      <div className="flex items-center justify-end gap-1 md:gap-2">
        {/* Visibility Toggle */}
        <button
          onClick={() => onToggle(item)}
          className={`p-2 rounded-md transition-all ${
            item.isVisible
              ? "text-green-700  bg-green-200 hover:bg-green-100"
              : "text-gray-400 bg-gray-100"
          }`}>
          {item.isVisible ? (
            <Eye size={20} strokeWidth={2.5} />
          ) : (
            <EyeOff size={20} />
          )}
        </button>

        <div className="h-6 w-px bg-gray-200 mx-1"></div>

        {/* Edit */}
        <button
          onClick={() => onEdit(item)}
          className="p-2 text-blue-600 bg-blue-200 hover:bg-blue-100 rounded-md">
          <Edit2 size={20} strokeWidth={2.5} />
        </button>

        {/* Delete */}
        <button
          onClick={() => onDelete(item)}
          className="p-2 text-red-500 bg-red-200 hover:bg-red-100 rounded-md">
          <Trash2 size={20} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  </div>
));

// 4. Compact Category Row
const CategoryCard = React.memo(({ cat, onToggle, onDelete, itemCount }) => (
  <div className="bg-gray-100 border  border-gray-200 p-4 flex justify-between items-center hover:bg-gray-50 group">
    <div className="flex flex-col ">
      <span
        className={`font-bold text-xl text-gray-800 ${
          !cat.isVisible && "opacity-50"
        }`}>
        {cat.name}
      </span>
      <span className="text-[10px] font-bold bg-yellow-500 p-1 text-center text-black borderfont-medium uppercase tracking-wider mt-0.5">
        {itemCount} Items
      </span>
    </div>
    <div className="flex items-center gap-2">
      <button
        onClick={() => onToggle(cat)}
        className={`p-1.5 rounded-md ${
          cat.isVisible
            ? "text-green-600 bg-green-200 hover:bg-green-100"
            : "text-gray-400 bg-gray-100"
        }`}>
        {cat.isVisible ? <Eye size={20} /> : <EyeOff size={20} />}
      </button>
      <button
        onClick={() => onDelete(cat)}
        className="p-1.5 text-red-500 hover:bg-red-100 bg-red-200 rounded-md transition-colors">
        <Trash2 size={20} />
      </button>
    </div>
  </div>
));

// 5. Optimized Modal Form
const EditorModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  title,
  children,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-white w-full md:w-[450px] md:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-10 md:slide-in-from-bottom-4 duration-200">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white md:rounded-t-2xl z-10">
          <h3 className="font-bold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 bg-gray-100 rounded-full text-gray-500">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-4 overflow-y-auto space-y-4">
          {children}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl shadow-lg hover:bg-black transition-all disabled:opacity-70 flex justify-center items-center gap-2">
              {isSubmitting && <Loader2 className="animate-spin" size={18} />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- MAIN DASHBOARD COMPONENT ---

export default function AdminDashboard() {
  const router = useRouter();

  // State
  const [activeTab, setActiveTab] = useState("items");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [data, setData] = useState({ categories: [], items: [] });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // UI State for Errors/Confirmations
  const [errorMsg, setErrorMsg] = useState(null);
  const [deleteState, setDeleteState] = useState({
    isOpen: false,
    item: null,
    isDeleting: false,
  });

  const [editingItem, setEditingItem] = useState(null);
  const [itemFormData, setItemFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
  });
  const [catFormData, setCatFormData] = useState({ name: "" });

  // 1. Fetch & Sort
  const fetchAllData = useCallback(async () => {
    try {
      const res = await fetch("/api/menu");
      if (res.status === 401) return router.push("/login");
      if (!res.ok) throw new Error("Could not load data");

      const json = await res.json();

      const sortedCats = (json.categories || []).sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      const sortedItems = (json.items || []).sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      setData({ categories: sortedCats, items: sortedItems });
    } catch (e) {
      console.error(e);
      setErrorMsg("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // 2. Logic Helpers
  const handleToggle = async (type, item) => {
    const isItem = type === "item";
    const id = item._id || item.id;
    const newVal = !item.isVisible;

    // Optimistic UI Update
    setData((prev) => ({
      ...prev,
      [isItem ? "items" : "categories"]: prev[
        isItem ? "items" : "categories"
      ].map((x) => ((x._id || x.id) === id ? { ...x, isVisible: newVal } : x)),
    }));

    // Server Sync
    try {
      const res = await fetch(
        isItem ? `/api/menu/${id}` : `/api/categories/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isVisible: newVal }),
        }
      );
      if (!res.ok) throw new Error("Update failed");
    } catch (e) {
      setErrorMsg("Failed to update visibility");
      fetchAllData(); // Revert on fail
    }
  };

  // --- NEW DELETE LOGIC (UI Based) ---

  // A. Trigger the Modal
  const requestDelete = (item) => {
    setDeleteState({
      isOpen: true,
      item: item,
      isDeleting: false,
    });
  };

  // B. Execute the API Call
  const confirmDelete = async () => {
    const { item } = deleteState;
    if (!item) return;

    setDeleteState((prev) => ({ ...prev, isDeleting: true }));
    const id = item._id || item.id;
    const isItem = activeTab === "items";

    try {
      const res = await fetch(
        isItem ? `/api/menu/${id}` : `/api/categories/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) throw new Error("Delete failed on server");

      // Optimistic Update (or just update after success)
      setData((prev) => ({
        ...prev,
        [isItem ? "items" : "categories"]: prev[
          isItem ? "items" : "categories"
        ].filter((x) => (x._id || x.id) !== id),
      }));

      // Close Modal
      setDeleteState({ isOpen: false, item: null, isDeleting: false });
    } catch (e) {
      setErrorMsg("Could not delete item. Please try again.");
      setDeleteState((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const isItem = activeTab === "items";
    const endpoint = isItem ? "/api/menu" : "/api/categories";
    const payload = isItem
      ? { ...itemFormData, price: parseFloat(itemFormData.price) }
      : catFormData;

    try {
      const url =
        editingItem && isItem
          ? `${endpoint}/${editingItem._id || editingItem.id}`
          : endpoint;
      const method = editingItem && isItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Save failed");

      await fetchAllData();
      setIsFormOpen(false);
    } catch (e) {
      setErrorMsg("Failed to save changes. Check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openForm = (item = null) => {
    setEditingItem(item);
    if (activeTab === "items") {
      if (item) setItemFormData({ ...item, price: item.price.toString() });
      else
        setItemFormData({
          name: "",
          description: "",
          price: "",
          category: data.categories[0]?.slug || "",
          image: "",
        });
    } else {
      setCatFormData({ name: "" });
    }
    setIsFormOpen(true);
  };

  // Group items by category for the list view (Memoized for performance)
  const itemsByCategory = useMemo(() => {
    const groups = {};
    data.categories.forEach((c) => {
      groups[c.slug] = [];
    });
    data.items.forEach((i) => {
      if (groups[i.category]) groups[i.category].push(i);
      else if (!groups["uncategorized"]) groups["uncategorized"] = [i];
      else groups["uncategorized"].push(i);
    });
    return groups;
  }, [data.items, data.categories]);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-orange-600" />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 flex text-sm md:text-base font-sans antialiased text-slate-900">
      {/* --- Error Toast --- */}
      <Toast message={errorMsg} onClose={() => setErrorMsg(null)} />

      {/* --- Delete Confirmation Modal --- */}
      <ConfirmModal
        isOpen={deleteState.isOpen}
        onClose={() => setDeleteState({ ...deleteState, isOpen: false })}
        onConfirm={confirmDelete}
        isDeleting={deleteState.isDeleting}
        title="Confirm Deletion"
        message={`Are you sure you want to permanently delete "${deleteState.item?.name}"? This action cannot be undone.`}
      />

      {/* --- Sidebar (Mobile Drawer) --- */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-45 bg-black text-white transform transition-transform duration-300 md:translate-x-0 md:static ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}>
        <div className="p-5 border-b border-orange-600 flex justify-between items-center h-16">
          <span className="font-bold text-lg tracking-tight flex items-center gap-2">
            <Utensils size={18} className="text-orange-600" /> Admin
          </span>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-slate-400">
            <X size={20} />
          </button>
        </div>
        <nav className="p-3 space-y-1">
          {["items", "categories"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-orange-600 text-white"
                  : "text-slate-400 hover:bg-slate-500 hover:text-white"
              }`}>
              {tab === "items" ? <LayoutGrid size={18} /> : <List size={18} />}
              <span className="capitalize">{tab}</span>
            </button>
          ))}
        </nav>
        <div className="absolute flex justify-center items-center bottom-0 w-full p-4 border-t ">
          <button
            onClick={async () => {
              try {
                await fetch("/api/logout", { method: "POST" });
                router.push("/login");
              } catch (e) {
                setErrorMsg("Logout failed");
              }
            }}
            className="flex bg-red-600 p-2 rounded-md hover:bg-red-800 items-center gap-2 text-white text-sm font-bold uppercase tracking-wider">
            <LogOut size={20} className="" /> Sign Out
          </button>
        </div>
      </aside>

      {/* --- Overlay --- */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* --- Main Content --- */}
      <main className="flex-1 h-screen overflow-y-auto flex flex-col relative">
        {/* Mobile Header */}
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-gray-200 px-4 py-3 flex justify-between items-center md:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-1 -ml-1">
              <Menu size={22} className="text-slate-700" />
            </button>
            <h1 className="font-bold text-slate-800 capitalize">
              {activeTab} Management
            </h1>
          </div>

          <button
            onClick={() => openForm()}
            className="bg-orange-600 text-white p-2 rounded-full shadow-lg shadow-orange-200">
            <Plus size={20} />
          </button>
        </header>

        {/* Desktop Header */}
        <div className="hidden md:flex justify-between items-center px-8 py-6 max-w-5xl mx-auto w-full">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 capitalize">
              {activeTab} Management
            </h1>
          </div>

          <button
            onClick={() => openForm()}
            className="bg-orange-600 text-white p-2 rounded-full shadow-lg shadow-orange-200">
            <Plus size={20} />
          </button>
        </div>

        {/* --- List Content --- */}
        <div className="flex-1 mt-4 px-0 md:px-8 pb-20 md:pb-8 max-w-5xl mx-auto w-full">
          {activeTab === "items" ? (
            /* ITEMS VIEW */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {data.categories.map((cat) => {
                const catItems = itemsByCategory[cat.slug] || [];
                if (catItems.length === 0) return null;

                return (
                  <div
                    key={cat._id || cat.id}
                    className={`bg-white md:rounded-xl border-y md:border border-gray-200 overflow-hidden
              ${!cat.isVisible && "opacity-70 border-dashed"}`}>
                    {/* Category Header */}
                    <div className="bg-black px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="font-bold text-white text-2xl flex items-center gap-2">
                        {cat.name}
                        {!cat.isVisible && (
                          <EyeOff size={20} className="text-gray-400" />
                        )}
                      </h3>

                      <span className="text-[15px] bg-yellow-400 rounded-md text-black flex justify-center items-center font-bold   h-6 w-10">
                        {catItems.length}
                      </span>
                    </div>

                    {/* Items */}
                    <div>
                      {catItems.map((item) => (
                        <ItemCard
                          key={item._id || item.id}
                          item={item}
                          onToggle={(i) => handleToggle("item", i)}
                          onEdit={openForm}
                          onDelete={requestDelete}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}

              {data.items.length === 0 && (
                <div className="col-span-full text-center py-10 text-gray-400">
                  No items found. Add one!
                </div>
              )}
            </div>
          ) : (
            /* CATEGORIES VIEW */
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.categories.map((cat) => (
                <CategoryCard
                  key={cat._id || cat.id}
                  cat={cat}
                  itemCount={(itemsByCategory[cat.slug] || []).length}
                  onToggle={(c) => handleToggle("category", c)}
                  onDelete={requestDelete}
                />
              ))}

              {data.categories.length === 0 && (
                <div className="text-center py-10 text-gray-400">
                  No categories.
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* --- FORM MODAL --- */}
      <EditorModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={
          editingItem
            ? "Edit Item"
            : activeTab === "items"
            ? "New Item"
            : "New Category"
        }
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}>
        {activeTab === "items" ? (
          <>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Item Name
              </label>
              <input
                required
                value={itemFormData.name}
                onChange={(e) =>
                  setItemFormData({ ...itemFormData, name: e.target.value })
                }
                className="mt-1 w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                placeholder="e.g. Spicy Burger"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Price
                </label>
                <input
                  required
                  type="number"
                  step="0.01"
                  value={itemFormData.price}
                  onChange={(e) =>
                    setItemFormData({ ...itemFormData, price: e.target.value })
                  }
                  className="mt-1 w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Category
                </label>
                <select
                  value={itemFormData.category}
                  onChange={(e) =>
                    setItemFormData({
                      ...itemFormData,
                      category: e.target.value,
                    })
                  }
                  className="mt-1 w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all h-[38px]">
                  {data.categories.map((c) => (
                    <option key={c._id || c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Description
              </label>
              <textarea
                required
                value={itemFormData.description}
                onChange={(e) =>
                  setItemFormData({
                    ...itemFormData,
                    description: e.target.value,
                  })
                }
                rows="3"
                className="mt-1 w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none"
                placeholder="Short description..."
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Image URL
              </label>
              <input
                value={itemFormData.image}
                onChange={(e) =>
                  setItemFormData({ ...itemFormData, image: e.target.value })
                }
                className="mt-1 w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                placeholder="https://..."
              />
            </div>
          </>
        ) : (
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Category Name
            </label>
            <input
              required
              value={catFormData.name}
              onChange={(e) =>
                setCatFormData({ ...catFormData, name: e.target.value })
              }
              className="mt-1 w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              placeholder="e.g. Starters"
            />
          </div>
        )}
      </EditorModal>
    </div>
  );
}
