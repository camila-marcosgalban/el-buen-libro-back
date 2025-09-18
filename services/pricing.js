import OptionSet from "../models/OptionSets.js";

export async function priceOf({ bread, protein, toppings=[] }) {
  const sets = await OptionSet.find({ type: { $in: ["bread","protein","topping"] } });
  const map = Object.fromEntries(sets.map(s => [s.type, s.options]));
  const findOpt = (type, key) => (map[type] || []).find(o => o.key === key) || { key, label: key, price: 0 };

  const b = findOpt("bread", bread?.key || bread);
  const p = protein?.key ? findOpt("protein", protein.key) : findOpt("protein", protein);
  const pKind = protein?.kind || (p.key?.includes("pollo") ? "pollo" : p.key?.includes("carne") ? "carne" : "none");

  const tops = (toppings || []).map(t => findOpt("topping", t.key || t));

  return {
    bread: { key: b.key, label: b.label, price: b.price },
    protein: { key: p.key, label: p.label, price: p.price, kind: pKind },
    toppings: tops.map(t => ({ key: t.key, label: t.label, price: t.price }))
  };
}
