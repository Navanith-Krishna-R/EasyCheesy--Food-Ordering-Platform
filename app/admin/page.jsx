"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Utensils, LogOut, Plus, Edit, Trash2, 
  LayoutGrid, List, X, Loader2, Menu 
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('items'); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [editingItem, setEditingItem] = useState(null); 
  const [itemFormData, setItemFormData] = useState({ name: '', description: '', price: '', category: '', image: '' });
  // Removed slug and icon from category form data
  const [catFormData, setCatFormData] = useState({ name: '' });

  // --- Data Fetching ---
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/menu');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setCategories(data.categories || []);
      setItems(data.items || []);
    } catch (error) {
      console.error("API Error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
      fetchAllData().catch(() => router.push('/login'));
  }, []);

  const onLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
  };

  const openForm = (item = null) => {
    setEditingItem(item);
    if (activeTab === 'items') {
      if (item) {
        setItemFormData({ ...item, price: item.price.toString() });
      } else {
        setItemFormData({ 
            name: '', 
            description: '', 
            price: '', 
            category: categories[0]?.slug || '', 
            image: '' 
        });
      }
    } else {
      // Category Form
      if (item) {
        // Edit category is usually complex due to slug changes, keeping it simple for now
        alert("Editing category names is restricted to prevent menu linkage errors. Please delete and recreate if needed.");
        return; 
      } else {
        setCatFormData({ name: '' });
      }
    }
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure? This cannot be undone.')) return;
    
    try {
      if (activeTab === 'items') {
        // Optimistic update for items
        setItems(prev => prev.filter(i => (i._id || i.id) !== id));
        await fetch(`/api/menu/${id}`, { method: 'DELETE' });
      } else {
        // For categories, we DO NOT do optimistic update because server checks logic
        const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
        
        if (!res.ok) {
            const errorData = await res.json();
            alert(errorData.error || "Failed to delete category");
            return; // Stop here, don't update UI
        }
        // If successful, remove from UI
        setCategories(prev => prev.filter(c => (c._id || c.id) !== id));
      }
      fetchAllData(); 
    } catch (error) {
      alert("Operation failed.");
    }
  };
