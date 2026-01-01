import mongoose from 'mongoose';

/**
 * MenuItemSchema
 * Design Note: Using ObjectId for category to ensure referential integrity.
 * Price is stored as a Number, but should be handled as 'cents' if precision is critical.
 */
const MenuItemSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true,
    index: true 
  },
  description: { 
    type: String, 
    required: true,
    trim: true 
  },
  price: { 
    type: Number, 
    required: true,
    min: [0, 'Price cannot be negative'] 
  },
  offerPrice: {
    type: Number,
    min: [0, 'Offer price cannot be negative'],
    default: null // Defaults to null so we know when no offer exists
  },
  // Link to Category model
  category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category', 
    required: true,
    index: true // Crucial for "Filter by Category" performance
  },
  image: { 
    type: String, 
    default: '/images/default-food.png' // Fallback to avoid broken UI
  },
  isVisible: { 
    type: Boolean, 
    default: true,
    index: true 
  },
}, { 
  timestamps: true,
  toJSON: { virtuals: true }, // Allows joining data
  toObject: { virtuals: true }
});

// Compound index for the most common query: "Show visible items in a specific category"
MenuItemSchema.index({ category: 1, isVisible: 1 });

export default mongoose.models.MenuItem || mongoose.model('MenuItem', MenuItemSchema);