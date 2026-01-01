"use client";
import { useState, useEffect, useRef, useMemo } from "react";
// Added 'X' for the close button
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Phone,
  X,
} from "lucide-react";
// Added framer-motion for smooth expand/retract animations
import { motion, AnimatePresence } from "framer-motion";

export default function PublicMenu({
  initialCategories = [],
  initialItems = [],
  fetchError = false,
}) {
  const [categories, setCategories] = useState(initialCategories);
  const [items, setItems] = useState(initialItems);
  const [activeCategory, setActiveCategory] = useState("");
  const [loading, setLoading] = useState(
    !initialCategories.length && !fetchError
  );
  const [error, setError] = useState(fetchError);

  // NEW: State to track the expanded card
  const [selectedItem, setSelectedItem] = useState(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const scrollRef = useRef(null);
  const isClickScrolling = useRef(false);

  const getCatId = (cat) => cat.slug || cat.id || cat._id;

  /* ---------------- Fetch Data (Client-side fallback/refresh) ---------------- */
  const fetchData = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/menu?public=true");
      if (!res.ok) throw new Error("API Failed");
      const data = await res.json();

      setCategories(data.categories || []);
      setItems(data.items || []);
    } catch (err) {
      console.error("Menu fetch error:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCategories.length === 0 && !fetchError) {
      fetchData();
    }
  }, [initialCategories]);

  /* ---------------- Optimized Sorting Logic ---------------- */
  const sortedCategories = useMemo(() => {
    if (!categories.length) return [];

    const countItems = (cat) => {
      return items.filter(
        (i) => i.category === cat._id || i.category === cat.slug
      ).length;
    };

    return [...categories].sort((a, b) => {
      const countA = countItems(a);
      const countB = countItems(b);

      if (countA === 0 && countB > 0) return 1;
      if (countA > 0 && countB === 0) return -1;

      return a.name.localeCompare(b.name);
    });
  }, [categories, items]);

  useEffect(() => {
    if (sortedCategories.length > 0 && !activeCategory) {
      const firstNonEmpty = sortedCategories.find(
        (cat) => items.filter((i) => i.category === getCatId(cat)).length > 0
      );
      if (firstNonEmpty) {
        setActiveCategory(getCatId(firstNonEmpty));
      } else {
        setActiveCategory(getCatId(sortedCategories[0]));
      }
    }
  }, [sortedCategories, items, activeCategory]);

  /* ---------------- Helpers ---------------- */
  const getCategoryItemCount = (cat) =>
    items.filter((i) => i.category === cat._id || i.category === cat.slug)
      .length;

  const scrollToCategory = (catId) => {
    setActiveCategory(catId);
    isClickScrolling.current = true;

    const element = document.getElementById(catId);
    if (element) {
      const rect = element.getBoundingClientRect();
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const headerOffset = 230;
      const finalPosition = rect.top + scrollTop - headerOffset;

      window.scrollTo({
        top: finalPosition,
        behavior: "smooth",
      });

      setTimeout(() => {
        isClickScrolling.current = false;
      }, 800);
    }
  };

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 1);
    setCanScrollRight(
      Math.ceil(el.scrollLeft + el.clientWidth) < el.scrollWidth - 1
    );
  };

  const scrollByAmount = (amount) => {
    scrollRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  };

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
  }, [sortedCategories]);

  /* ---------------- Intersection Observer ---------------- */
  useEffect(() => {
    if (loading || sortedCategories.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isClickScrolling.current) return;
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveCategory(entry.target.id);
        });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );

    sortedCategories.forEach((cat) => {
      const id = getCatId(cat);
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sortedCategories, loading]);

  // NEW: Lock body scroll when popup is open
  useEffect(() => {
    if (selectedItem) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [selectedItem]);

  /* ---------------- Loading State ---------------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center gap-4 text-amber-700">
        <Loader2 className="w-10 h-10 animate-spin text-amber-600" />
        <p className="font-serif text-xl font-bold italic">
          Preparing the Menu...
        </p>
      </div>
    );
  }

  /* ---------------- Error State ---------------- */
  if (error) {
    return (
      <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center px-6 text-center">
        <div className="bg-white p-8 rounded-3xl border-2 border-amber-200 shadow-xl max-w-md w-full">
          <AlertCircle className="w-16 h-16 text-amber-600 mx-auto mb-4" />
          <h2 className="text-2xl font-serif font-bold text-stone-800 mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-stone-600 mb-8">
            We're having trouble loading the menu right now. Please try again or
            contact us directly.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center gap-2 w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition-all shadow-md active:scale-95">
              <RefreshCw size={20} /> Reload Menu
            </button>
            <a
              href="tel:+917892278183"
              className="flex items-center justify-center gap-2 w-full py-3 border-2 border-amber-600 text-amber-700 hover:bg-amber-50 rounded-xl font-bold transition-all">
              <Phone size={20} /> Contact Restaurant
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 text-gray-800 flex flex-col">
      {/* ---------------- Header ---------------- */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="relative w-full py-5 flex justify-center items-center overflow-hidden border-b-[3px] border-amber-100 border-double">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-amber-100/60 via-[#FFFCF5] to-[#FFFCF5]"></div>
          <div className="absolute h-0.5 w-full top-1/2 -translate-y-1/2 bg-linear-to-r from-transparent via-amber-300 to-transparent opacity-70"></div>

          <div className="relative z-10 px-10 py-3 rounded-full bg-linear-to-br from-amber-500 via-amber-600 to-amber-800 border-[3px] border-t-amber-200 border-l-amber-300 border-b-amber-700 border-r-amber-600 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_4px_0_#78350f,0_8px_20px_-4px_rgba(120,53,15,0.5)] text-center">
            <div className="absolute inset-1.5 rounded-full border border-amber-300/40 pointer-events-none"></div>
            <h1
              className="text-2xl md:text-3xl font-bold text-[#FFF8E7] italic drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)] mb-0.5 leading-tight"
              style={{ fontFamily: "var(--font-anek-kannada)" }}>
              ಈಜ಼ೀ ಚೀಜ಼ೀ
            </h1>
            <h2 className="text-sm md:text-lg text-amber-200 uppercase font-black tracking-[0.2em] drop-shadow-sm">
              Easy Cheesy
            </h2>
          </div>
        </div>

        {/* ---------------- Category Nav ---------------- */}
        <div className="relative w-full bg-[#FFFCF5] border-b-4 border-double border-amber-200 shadow-sm">
          <div className="max-w-4xl mx-auto flex items-center px-2 py-2">
            <button
              onClick={() => scrollByAmount(-200)}
              disabled={!canScrollLeft}
              className={`w-8 h-8 flex items-center justify-center rounded-full border-2 transition-all duration-300 ${
                canScrollLeft
                  ? "bg-[#FFFCF5] border-amber-400 text-amber-800 hover:bg-amber-100 shadow-sm hover:scale-110"
                  : "bg-transparent border-amber-100 text-amber-200 cursor-not-allowed"
              }`}>
              <ChevronLeft size={20} />
            </button>

            <div
              ref={scrollRef}
              className="flex-1 mx-2 px-2 overflow-x-auto overflow-y-hidden scroll-smooth no-scrollbar">
              <div className="flex gap-3 min-w-max py-2">
                {sortedCategories.map((cat) => {
                  const id = getCatId(cat);
                  const isEmpty = getCategoryItemCount(cat) === 0;

                  return (
                    <button
                      key={cat._id || cat.id}
                      disabled={isEmpty}
                      onClick={() => !isEmpty && scrollToCategory(id)}
                      className={`shrink-0 px-5 py-1.5 rounded-full text-sm font-bold tracking-wider transition-all duration-300 border ${
                        isEmpty
                          ? "border-transparent text-stone-300 cursor-not-allowed bg-transparent"
                          : activeCategory === id
                          ? "bg-linear-to-b from-amber-700 to-amber-900 border-amber-900 text-[#FFFCF5] shadow-md scale-105"
                          : "bg-white border-amber-200 text-amber-800 hover:bg-amber-50 hover:border-amber-400"
                      }`}
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

            <button
              onClick={() => scrollByAmount(200)}
              disabled={!canScrollRight}
              className={`w-8 h-8 flex items-center justify-center rounded-full border-2 transition-all duration-300 ${
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
      <main className="max-w-max px-4 py-6 space-y-12 flex flex-col justify-center item-center mx-auto w-full">
        {sortedCategories.map((cat) => {
          const id = getCatId(cat);
          const catItems = items
            .filter((i) => i.category === cat._id || i.category === cat.slug)
            .sort((a, b) => {
              const priceA = parseFloat(a.price);
              const priceB = parseFloat(b.price);

              const isLowA = priceA <= 30;
              const isLowB = priceB <= 30;

              // If A is <= 30 but B isn't, A goes last (return 1)
              if (isLowA && !isLowB) return 1;

              // If B is <= 30 but A isn't, B goes last (return -1)
              if (!isLowA && isLowB) return -1;

              // Otherwise, sort by price ascending
              return priceA - priceB;
            });

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
                  <path
                    d="M0 5 C 20 0, 40 10, 60 5 S 100 0, 140 5 S 180 10, 200 5"
                    fill="none"
                    stroke="#d97706"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div className="flex flex-col gap-x-3 gap-y-3">
                {catItems.map((item) => (
                  // Changed div to motion.div for animation linkage
                  <motion.div
                    layoutId={`card-${item._id || item.id}`}
                    key={item._id || item.id}
                    onClick={() => setSelectedItem(item)}
                    className="group relative rounded-xl p-4 h-40 border shadow-[0_8px_30px_rgba(251,191,36,0.15)] bg-white border-amber-200 transition-all duration-300 ease-out flex gap-5 cursor-pointer">
                    <div className="relative shrink-0 w-32 h-32">
                      <div className="absolute inset-0 bg-amber-100 rounded-2xl rotate-7 group-hover:rotate-6 transition-transform duration-300 ease-out" />
                      <div className="relative w-30 h-30 rounded-2xl overflow-hidden border-2 border-white shadow-sm">
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

                    <div className="flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-serif font-bold text-lg text-stone-800 leading-tight group-hover:text-amber-700 transition-colors">
                            {item.name}
                          </h3>
                        </div>
                        <p className="text-sm text-stone-500 mt-2 line-clamp-2 leading-relaxed font-light">
                          {item.description}
                        </p>
                      </div>
                      <div className="flex justify-start gap-8 items-end mt-3 border-t border-dashed border-stone-100 pt-3">
                        <div className="relative inline-block">
                          {/* The Price Text */}
                          {item.price != 0 || item.price === "0" ? (
                            <span className="font-serif font-bold text-2xl text-black/60 pointer-events-none">
                              ₹{item.price}
                            </span>
                          ) : null}
                          {/* Line 1 of the Cross (\) */}
                          <span className="absolute top-1/2 left-1/2 w-full h-0.5 bg-red-500 -translate-x-1/2 -translate-y-1/2 -rotate-45 pointer-events-none"></span>

                          {/* Line 2 of the Cross (/) */}
                          <span className="absolute top-1/2 left-1/2 w-full h-0.5 bg-red-500 -translate-x-1/2 -translate-y-1/2 rotate-45 pointer-events-none"></span>
                        </div>
                        <span className="font-serif font-bold text-2xl text-amber-700">
                          ₹{item.offerPrice} /-
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          );
        })}
      </main>

      {/* ---------------- Footer ---------------- */}
      <footer className="sticky bottom-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200">
        <div className="relative w-full bg-[#FFFCF5] border-t-4 border-double border-amber-200 shadow-sm">
          <div className="max-w-4xl mx-auto flex items-center px-2 py-2">
            <p className="text-sm text-amber-900 italic font-medium mx-auto">
              For orders and inquiries, contact us at:{" "}
              <a
                href="tel:+917892278183"
                className="underline font-bold text-amber-800 hover:text-amber-900">
                +91 78922 78183
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* ---------------- Expanded Card Popup ---------------- */}
      <AnimatePresence>
        {selectedItem && (
          <>
            {/* Blurred Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-60"
            />

            {/* Expanded Card */}
            <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-70 p-4">
              <motion.div
                layoutId={`card-${selectedItem._id || selectedItem.id}`}
                className="relative w-full max-w-lg bg-white rounded-xl p-4 border border-amber-200 shadow-2xl pointer-events-auto flex gap-5 overflow-hidden">
                {/* Close Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedItem(null);
                  }}
                  className="absolute top-2 right-2 z-10 p-1 bg-white/80 rounded-full hover:bg-amber-100 text-amber-800 transition-colors">
                  <X size={20} />
                </button>

                {/* Retained UI Content */}
                <div className="relative shrink-0 w-32 h-32">
                  <div className="absolute inset-0 bg-amber-100 rounded-2xl rotate-6" />
                  <div className="relative w-full h-full rounded-2xl overflow-hidden border-2 border-white shadow-sm">
                    <img
                      src={selectedItem.image}
                      alt={selectedItem.name}
                      className="w-full h-full object-cover scale-110" // Slightly scaled to look active
                      onError={(e) =>
                        (e.target.src = "https://via.placeholder.com/150")
                      }
                    />
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <div className="flex justify-between items-start pr-8">
                      <h3 className="font-serif font-bold text-xl text-stone-800 leading-tight">
                        {selectedItem.name}
                      </h3>
                    </div>
                    {/* Removed line-clamp to show full description in popup */}
                    <p className="text-sm text-stone-500 mt-2 leading-relaxed font-light">
                      {selectedItem.description}
                    </p>
                  </div>
                  <div className="flex justify-between items-end mt-3 border-t border-dashed border-stone-100 pt-3">
                    <span className="font-serif font-bold text-2xl text-amber-700">
                      ₹{selectedItem.price} /-
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
