import express from "express";
import Order from "../models/Order.js";
import Sandwich from "../models/Sandwich.js";
import { emitToOrder } from "../server.js";
import { priceOf } from "../services/pricing.js";
import { recalcTotals } from "../services/totals.js";

const router = express.Router();

// Create sandwich (auto-calc if price is null/omitted)
router.post("/:code/sandwiches", async (req,res)=>{
  const order = await Order.findOne({ code: req.params.code });
  if(!order || order.status!=="open") return res.status(400).json({message:"Pedido no disponible"});
  const { ownerName, bread, protein, toppings=[], notes, quantity=1, price = undefined } = req.body;

  const priced = await priceOf({ bread, protein, toppings });

  let finalPrice = null;
  if (price === undefined || price === null) {
    // auto-calc from catalog
    const base = (priced.bread.price || 0) + (priced.protein.price || 0) + (priced.toppings || []).reduce((a,t)=>a+(t.price||0),0);
    finalPrice = base * (quantity || 1);
  } else {
    finalPrice = price;
  }

  const sw = await Sandwich.create({ orderId: order._id, ownerName, ...priced, notes, quantity, price: finalPrice });

  await recalcTotals(order._id);
  emitToOrder(order.code, "sandwich:added", sw);
  res.status(201).json(sw);
});

// Update sandwich
router.patch("/:id", async (req,res)=>{
  const sw = await Sandwich.findById(req.params.id);
  if(!sw) return res.status(404).json({message:"Not found"});

  const { bread, protein, toppings, notes, quantity, ownerName, price } = req.body;
  let recalcNeeded = false;

  if (bread || protein || toppings) {
    const priced = await priceOf({ bread: bread ?? sw.bread, protein: protein ?? sw.protein, toppings: toppings ?? sw.toppings });
    sw.bread = priced.bread;
    sw.protein = priced.protein;
    sw.toppings = priced.toppings;
    recalcNeeded = true;
  }
  if (notes !== undefined) sw.notes = notes;
  if (quantity !== undefined) { sw.quantity = quantity; recalcNeeded = true; }
  if (ownerName !== undefined) sw.ownerName = ownerName;

  if (price === null) {
    // explicit null => recalc
    const base = (sw.bread.price || 0) + (sw.protein.price || 0) + (sw.toppings || []).reduce((a,t)=>a+(t.price||0),0);
    sw.price = base * (sw.quantity || 1);
  } else if (price !== undefined) {
    // explicit override
    sw.price = price;
  } else if (recalcNeeded && sw.price != null) {
    // if user previously had a price (auto or manual), and composition/quantity changed, recalc only if it was auto (we can't distinguish cleanly).
    // For simplicity we recalc when recalcNeeded and price not provided and price exists -> recompute as auto baseline.
    const base = (sw.bread.price || 0) + (sw.protein.price || 0) + (sw.toppings || []).reduce((a,t)=>a+(t.price||0),0);
    sw.price = base * (sw.quantity || 1);
  }

  await sw.save();
  const order = await Order.findById(sw.orderId);
  await recalcTotals(order._id);
  emitToOrder(order.code, "sandwich:updated", sw);
  res.json(sw);
});

// Duplicate sandwich
router.post("/:id/duplicate", async (req,res)=>{
  const src = await Sandwich.findById(req.params.id);
  if(!src) return res.status(404).json({message:"Not found"});
  const order = await Order.findById(src.orderId);
  if(!order || order.status!=="open") return res.status(400).json({message:"Pedido no disponible"});

  const ownerName = req.body.ownerName ?? src.ownerName;
  const copy = await Sandwich.create({
    orderId: src.orderId,
    ownerName,
    bread: src.bread,
    protein: src.protein,
    toppings: src.toppings,
    notes: src.notes,
    quantity: src.quantity,
    price: (req.body.price !== undefined) ? req.body.price : src.price
  });

  await recalcTotals(order._id);
  emitToOrder(order.code, "sandwich:added", copy);
  res.status(201).json(copy);
});

// Delete sandwich
router.delete("/:id", async (req,res)=>{
  const sw = await Sandwich.findByIdAndDelete(req.params.id);
  if(!sw) return res.status(404).json({message:"Not found"});
  const order = await Order.findById(sw.orderId);
  await recalcTotals(order._id);
  emitToOrder(order.code, "sandwich:deleted", sw._id);
  res.json({ ok:true });
});

export default router;
