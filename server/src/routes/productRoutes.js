import { Router } from "express";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import requireAdmin from "../middleware/requireAdmin.js";

const router = Router();

function validateProductInput(body) {
  const errors = [];
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const category = typeof body.category === "string" ? body.category.trim() : "";
  const price = Number(body.price);
  const stock = Number(body.stock);
  const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";

  if (!name || name.length > 100) {
    errors.push("Product name is required and must be at most 100 characters.");
  }
  if (!category || category.length > 50) {
    errors.push("Category is required and must be at most 50 characters.");
  }
  if (!Number.isFinite(price) || price < 0) {
    errors.push("Price must be a non-negative number.");
  }
  if (!Number.isInteger(stock) || stock < 0) {
    errors.push("Stock must be a non-negative whole number.");
  }
  if (imageUrl && imageUrl.length > 2048) {
    errors.push("Image URL must be at most 2048 characters.");
  } else if (imageUrl) {
    try {
      const parsedUrl = new URL(imageUrl);
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        errors.push("Image URL must use HTTP or HTTPS.");
      }
    } catch {
      errors.push("Image URL must be a valid URL.");
    }
  }
  if (body.available !== undefined && typeof body.available !== "boolean") {
    errors.push("Availability must be true or false.");
  }

  return {
    errors,
    values: { name, category, price, stock, imageUrl, available: body.available ?? true },
  };
}

router.get("/", async (_request, response, next) => {
  try {
    const products = await Product.find().sort({ name: 1 }).lean();
    response.json(products);
  } catch (error) {
    next(error);
  }
});

router.post("/", requireAdmin, async (request, response, next) => {
  try {
    const { errors, values } = validateProductInput(request.body);
    if (errors.length > 0) {
      return response.status(400).json({ message: errors.join(" ") });
    }
    const product = await Product.create(values);
    return response.status(201).json(product);
  } catch (error) {
    return next(error);
  }
});

router.put("/:id", requireAdmin, async (request, response, next) => {
  if (!mongoose.isValidObjectId(request.params.id)) {
    return response.status(400).json({ message: "Invalid product ID." });
  }

  try {
    const { errors, values } = validateProductInput(request.body);
    if (errors.length > 0) {
      return response.status(400).json({ message: errors.join(" ") });
    }
    const product = await Product.findByIdAndUpdate(request.params.id, values, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return response.status(404).json({ message: "Product not found." });
    }
    return response.json(product);
  } catch (error) {
    return next(error);
  }
});

router.delete("/:id", requireAdmin, async (request, response, next) => {
  if (!mongoose.isValidObjectId(request.params.id)) {
    return response.status(400).json({ message: "Invalid product ID." });
  }

  try {
    const product = await Product.findByIdAndDelete(request.params.id);
    if (!product) {
      return response.status(404).json({ message: "Product not found." });
    }
    return response.status(204).end();
  } catch (error) {
    return next(error);
  }
});

export default router;