const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const isItem = activeTab === 'items';
      const endpoint = isItem ? '/api/menu' : '/api/categories';
      
      // If Category, we ONLY send the name. The API handles the slug.
      const payload = isItem 
        ? { ...itemFormData, price: parseFloat(itemFormData.price) }
        : { name: catFormData.name }; 

      let res;
      if (editingItem && isItem) {
        const id = editingItem._id || editingItem.id;
        res = await fetch(`${endpoint}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json(); // Parse response

      if (!res.ok) {
          throw new Error(data.error || 'Operation failed');
      }
      
      await fetchAllData();
      setIsFormOpen(false);
      // Clear form
      if(!isItem) setCatFormData({ name: '' }); 

    } catch (error) {
      alert(error.message); // Show the actual error message
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sidebar Component
  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
         <h2 className="text-xl font-bold text-orange-600 flex items-center gap-2">
           <Utensils size={20} /> Admin
         </h2>
         <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400">
            <X size={24} />
         </button>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <button 
          onClick={() => { setActiveTab('items'); setIsSidebarOpen(false); }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'items' ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          <LayoutGrid size={18} /> Menu Items
        </button>
        <button 
          onClick={() => { setActiveTab('categories'); setIsSidebarOpen(false); }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'categories' ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          <List size={18} /> Categories
        </button>
      </nav>
      <div className="p-4 border-t border-gray-100">
        <button onClick={onLogout} className="w-full flex items-center gap-2 text-red-500 px-4 py-2 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium">
          <LogOut size={16} /> Logout
        </button>
      </div>
    </>
  );

  if (loading && items.length === 0 && categories.length === 0) 
    return <div className="h-screen flex items-center justify-center text-orange-500 gap-2"><Loader2 className="animate-spin"/> Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex relative">
      
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 md:translate-x-0 md:static md:shadow-none border-r border-gray-200 flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto">
        <div className="md:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center sticky top-0 z-30">
          <div className="flex items-center gap-2">
             <button onClick={() => setIsSidebarOpen(true)} className="text-gray-600">
               <Menu size={24} />
             </button>
             <h1 className="font-bold text-gray-800">Admin Panel</h1>
          </div>
          <button onClick={() => openForm()} className="bg-orange-500 text-white p-2 rounded-lg">
             <Plus size={20} />
          </button>
        </div>

        <div className="p-4 md:p-8">
          <div className="hidden md:flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">
              {activeTab === 'items' ? 'Manage Food Items' : 'Manage Categories'}
            </h1>
            <button 
              onClick={() => openForm()}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold shadow-lg shadow-orange-200"
            >
              <Plus size={16} /> Add New
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {activeTab === 'items' ? (
              // --- ITEMS TABLE ---
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[600px]"> 
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Item</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Category</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Price</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {items.map(item => (
                      <tr key={item._id || item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                            <img src={item.image} alt="" className="w-full h-full object-cover" onError={(e) => e.target.src='https://via.placeholder.com/150'} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{item.name}</p>
                            <p className="text-xs text-gray-500 truncate w-32 md:w-40">{item.description}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-md font-medium uppercase whitespace-nowrap">
                            {categories.find(c => c.slug === item.category)?.name || item.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-700">${item.price.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <button onClick={() => openForm(item)} className="text-blue-500 hover:text-blue-700 mx-2"><Edit size={16} /></button>
                          <button onClick={() => handleDelete(item._id || item.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                    {items.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-gray-400">No items found.</td></tr>}
                  </tbody>
                </table>
              </div>
            ) : (
               // --- CATEGORIES TABLE (No Icons, No Slug) ---
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[300px]">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Category Name</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {categories.map(cat => (
                      <tr key={cat._id || cat.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-bold text-gray-800">{cat.name}</td>
                        <td className="px-6 py-4 text-right">
                           <button onClick={() => handleDelete(cat._id || cat.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                    {categories.length === 0 && <tr><td colSpan="2" className="p-8 text-center text-gray-400">No categories found.</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                {editingItem ? 'Edit' : 'Create'} {activeTab === 'items' ? 'Item' : 'Category'}
              </h2>
              <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === 'items' ? (
                // --- ITEM FORM ---
                <>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Name</label>
                    <input required value={itemFormData.name} onChange={e => setItemFormData({...itemFormData, name: e.target.value})} className="input-field" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Price</label>
                      <input required type="number" step="0.01" value={itemFormData.price} onChange={e => setItemFormData({...itemFormData, price: e.target.value})} className="input-field" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Category</label>
                      <select value={itemFormData.category} onChange={e => setItemFormData({...itemFormData, category: e.target.value})} className="input-field">
                        {categories.length === 0 && <option value="">No Categories</option>}
                        {categories.map(c => <option key={c._id || c.id} value={c.slug}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Description</label>
                    <textarea required value={itemFormData.description} onChange={e => setItemFormData({...itemFormData, description: e.target.value})} rows="3" className="input-field resize-none" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Image URL</label>
                    <input value={itemFormData.image} onChange={e => setItemFormData({...itemFormData, image: e.target.value})} className="input-field" />
                  </div>
                </>
              ) : (
                // --- CATEGORY FORM (Simplified) ---
                <>
                   <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Category Name</label>
                    <input required value={catFormData.name} onChange={e => setCatFormData({...catFormData, name: e.target.value})} className="input-field" placeholder="e.g. Desserts" />
                    <p className="text-[10px] text-gray-400 mt-1">Slug will be auto-generated.</p>
                  </div>
                </>
              )}
              
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsFormOpen(false)} className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-orange-500 text-white font-bold rounded-xl shadow-lg hover:bg-orange-600 transition-all disabled:opacity-50">
                  {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .input-field {
          width: 100%;
          background-color: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          padding: 0.5rem 1rem;
          outline: none;
        }
        .input-field:focus {
          border-color: #f97316;
          box-shadow: 0 0 0 2px #fed7aa;
        }
      `}</style>
    </div>
  );
}