import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  isVisible: { type: Boolean, default: true }, // Controls Category Visibility
}, { timestamps: true });

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);