import mongoose from "mongoose";
const OptionSchema = new mongoose.Schema({
  key: { type: String, required: true },
  label: { type: String, required: true },
  price: { type: Number, default: 0 },
  isAvailable: { type: Boolean, default: true }
});
const OptionSetSchema = new mongoose.Schema({
  type: { type: String, enum: ["bread","protein","topping"], required: true },
  options: [OptionSchema],
  updatedAt: { type: Date, default: Date.now }
});
export default mongoose.model("OptionSet", OptionSetSchema);
