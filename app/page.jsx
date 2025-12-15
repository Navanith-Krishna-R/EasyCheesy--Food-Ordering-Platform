"use client";

import React, { useState, useEffect, useRef } from "react";
import { Plus, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { INITIAL_CATEGORIES, INITIAL_ITEMS } from "./data";

export default function PublicMenu() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [loading, setLoading] = useState(true);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const scrollRef = useRef(null);

  // Ref to track if we are currently scrolling via a click
  // This prevents the observer from switching tabs while the page is still animating to the target
  const isClickScrolling = useRef(false);

  const getCatId = (cat) => cat.slug || cat.id;

  /* ---------------- Fetch Data ---------------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/menu?public=true"); // Force public filtering
        if (!res.ok) throw new Error("API Failed");
        const data = await res.json();

        setCategories(data.categories);
        setItems(data.items);
        if (data.categories.length > 0) {
          setActiveCategory(getCatId(data.categories[0]));
        }
      } catch {
        setCategories(INITIAL_CATEGORIES);
        setItems(INITIAL_ITEMS);
        setActiveCategory(INITIAL_CATEGORIES[0]?.id);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /* ---------------- Helpers ---------------- */
  const getCategoryItemCount = (catId) =>
    items.filter((i) => i.category === catId).length;

  // --- CHANGED: PROPER SCROLL FUNCTIONALITY ---
  const scrollToCategory = (catId) => {
    setActiveCategory(catId);
    isClickScrolling.current = true; // Lock observer

    const element = document.getElementById(catId);
    if (element) {
      // 1. Get the element's position relative to the viewport
      const rect = element.getBoundingClientRect();
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;

      // 2. Define the height of your sticky header (Header + Nav)
      // Adjust this value (230) if your header is taller/shorter
      const headerOffset = 230;

      // 3. Calculate absolute position minus the offset
      const finalPosition = rect.top + scrollTop - headerOffset;

      window.scrollTo({
        top: finalPosition,
        behavior: "smooth",
      });

      // Unlock observer after animation (approx 800ms)
      setTimeout(() => {
        isClickScrolling.current = false;
      }, 800);
    }
  };

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;

    // improved logic for fractional pixels
    setCanScrollLeft(el.scrollLeft > 1);
    setCanScrollRight(
      Math.ceil(el.scrollLeft + el.clientWidth) < el.scrollWidth - 1
    );
  };

  const scrollByAmount = (amount) => {
    scrollRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  };

  /* ---------------- Scroll State ---------------- */
  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener("scroll", updateScrollState);
    window.addEventListener("resize", updateScrollState);

    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [categories]);

  /* ---------------- Intersection Observer ---------------- */
  useEffect(() => {
    if (loading || categories.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Skip updates if we are scrolling via click
        if (isClickScrolling.current) return;

        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveCategory(entry.target.id);
        });
      },
      { rootMargin: "-30% 0px -60% 0px" } // Adjusted margin for better center-screen detection
    );

    categories.forEach((cat) => {
      const id = getCatId(cat);
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [categories, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gap-2 text-orange-500">
        <Loader2 className="animate-spin" /> Loading Menu...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 text-gray-800 pb-20">
      {/* ---------------- Header ---------------- */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="relative w-full py-5 flex justify-center items-center overflow-hidden border-b-[3px] border-amber-100 border-double">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-amber-100/60 via-[#FFFCF5] to-[#FFFCF5]"></div>
          <div className="absolute h-[2px] w-full top-1/2 -translate-y-1/2 bg-gradient-to-r from-transparent via-amber-300 to-transparent opacity-70"></div>

          <div
            className="relative z-10 px-10 py-3 rounded-full 
                      bg-gradient-to-br from-amber-500 via-amber-600 to-amber-800 
                      border-[3px] border-t-amber-200 border-l-amber-300 border-b-amber-700 border-r-amber-600
                      shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_4px_0_#78350f,0_8px_20px_-4px_rgba(120,53,15,0.5)] 
                      text-center">
            <div className="absolute inset-1.5 rounded-full border border-amber-300/40 pointer-events-none"></div>
            <h1
              className="text-2xl md:text-3xl font-bold text-[#FFF8E7] italic drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)] mb-0.5 leading-tight"
              style={{ fontFamily: "var(--font-anek-kannada)" }}>
              ಈಜ಼ೀ ಚೀಜ಼ೀ
            </h1>
            <h2
              className="text-sm md:text-lg text-amber-200 uppercase font-black tracking-[0.2em] drop-shadow-sm"
              style={{ fontFamily: "var(--font-lalita), cursive" }}>
              Easy Cheesy
            </h2>
          </div>
        </div>

        {/* ---------------- Category Nav ---------------- */}
        <div className="relative w-full bg-[#FFFCF5] border-b-4 border-double border-amber-200 shadow-sm">
          <div className="max-w-4xl mx-auto flex items-center px-2 py-2">
            {/* Left Arrow */}
            <button
              onClick={() => scrollByAmount(-200)}
              disabled={!canScrollLeft}
              className={`w-8 h-8 flex items-center justify-center rounded-full border-2 transition-all duration-300
                ${
                  canScrollLeft
                    ? "bg-[#FFFCF5] border-amber-400 text-amber-800 hover:bg-amber-100 shadow-sm hover:scale-110"
                    : "bg-transparent border-amber-100 text-amber-200 cursor-not-allowed"
                }`}>
              <ChevronLeft size={20} />
            </button>

            {/* Scroll Area */}
            <div
              ref={scrollRef}
              className="
                flex-1 mx-2 px-2
                overflow-x-auto overflow-y-hidden
                scroll-smooth no-scrollbar
              ">
              <div className="flex gap-3 min-w-max py-2">
                {categories.map((cat) => {
                  const id = getCatId(cat);
                  const isEmpty = getCategoryItemCount(id) === 0;

                  return (
                    <button
                      key={cat._id || cat.id}
                      disabled={isEmpty}
                      onClick={() => !isEmpty && scrollToCategory(id)}
                      className={`
                        shrink-0 px-5 py-1.5 rounded-full text-sm font-bold tracking-wider transition-all duration-300 border
                        ${
                          isEmpty
                            ? "border-transparent text-stone-300 cursor-not-allowed bg-transparent"
                            : activeCategory === id
                            ? "bg-gradient-to-b from-amber-700 to-amber-900 border-amber-900 text-[#FFFCF5] shadow-md scale-105"
                            : "bg-white border-amber-200 text-amber-800 hover:bg-amber-50 hover:border-amber-400"
                        }
                      `}
                      style={{
                        fontFamily: isEmpty
                          ? "inherit"
                          : "var(--font-serif-royal)",
                      }}>
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Arrow */}
            <button
              onClick={() => scrollByAmount(200)}
              disabled={!canScrollRight}
              className={`w-8 h-8 flex items-center justify-center rounded-full border-2 transition-all duration-300
                ${
                  canScrollRight
                    ? "bg-[#FFFCF5] border-amber-400 text-amber-800 hover:bg-amber-100 shadow-sm hover:scale-110"
                    : "bg-transparent border-amber-100 text-amber-200 cursor-not-allowed"
                }`}>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* ---------------- Menu Content ---------------- */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-12">
        {categories.map((cat) => {
          const id = getCatId(cat);
          const catItems = items.filter((i) => i.category === id);
          if (catItems.length === 0) return null;

          return (
            <section key={id} id={id}>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-amber-950 tracking-wide mb-1">
                  {cat.name}
                </h2>
                <svg
                  className="flex-1 h-3"
                  viewBox="0 0 200 10"
                  preserveAspectRatio="none">
                  {/* --- CHANGED: STROKE COLOR TO AMBER (#d97706) --- */}
                  <path
                    d="M0 5 C 20 0, 40 10, 60 5 S 100 0, 140 5 S 180 10, 200 5"
                    fill="none"
                    stroke="#d97706"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Grid */}
              <div className="flex flex-col gap-x-6 gap-y-8 bg">
                {catItems.map((item) => (
                  <div
                    key={item._id || item.id}
                    className="group relative  rounded-xl p-4 border shadow-[0_8px_30px_rgba(251,191,36,0.15)] bg-white border-amber-200 transition-all duration-300 ease-out flex gap-5">
                    {/* Image with Gold Ring */}
                    <div className="relative shrink-0 w-32 h-32">
                      <div className="absolute inset-0 bg-amber-100 rounded-2xl rotate-7 group-hover:rotate-6 transition-transform duration-300 ease-out" />
                      <div className="relative w-full h-full rounded-2xl overflow-hidden border-2 border-white shadow-sm">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) =>
                            (e.target.src = "https://via.placeholder.com/150")
                          }
                        />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-serif font-bold text-xl text-stone-800 leading-tight group-hover:text-amber-700 transition-colors">
                            {item.name}
                          </h3>
                        </div>
                        <p className="text-sm text-stone-500 mt-2 line-clamp-2 leading-relaxed font-light">
                          {item.description}
                        </p>
                      </div>

                      <div className="flex justify-between items-end mt-3 border-t border-dashed border-stone-100 pt-3">
                        <span className="font-serif font-bold text-2xl text-amber-700">
                          ₹{item.price} /-
                        </span>
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
