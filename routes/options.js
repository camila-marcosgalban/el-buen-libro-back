import express from "express";
import OptionSet from "../models/OptionSets.js";
import { emitToOrder } from "../server.js";

const router = express.Router();

router.get("/:type", async (req,res)=>{
  const set = await OptionSet.findOne({ type: req.params.type });
  res.json(set || { type: req.params.type, options: [] });
});

router.put("/:type", async (req,res)=>{
  const { options } = req.body;
  const set = await OptionSet.findOneAndUpdate({ type: req.params.type }, { type: req.params.type, options, updatedAt: new Date() }, { upsert: true, new: true });
  // Opcional: emitir evento global si tenés rooms por tipo
  res.json(set);
});

router.patch("/:type/:key", async (req,res)=>{
  const { price, isAvailable, label } = req.body;
  const set = await OptionSet.findOne({ type: req.params.type });
  if(!set) return res.status(404).json({message:"set not found"});
  const opt = set.options.find(o => o.key === req.params.key);
  if(!opt) return res.status(404).json({message:"option not found"});
  if (price !== undefined) opt.price = price;
  if (isAvailable !== undefined) opt.isAvailable = isAvailable;
  if (label !== undefined) opt.label = label;
  set.updatedAt = new Date();
  await set.save();
  res.json(set);
});

export default router;
