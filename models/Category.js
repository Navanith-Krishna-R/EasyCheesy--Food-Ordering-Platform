import mongoose from 'mongoose';

/**
 * CategorySchema
 * Note: 'slug' is the primary lookup key for SEO-friendly URLs.
 * High-read volume: Indexing is prioritized over write speed.
 */
const CategorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Category name is required'],
    trim: true, // Prevents " Pizza" vs "Pizza" duplicates
    maxlength: [200, 'Name cannot exceed 200 characters']
  },
  slug: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true,
    index: true // Ensures O(1) lookup for SEO-friendly routes
  },
  isVisible: { 
    type: Boolean, 
    default: true,
    index: true // Useful for filtering public menus efficiently
  },
}, { 
  timestamps: true,
  // Optimization: Remove __v version key from JSON responses to save bandwidth
  toJSON: { transform: (doc, ret) => { delete ret.__v; return ret; } }
});

// Compound Index: Optimizes queries filtering by visibility AND name
CategorySchema.index({ isVisible: 1, name: 1 });

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);