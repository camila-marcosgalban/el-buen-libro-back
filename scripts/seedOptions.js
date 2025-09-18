import mongoose from "mongoose";
import dotenv from "dotenv";
import OptionSet from "../models/OptionSets.js";

dotenv.config();
await mongoose.connect(process.env.MONGO_URI);

await OptionSet.deleteMany({});
await OptionSet.create([
  { type:"bread", options:[
    {key:"baguette", label:"Baguette", price:0},
    {key:"pan-arabe", label:"Pan Arabe", price:100}
  ]},
  { type:"protein", options:[
    {key:"mila-carne", label:"Milanesa de Carne", price:1200},
    {key:"mila-pollo", label:"Milanesa de Pollo", price:1100},
    {key:"sin-mila", label:"Sin milanesa", price:0}
  ]},
  { type:"topping", options:[
    {key:"lechuga", label:"Lechuga", price:0},
    {key:"tomate", label:"Tomate", price:0},
    {key:"queso", label:"Queso", price:300},
    {key:"huevo", label:"Huevo", price:300},
    {key:"jamon", label:"Jamón", price:350},
    {key:"mayonesa", label:"Mayonesa", price:0},
    {key:"mostaza", label:"Mostaza", price:0}
  ]}
]);

console.log("Seed listo");
process.exit(0);
