"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, ChevronRight } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        // Success! The cookie is set automatically by the server.
        // We just redirect.
        router.refresh(); // Refresh to ensure middleware sees the new cookie
        router.push("/admin");
      } else {
        setError("Invalid credentials");
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-orange-100 relative">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={28} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Admin Portal</h2>
          <p className="text-gray-500 text-sm mt-1">
            Please sign in to manage the menu
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />

          {error && <p className="text-red-500 text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2 transition">
            {loading ? "Signing in..." : "Sign In"}
            <ChevronRight size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
