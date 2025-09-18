import Sandwich from "../models/Sandwich.js";
import Order from "../models/Order.js";

export async function recalcTotals(orderId) {
  const order = await Order.findById(orderId);
  if (!order) return;

  const items = await Sandwich.find({ orderId });
  const subtotal = items.reduce((a, s) => a + (s.price || 0), 0);
  const extras = (order.deliveryFee || 0) + Math.round(subtotal * (order.tipPercent || 0) / 100);
  const grandTotal = subtotal + extras;

  order.totals = {
    items: items.reduce((a,s)=>a + (s.quantity || 1), 0),
    subtotal, extras, grandTotal
  };
  await order.save();
  return order;
}
