"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMovie() {
      try {
        const response = await fetch("/api/movie");
        const data = await response.json();
        setMovie(data);
      } catch (error) {
        console.error("Failed to fetch movie:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMovie();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!movie) return <div>No data found</div>;

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>{movie.title || movie.name || "Movie"}</h1>
      <pre style={{ backgroundColor: "#f5f5f5", padding: "1rem", borderRadius: "8px" }}>
        {JSON.stringify(movie, null, 2)}
      </pre>
    </main>
  );
}
