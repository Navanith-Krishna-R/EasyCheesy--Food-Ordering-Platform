import mongoose from 'mongoose';

const MenuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String, required: false },
  isVisible: { type: Boolean, default: true }, // Controls Item Visibility
}, { timestamps: true });

export default mongoose.models.MenuItem || mongoose.model('MenuItem', MenuItemSchema);