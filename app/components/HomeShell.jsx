"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  LockKeyhole,
  Mail,
  MapPin,
  Minus,
  Phone,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  UserRound,
  UserRoundPlus,
  X,
} from "lucide-react";
import AdminDashboard from "./AdminDashboard";
import PublicMenu from "./PublicMenu";

const emptyCustomerForm = { name: "", email: "", password: "" };
const emptyAdminForm = { username: "", password: "" };

function AuthModal({ customer, initialMode, onClose, onCustomer, onAdmin }) {
  const [mode, setMode] = useState(initialMode);
  const [customerForm, setCustomerForm] = useState(emptyCustomerForm);
  const [adminForm, setAdminForm] = useState(emptyAdminForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const changeMode = (nextMode) => {
    setMode(nextMode);
    setError("");
  };

  const submitCustomer = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    const endpoint =
      mode === "signup"
        ? "/api/auth/customer/signup"
        : "/api/auth/customer/login";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerForm),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to continue");
      onCustomer(data.customer);
      onClose();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const submitAdmin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adminForm),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Invalid credentials");
      onAdmin();
      onClose();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const logoutCustomer = async () => {
    setLoading(true);
    await fetch("/api/auth/customer/logout", { method: "POST" });
    onCustomer(null);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-amber-200 bg-[#fffdf7] shadow-2xl">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-linear-to-r from-amber-400 via-orange-600 to-amber-400" />
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-stone-100 p-2 text-stone-500 transition hover:bg-stone-200"
          aria-label="Close account panel">
          <X size={18} />
        </button>

        <div className="px-7 pb-7 pt-9">
          {customer && mode !== "admin" ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <CheckCircle2 size={32} />
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-700">Customer account</p>
              <h2 className="mt-2 text-2xl font-black text-stone-900">Welcome, {customer.name}</h2>
              <p className="mt-1 text-sm text-stone-500">{customer.email}</p>
              <button
                onClick={logoutCustomer}
                disabled={loading}
                className="mt-7 w-full rounded-xl border border-stone-300 px-4 py-3 font-bold text-stone-700 transition hover:bg-stone-100">
                Sign out
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
                  {mode === "admin" ? <ShieldCheck size={25} /> : <UserRound size={25} />}
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-700">
                  {mode === "admin" ? "Owner access" : "Easy Cheesy account"}
                </p>
                <h2 className="mt-1 text-3xl font-black tracking-tight text-stone-900">
                  {mode === "signup" ? "Create account" : mode === "admin" ? "Admin sign in" : "Welcome back"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-stone-500">
                  {mode === "admin"
                    ? "Manage categories, menu items, pricing and visibility."
                    : "Sign in now so your account is ready for ordering features."}
                </p>
              </div>

              {mode !== "admin" && (
                <div className="mb-5 grid grid-cols-2 rounded-xl bg-stone-100 p-1">
                  <button onClick={() => changeMode("login")} className={`rounded-lg py-2 text-sm font-bold ${mode === "login" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500"}`}>
                    Sign in
                  </button>
                  <button onClick={() => changeMode("signup")} className={`rounded-lg py-2 text-sm font-bold ${mode === "signup" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500"}`}>
                    Sign up
                  </button>
                </div>
              )}

              <form onSubmit={mode === "admin" ? submitAdmin : submitCustomer} className="space-y-4">
                {mode === "signup" && (
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500">Full name</span>
                    <div className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white px-4 focus-within:border-amber-500 focus-within:ring-4 focus-within:ring-amber-100">
                      <UserRoundPlus size={18} className="text-stone-400" />
                      <input required value={customerForm.name} onChange={(event) => setCustomerForm({ ...customerForm, name: event.target.value })} className="w-full bg-transparent py-3 outline-none" placeholder="Your name" />
                    </div>
                  </label>
                )}

                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500">{mode === "admin" ? "Username" : "Email"}</span>
                  <div className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white px-4 focus-within:border-amber-500 focus-within:ring-4 focus-within:ring-amber-100">
                    {mode === "admin" ? <UserRound size={18} className="text-stone-400" /> : <Mail size={18} className="text-stone-400" />}
                    <input
                      required
                      type={mode === "admin" ? "text" : "email"}
                      value={mode === "admin" ? adminForm.username : customerForm.email}
                      onChange={(event) => mode === "admin" ? setAdminForm({ ...adminForm, username: event.target.value }) : setCustomerForm({ ...customerForm, email: event.target.value })}
                      className="w-full bg-transparent py-3 outline-none"
                      placeholder={mode === "admin" ? "Admin username" : "you@example.com"}
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500">Password</span>
                  <div className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white px-4 focus-within:border-amber-500 focus-within:ring-4 focus-within:ring-amber-100">
                    <LockKeyhole size={18} className="text-stone-400" />
                    <input
                      required
                      minLength={mode === "signup" ? 8 : undefined}
                      type="password"
                      value={mode === "admin" ? adminForm.password : customerForm.password}
                      onChange={(event) => mode === "admin" ? setAdminForm({ ...adminForm, password: event.target.value }) : setCustomerForm({ ...customerForm, password: event.target.value })}
                      className="w-full bg-transparent py-3 outline-none"
                      placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
                    />
                  </div>
                </label>

                {error && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p>}

                <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-amber-700 to-orange-600 px-4 py-3.5 font-black text-white shadow-lg shadow-amber-200 transition hover:-translate-y-0.5 disabled:opacity-60">
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <>{mode === "signup" ? "Create my account" : "Sign in"}<ArrowRight size={19} /></>}
                </button>
              </form>

              <button onClick={() => changeMode(mode === "admin" ? "login" : "admin")} className="mt-5 w-full text-center text-xs font-bold text-stone-500 hover:text-amber-800">
                {mode === "admin" ? "Back to customer access" : "Restaurant owner? Admin sign in"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function CartPanel({ cart, onChangeQuantity, onRemove, onClose, onPlaced }) {
  const [details, setDetails] = useState({ phone: "", address: "", note: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const total = cart.reduce(
    (sum, entry) => sum + (entry.item.offerPrice ?? entry.item.price) * entry.quantity,
    0
  );

  const placeOrder = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map(({ item, quantity }) => ({ id: item._id, quantity })),
          ...details,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to place order");
      onPlaced(data.order);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex justify-end bg-stone-950/55 backdrop-blur-sm" onClick={onClose}>
      <aside className="h-full w-full max-w-md overflow-y-auto bg-[#fffdf7] shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-amber-100 bg-white/95 px-5 py-4 backdrop-blur">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">Your selection</p>
            <h2 className="text-2xl font-black text-stone-900">Order cart</h2>
          </div>
          <button onClick={onClose} className="rounded-full bg-stone-100 p-2"><X size={19} /></button>
        </div>

        <div className="space-y-3 p-5">
          {cart.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-amber-300 px-6 py-14 text-center">
              <ShoppingBag className="mx-auto text-amber-500" size={38} />
              <p className="mt-4 font-black text-stone-800">Your cart is empty</p>
              <p className="mt-1 text-sm text-stone-500">Add something delicious from the menu.</p>
            </div>
          ) : (
            cart.map(({ item, quantity }) => (
              <div key={item._id} className="flex items-center gap-3 rounded-2xl border border-amber-100 bg-white p-3 shadow-sm">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-amber-100 text-2xl">
                  {item.image ? (
                    <>
                      {/* Customer-provided menu images can come from different hosts. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image} alt="" className="h-full w-full object-cover" />
                    </>
                  ) : "🍽️"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-black text-stone-800">{item.name}</p>
                  <p className="text-sm font-bold text-amber-700">₹{item.offerPrice ?? item.price}</p>
                </div>
                <div className="flex items-center rounded-full border border-stone-200 bg-stone-50">
                  <button onClick={() => onChangeQuantity(item._id, -1)} className="p-2"><Minus size={14} /></button>
                  <span className="w-7 text-center text-sm font-black">{quantity}</span>
                  <button onClick={() => onChangeQuantity(item._id, 1)} className="p-2"><Plus size={14} /></button>
                </div>
                <button onClick={() => onRemove(item._id)} className="text-rose-500"><Trash2 size={17} /></button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <form onSubmit={placeOrder} className="space-y-4 border-t border-amber-100 p-5">
            <div className="flex items-center justify-between text-xl font-black text-stone-900">
              <span>Total</span><span>₹{total.toFixed(2)}</span>
            </div>
            <label className="block rounded-xl border border-stone-200 bg-white px-4 focus-within:border-amber-500">
              <span className="flex items-center gap-2 pt-3 text-xs font-bold uppercase text-stone-500"><Phone size={14} /> Phone</span>
              <input required value={details.phone} onChange={(event) => setDetails({ ...details, phone: event.target.value })} className="w-full py-2 outline-none" placeholder="Contact number" />
            </label>
            <label className="block rounded-xl border border-stone-200 bg-white px-4 focus-within:border-amber-500">
              <span className="flex items-center gap-2 pt-3 text-xs font-bold uppercase text-stone-500"><MapPin size={14} /> Delivery address</span>
              <textarea required value={details.address} onChange={(event) => setDetails({ ...details, address: event.target.value })} className="w-full resize-none py-2 outline-none" rows="2" placeholder="House, street and area" />
            </label>
            <textarea value={details.note} onChange={(event) => setDetails({ ...details, note: event.target.value })} className="w-full resize-none rounded-xl border border-stone-200 bg-white px-4 py-3 outline-none focus:border-amber-500" rows="2" placeholder="Cooking note (optional)" />
            {error && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</p>}
            <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 py-3.5 font-black text-white shadow-lg disabled:opacity-60">
              {loading ? <Loader2 className="animate-spin" size={20} /> : <><ShoppingBag size={18} /> Send order request</>}
            </button>
            <p className="text-center text-xs text-stone-500">The restaurant will approve or reject your request.</p>
          </form>
        )}
      </aside>
    </div>
  );
}

function OrdersPanel({ orders, loading, onClose }) {
  const statusStyle = {
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-emerald-100 text-emerald-800",
    rejected: "bg-rose-100 text-rose-800",
  };
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-stone-950/55 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-[#fffdf7] shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="sticky top-0 flex items-center justify-between border-b border-amber-100 bg-white/95 px-6 py-4 backdrop-blur">
          <div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">Track requests</p><h2 className="text-2xl font-black">My orders</h2></div>
          <button onClick={onClose} className="rounded-full bg-stone-100 p-2"><X size={19} /></button>
        </div>
        <div className="space-y-4 p-6">
          {loading ? <Loader2 className="mx-auto animate-spin text-amber-700" /> : orders.length === 0 ? <p className="py-12 text-center text-stone-500">No orders yet.</p> : orders.map((order) => (
            <article key={order._id} className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3"><div><p className="text-xs text-stone-400">#{order._id.slice(-6).toUpperCase()}</p><p className="mt-1 font-black text-stone-900">₹{order.total.toFixed(2)}</p></div><span className={`rounded-full px-3 py-1 text-xs font-black uppercase ${statusStyle[order.status]}`}>{order.status}</span></div>
              <p className="mt-3 text-sm text-stone-600">{order.items.map((item) => `${item.quantity}× ${item.name}`).join(" • ")}</p>
              <p className="mt-2 text-xs text-stone-400">{new Date(order.createdAt).toLocaleString()}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HomeShell({ initialCategories, initialItems, fetchError }) {
  const [view, setView] = useState("menu");
  const [customer, setCustomer] = useState(null);
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState(null);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/customer/session").then((response) => response.json()),
      fetch("/api/auth/admin/session").then((response) => response.json()),
    ]).then(([customerData, adminData]) => {
      setCustomer(customerData.customer || null);
      setAdminAuthenticated(Boolean(adminData.authenticated));
    });
  }, []);

  const addToCart = (item) => {
    setCart((current) => {
      const existing = current.find((entry) => entry.item._id === item._id);
      return existing
        ? current.map((entry) => entry.item._id === item._id ? { ...entry, quantity: Math.min(20, entry.quantity + 1) } : entry)
        : [...current, { item, quantity: 1 }];
    });
    if (!customer) setAuthMode("login");
    else setShowCart(true);
  };

  const openOrders = async () => {
    setShowOrders(true);
    setOrdersLoading(true);
    try {
      const response = await fetch("/api/orders");
      const data = await response.json();
      setOrders(data.orders || []);
    } finally {
      setOrdersLoading(false);
    }
  };

  if (view === "admin" && adminAuthenticated) {
    return (
      <AdminDashboard
        onExit={() => {
          setAdminAuthenticated(false);
          setView("menu");
        }}
      />
    );
  }

  return (
    <>
      <PublicMenu
        initialCategories={initialCategories}
        initialItems={initialItems}
        fetchError={fetchError}
        customer={customer}
        onAccount={() => setAuthMode("login")}
        onAdmin={() => adminAuthenticated ? setView("admin") : setAuthMode("admin")}
        onAddToCart={addToCart}
        onOpenCart={() => setShowCart(true)}
        onOpenOrders={openOrders}
        cartCount={cart.reduce((sum, entry) => sum + entry.quantity, 0)}
      />
      {authMode && (
        <AuthModal
          customer={customer}
          initialMode={authMode}
          onClose={() => setAuthMode(null)}
          onCustomer={(nextCustomer) => {
            setCustomer(nextCustomer);
            if (!nextCustomer) setCart([]);
          }}
          onAdmin={() => {
            setAdminAuthenticated(true);
            setView("admin");
          }}
        />
      )}
      {showCart && customer && (
        <CartPanel
          cart={cart}
          onClose={() => setShowCart(false)}
          onRemove={(id) => setCart((current) => current.filter((entry) => entry.item._id !== id))}
          onChangeQuantity={(id, change) => setCart((current) => current.map((entry) => entry.item._id === id ? { ...entry, quantity: Math.max(1, Math.min(20, entry.quantity + change)) } : entry))}
          onPlaced={(order) => {
            setCart([]);
            setShowCart(false);
            setOrders((current) => [order, ...current]);
            setShowOrders(true);
          }}
        />
      )}
      {showOrders && customer && <OrdersPanel orders={orders} loading={ordersLoading} onClose={() => setShowOrders(false)} />}
    </>
  );
}
