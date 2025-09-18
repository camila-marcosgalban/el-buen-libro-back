import express from "express";
import Order from "../models/Order.js";
import Sandwich from "../models/Sandwich.js";
import { emitToOrder } from "../server.js";
import { recalcTotals } from "../services/totals.js";
import { makeCode } from "../services/code.js";

const router = express.Router();

router.post("/", async (req,res)=>{
  const { title, ownerName } = req.body;
  const code = makeCode();
  const order = await Order.create({ title, ownerName, code });
  emitToOrder(code, "order:update", order);
  res.json(order);
});

router.get("/:code", async (req,res)=>{
  const order = await Order.findOne({ code: req.params.code });
  if(!order) return res.status(404).json({message:"Not found"});
  const sandwiches = await Sandwich.find({ orderId: order._id });
  res.json({ order, sandwiches });
});

router.patch("/:code", async (req,res)=>{
  const order = await Order.findOneAndUpdate({code:req.params.code}, req.body, {new:true});
  await recalcTotals(order._id);
  emitToOrder(order.code, "order:update", order);
  res.json(order);
});

router.post("/:code/lock", async (req,res)=>{
  const order = await Order.findOneAndUpdate({code:req.params.code}, {status:"locked"}, {new:true});
  emitToOrder(order.code, "order:update", order);
  res.json(order);
});

export default router;
