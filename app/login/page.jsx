"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Lock, ChevronRight } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const usernameRef = useRef(null); // Ref for auto-focus
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Focus the username field on mount for better UX
  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(""); // Clear error when user starts typing again
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", { // Updated to match our auth path
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        // refresh() tells Next.js to re-run Server Components (like your Navbar/Sidebar)
        // push() then moves the user to the dashboard
        router.refresh();
        router.push("/admin");
      } else {
        const data = await res.json();
        setError(data.error || "Invalid credentials");
      }
    } catch (err) {
      setError("Unable to connect to server. Check your internet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-sm w-full max-w-md border border-gray-200">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gray-100 text-gray-900 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Lock size={24} />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900">Admin Portal</h2>
          <p className="text-gray-500 text-sm mt-2">Enter credentials to access the dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              id="username"
              name="username"
              ref={usernameRef}
              type="text"
              required
              autoComplete="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black outline-none transition-all"
              placeholder="Admin username"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div role="alert" className="p-3 bg-red-50 border border-red-100 rounded-md">
              <p className="text-red-600 text-sm text-center font-medium">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black hover:bg-gray-800 text-white font-medium py-2.5 rounded-md flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
            {!loading && <ChevronRight size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
}