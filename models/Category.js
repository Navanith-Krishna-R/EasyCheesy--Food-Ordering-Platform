import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true }, 
}, { timestamps: true });

// Check if model exists to prevent overwrite error in hot-reload
export default mongoose.models.Category || mongoose.model('Category', CategorySchema);