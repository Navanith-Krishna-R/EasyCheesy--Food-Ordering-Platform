"use client";
import React, { useState, useEffect } from 'react';
import { Utensils, Plus, Loader2 } from 'lucide-react';
import { INITIAL_CATEGORIES, INITIAL_ITEMS } from './data'; // Import fallback data

export default function PublicMenu() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [loading, setLoading] = useState(true);

  // Helper to get unique ID for scrolling/filtering (Prefers slug from DB, falls back to id for static)
  const getCatId = (cat) => cat.slug || cat.id;

  // Fetch API with Fallback
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/menu');
        if (!res.ok) throw new Error('API Failed');
        const data = await res.json();
        
        setCategories(data.categories);
        setItems(data.items);
        
        // Set first category active
        if (data.categories.length > 0) {
            setActiveCategory(getCatId(data.categories[0]));
        }
      } catch (error) {
        console.warn("API unavailable, loading static data.");
        setCategories(INITIAL_CATEGORIES);
        setItems(INITIAL_ITEMS);
        setActiveCategory(INITIAL_CATEGORIES[0]?.id);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const scrollToCategory = (catId) => {
    setActiveCategory(catId);
    const element = document.getElementById(catId);
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Intersection Observer
  useEffect(() => {
    if (loading || categories.length === 0) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveCategory(entry.target.id);
        });
      },
      { rootMargin: '-100px 0px -70% 0px' } 
    );

    categories.forEach((cat) => {
      const id = getCatId(cat);
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [categories, loading]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-orange-500 gap-2"><Loader2 className="animate-spin" /> Loading Menu...</div>;

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
        </div>

        {/* Category Nav */}
        <div className="max-w-4xl mx-auto px-2 overflow-x-auto no-scrollbar py-2">
          <div className="flex gap-2 min-w-max px-2">
            {categories.map((cat) => {
              const uniqueId = getCatId(cat);
              return (
                <button
                  key={cat._id || cat.id}
                  onClick={() => scrollToCategory(uniqueId)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                    activeCategory === uniqueId
                      ? 'bg-orange-500 text-white shadow-md scale-105'
                      : 'bg-white text-gray-500 hover:bg-orange-100'
                  }`}
                >
                  {/* Icon removed as per requirements */}
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Menu Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-12">
        {categories.map((cat) => {
          const uniqueId = getCatId(cat);
          // Filter: Matches item.category to the category slug (or id for static)
          const catItems = items.filter(i => i.category === uniqueId);
          
          if (catItems.length === 0) return null;

          return (
            <section key={cat._id || cat.id} id={uniqueId} className="scroll-mt-36">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-bold text-orange-900">{cat.name}</h2>
                <div className="h-1 flex-1 bg-orange-100 rounded-full"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {catItems.map((item) => (
                  <div key={item._id || item.id} className="group bg-white rounded-2xl p-3 shadow-sm hover:shadow-md transition-all duration-300 flex gap-4 border border-transparent hover:border-orange-100">
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
    </div>
  );
}