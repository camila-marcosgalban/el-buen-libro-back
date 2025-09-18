import mongoose from "mongoose";
const SandwichSchema = new mongoose.Schema({
  orderId: { type: mongoose.Types.ObjectId, ref: "Order", index: true },
  ownerName: { type: String, required: true }, // Para quién es
  bread: { key: String, label: String, price: Number },
  protein: { key: String, label: String, price: Number, kind: {type: String, enum:["carne","pollo","none"]} },
  toppings: [{ key: String, label: String, price: Number }],
  notes: String,
  quantity: { type: Number, default: 1 },
  price: { type: Number, default: null }, // precio individual opcional (a futuro)
  total: { type: Number, default: null }, // deprecado: mantenido por compatibilidad
  createdAt: { type: Date, default: Date.now }
});
export default mongoose.model("Sandwich", SandwichSchema);
