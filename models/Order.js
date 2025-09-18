import mongoose from "mongoose";
const TotalsSchema = new mongoose.Schema({
  items: { type: Number, default: 0 },
  subtotal: { type: Number, default: 0 },
  extras: { type: Number, default: 0 },
  grandTotal: { type: Number, default: 0 }
}, {_id:false});
const OrderSchema = new mongoose.Schema({
  code: { type: String, unique: true },
  title: String,
  status: { type: String, enum: ["open","locked","sent","delivered"], default:"open" },
  ownerName: String,
  restaurant: { type: String, default: "El Buen Libro" },
  tipPercent: { type: Number, default: 0 },
  deliveryFee: { type: Number, default: 0 },
  totals: { type: TotalsSchema, default: () => ({}) },
  createdAt: { type: Date, default: Date.now }
});
export default mongoose.model("Order", OrderSchema);
