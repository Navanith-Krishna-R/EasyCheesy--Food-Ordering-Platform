"use client";
import React, { useState, useEffect, useRef } from 'react';
import { 
  Utensils, 
  Coffee, 
  Pizza, 
  Sandwich, 
  Search, 
  Menu, 
  X, 
  ChevronRight, 
  Lock, 
  LogOut, 
  Plus, 
  Edit, 
  Trash2, 
  Image as ImageIcon,
  LayoutGrid,
  List
} from 'lucide-react';

// --- Mock Data & Types ---

const INITIAL_CATEGORIES = [
  { id: 'juice', name: 'JUICE', icon: '🥤' },
  { id: 'pizzas', name: 'PIZZAS', icon: '🍕' },
  { id: 'burger', name: 'BURGER', icon: '🍔' },
  { id: 'rolls', name: 'ROLLS', icon: '🌯' },
  { id: 'popcorns', name: 'POPCORNS', icon: '🍿' },
];

const INITIAL_ITEMS = [
  { id: 1, name: 'Fresh Orange Juice', description: 'Cold pressed organic oranges without added sugar.', price: 5.99, category: 'juice', image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&q=80&w=600' },
  { id: 2, name: 'Margherita Classic', description: 'Tomato sauce, fresh mozzarella, basil.', price: 12.99, category: 'pizzas', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&q=80&w=600' },
  { id: 3, name: 'Double Cheese Burger', description: 'Two beef patties, cheddar cheese, lettuce, tomato.', price: 10.99, category: 'burger', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=600' },
  { id: 4, name: 'Spicy Chicken Roll', description: 'Grilled chicken strips with spicy mayo in a tortilla.', price: 8.50, category: 'rolls', image: 'https://images.unsplash.com/photo-1595257841889-cb256b9c950a?auto=format&fit=crop&q=80&w=600' },
  { id: 5, name: 'Caramel Popcorn', description: 'Sweet crunchy caramel coated popcorn.', price: 4.50, category: 'popcorns', image: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&q=80&w=600' },
];

// --- Components ---

const PublicMenu = ({ categories, items, onNavigateAdmin }) => {
  const [activeCategory, setActiveCategory] = useState(categories[0].id);

  const scrollToCategory = (catId) => {
    setActiveCategory(catId);
    const element = document.getElementById(catId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Intersection Observer to update active tab on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -70% 0px' } 
    );

    categories.forEach((cat) => {
      const el = document.getElementById(cat.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [categories]);

  return (
    <div className="min-h-screen bg-orange-50 font-sans text-gray-800 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-orange-100">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-orange-500 p-2 rounded-xl text-white">
              <Utensils size={20} />
            </div>
            <h1 className="font-bold text-xl tracking-tight text-orange-950">TastyBites</h1>
          </div>
          <button 
            onClick={onNavigateAdmin}
            className="text-xs font-medium text-orange-400 hover:text-orange-600 transition-colors"
          >
            Admin
          </button>
        </div>

        {/* Category Nav - Horizontal Scroll */}
        <div className="max-w-4xl mx-auto px-2 overflow-x-auto no-scrollbar py-2">
          <div className="flex gap-2 min-w-max px-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => scrollToCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  activeCategory === cat.id
                    ? 'bg-orange-500 text-white shadow-md scale-105'
                    : 'bg-white text-gray-500 hover:bg-orange-100'
                }`}
              >
                <span>{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Menu Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-12">
        {categories.map((cat) => {
          const catItems = items.filter(i => i.category === cat.id);
          if (catItems.length === 0) return null;

          return (
            <section key={cat.id} id={cat.id} className="scroll-mt-36">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-bold text-orange-900">{cat.name}</h2>
                <div className="h-1 flex-1 bg-orange-100 rounded-full"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {catItems.map((item) => (
                  <div key={item.id} className="group bg-white rounded-2xl p-3 shadow-sm hover:shadow-md transition-all duration-300 flex gap-4 border border-transparent hover:border-orange-100">
                    <div className="relative w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }}
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg leading-tight mb-1">{item.name}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-bold text-orange-600 text-lg">${item.price.toFixed(2)}</span>
                        <button className="bg-yellow-100 text-orange-700 p-2 rounded-full hover:bg-orange-500 hover:text-white transition-colors">
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </main>

      <footer className="bg-white border-t border-orange-100 py-8 mt-12">
        <div className="text-center text-gray-400 text-sm">
          <p>© 2024 TastyBites Restaurant. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

const AdminLogin = ({ onLogin, onBack }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulation of secure check
    if (username === 'admin' && password === 'admin123') {
      onLogin();
    } else {
      setError('Invalid credentials. Try admin / admin123');
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center p-4">
      <button onClick={onBack} className="absolute top-6 left-6 text-gray-500 flex items-center gap-2 hover:text-orange-600">
        <ChevronRight className="rotate-180" size={20} /> Back to Menu
      </button>

      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-orange-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={28} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Admin Portal</h2>
          <p className="text-gray-500 text-sm mt-1">Please sign in to manage the menu</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
              placeholder="Enter username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
              placeholder="Enter password"
            />
          </div>
          
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-200 transition-all transform hover:scale-[1.02]">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

const AdminDashboard = ({ categories, items, onUpdateItems, onLogout }) => {
  const [activeTab, setActiveTab] = useState('items'); // 'items' or 'categories'
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: ''
  });

  const resetForm = () => {
    setFormData({ name: '', description: '', price: '', category: categories[0]?.id || '', image: '' });
    setEditingItem(null);
    setIsFormOpen(false);
  };

  const handleEditClick = (item) => {
    setEditingItem(item);
    setFormData({ ...item, price: item.price.toString() });
    setIsFormOpen(true);
  };

  const handleDeleteClick = (id) => {
    if (confirm('Are you sure you want to delete this item?')) {
      const newItems = items.filter(i => i.id !== id);
      onUpdateItems(newItems);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      id: editingItem ? editingItem.id : Date.now() // Simple ID generation
    };

    if (editingItem) {
      const newItems = items.map(i => i.id === editingItem.id ? payload : i);
      onUpdateItems(newItems);
    } else {
      onUpdateItems([...items, payload]);
    }
    resetForm();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Simplified for mobile responsiveness usually, but here fixed */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100">
           <h2 className="text-xl font-bold text-orange-600 flex items-center gap-2">
             <Utensils size={20} /> Admin Panel
           </h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('items')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'items' ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <LayoutGrid size={18} /> Menu Items
          </button>
          <button 
            onClick={() => setActiveTab('categories')}
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
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            {activeTab === 'items' ? 'Manage Food Items' : 'Manage Categories'}
          </h1>
          <div className="flex gap-3">
             <button onClick={onLogout} className="md:hidden text-red-500 p-2">
                <LogOut size={20} />
             </button>
             <button 
              onClick={() => { resetForm(); setIsFormOpen(true); }}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold shadow-lg shadow-orange-200"
            >
              <Plus size={16} /> Add New
            </button>
          </div>
        </div>

        {/* List View */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {activeTab === 'items' ? (
            <table className="w-full text-left">
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
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden">
                        <img src={item.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{item.name}</p>
                        <p className="text-xs text-gray-500 truncate w-40">{item.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-md font-medium uppercase">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-700">${item.price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleEditClick(item)} className="text-blue-500 hover:text-blue-700 mx-2"><Edit size={16} /></button>
                      <button onClick={() => handleDeleteClick(item.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-gray-500">
              Category management UI would go here. (Same CRUD logic as Items)
            </div>
          )}
        </div>
      </main>

      {/* Item Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                {editingItem ? 'Edit Item' : 'Create New Item'}
              </h2>
              <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Name</label>
                <input 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none" 
                  placeholder="e.g. Spicy Burger" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Price</label>
                   <input 
                      required
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none" 
                      placeholder="0.00" 
                    />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Category</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                  >
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Description</label>
                <textarea 
                  required
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  rows="3"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none resize-none" 
                  placeholder="Describe the dish..." 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Image URL</label>
                <input 
                  value={formData.image}
                  onChange={e => setFormData({...formData, image: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none" 
                  placeholder="https://..." 
                />
              </div>
              
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsFormOpen(false)} className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-orange-500 text-white font-bold rounded-xl shadow-lg hover:bg-orange-600 transition-transform hover:scale-[1.02]">
                  {editingItem ? 'Save Changes' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main App Component (Controller) ---

export default function App() {
  const [view, setView] = useState('public'); // 'public', 'login', 'dashboard'
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);

  const handleAdminLogin = () => {
    setIsAuthenticated(true);
    setView('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setView('public');
  };

  // Router simulation
  if (view === 'login') {
    return <AdminLogin onLogin={handleAdminLogin} onBack={() => setView('public')} />;
  }

  if (view === 'dashboard') {
    if (!isAuthenticated) {
      setView('login');
      return null;
    }
    return (
      <AdminDashboard 
        categories={categories}
        items={items}
        onUpdateItems={setItems}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <PublicMenu 
      categories={categories}
      items={items}
      onNavigateAdmin={() => setView('login')}
    />
  );
}