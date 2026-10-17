import { Router } from "express";
import { supabase, nextCounter } from "../supabase.js";
import { requireAuth } from "../middleware.js";
import { pad } from "../helpers.js";

const router = Router();

// Validates the numeric product fields. Returns an error message string, or
// null when every provided field is valid. `partial` allows PATCH to skip
// fields that were not supplied.
function validateProductNumbers({ width, height, cost, price }, { partial } = {}) {
  const checks = [
    { key: "width", value: width, positive: true },
    { key: "height", value: height, positive: true },
    { key: "cost", value: cost, positive: false },
    { key: "price", value: price, positive: false },
  ];

  for (const { key, value, positive } of checks) {
    if (value === undefined && partial) continue;
    const num = Number(value);
    if (!Number.isFinite(num)) {
      return `${key} must be a valid number.`;
    }
    if (positive && num <= 0) {
      return `${key} must be greater than 0.`;
    }
    if (!positive && num < 0) {
      return `${key} cannot be negative.`;
    }
  }
  return null;
}

function mapProduct(p) {
  return {
    id: p.id,
    sku: p.sku,
    name: p.name,
    width: Number(p.width),
    height: Number(p.height),
    cost: Number(p.cost),
    price: Number(p.price),
    image: p.image_url || "",
  };
}

router.get("/", requireAuth, async (_req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) throw error;
    res.json(data.map(mapProduct));
  } catch (err) {
    next(err);
  }
});

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const { name, width, height, cost, price, image } = req.body;
    if (!name || width == null || height == null) {
      return res.status(400).json({ error: "Name, width and height are required." });
    }

    const normalizedCost = cost ?? 0;
    const normalizedPrice = price ?? 0;
    const validationError = validateProductNumbers({
      width,
      height,
      cost: normalizedCost,
      price: normalizedPrice,
    });
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const seq = await nextCounter("product_seq");
    const sku = `WM-PROD-${pad(seq, 3)}`;

    const { data, error } = await supabase
      .from("products")
      .insert({
        sku,
        name,
        width: Number(width),
        height: Number(height),
        cost: Number(normalizedCost),
        price: Number(normalizedPrice),
        image_url: image ?? "",
      })
      .select("*")
      .single();
    if (error) throw error;

    res.status(201).json(mapProduct(data));
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", requireAuth, async (req, res, next) => {
  try {
    const { name, width, height, cost, price, image } = req.body;

    const validationError = validateProductNumbers(
      { width, height, cost, price },
      { partial: true }
    );
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const update = {};
    if (name !== undefined) update.name = name;
    if (width !== undefined) update.width = Number(width);
    if (height !== undefined) update.height = Number(height);
    if (cost !== undefined) update.cost = Number(cost);
    if (price !== undefined) update.price = Number(price);
    if (image !== undefined) update.image_url = image;

    const { data, error } = await supabase
      .from("products")
      .update(update)
      .eq("id", req.params.id)
      .select("*")
      .single();
    if (error) throw error;

    res.json(mapProduct(data));
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
