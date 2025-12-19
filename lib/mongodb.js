import mongoose from 'mongoose';

/**
 * DATABASE_CONNECTION_SINGLETON
 * Prevents multiple active connections in serverless environments (e.g., Next.js/AWS Lambda).
 */

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('CRITICAL: MONGODB_URI is missing from environment variables.');
}

/**
 * Global is used here to maintain a cached connection across hot-reloads in development
 * and shared execution contexts in production.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Fail fast if trying to use models before connection
      maxPoolSize: 30,     // Prevents exhausting DB resources
      serverSelectionTimeoutMS: 5000, 
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((instance) => {
      return instance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    // Reset the cache on failure so the next request can attempt a fresh connection
    cached.promise = null;
    console.error('MONGODB_CONNECTION_ERROR:', error.message);
    throw error;
  }

  return cached.conn;
}

export default dbConnect;