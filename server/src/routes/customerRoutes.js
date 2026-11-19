import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Customer from "../models/Customer.js";
import requireCustomer from "../middleware/requireCustomer.js";

const router = Router();

function createToken(customer) {
  return jwt.sign(
    { customerId: customer._id.toString(), role: "customer", email: customer.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.CUSTOMER_JWT_EXPIRES_IN || "30d" },
  );
}

router.post("/register", async (request, response, next) => {
  try {
    const name = typeof request.body.name === "string" ? request.body.name.trim() : "";
    const email = typeof request.body.email === "string" ? request.body.email.trim().toLowerCase() : "";
    const phone = typeof request.body.phone === "string" ? request.body.phone.trim() : "";
    const password = typeof request.body.password === "string" ? request.body.password : "";
    if (!name || !email || !password) {
      return response.status(400).json({ message: "Name, email and password are required." });
    }
    if (password.length < 8) {
      return response.status(400).json({ message: "Password must be at least 8 characters." });
    }
    if (await Customer.findOne({ email })) {
      return response.status(409).json({ message: "An account with this email already exists." });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const customer = await Customer.create({ name, email, phone, passwordHash });
    return response.status(201).json({
      token: createToken(customer),
      customer: { id: customer._id, name: customer.name, email: customer.email, phone: customer.phone, favorites: customer.favorites || [] },
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/login", async (request, response, next) => {
  try {
    const email = typeof request.body.email === "string" ? request.body.email.trim().toLowerCase() : "";
    const password = typeof request.body.password === "string" ? request.body.password : "";
    const customer = await Customer.findOne({ email });
    if (!customer || !(await bcrypt.compare(password, customer.passwordHash))) {
      return response.status(401).json({ message: "Email or password is incorrect." });
    }
    return response.json({
      token: createToken(customer),
      customer: { id: customer._id, name: customer.name, email: customer.email, phone: customer.phone, favorites: customer.favorites || [] },
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/profile", requireCustomer, async (request, response, next) => {
  try {
    const customer = await Customer.findById(request.customer.customerId).select("-passwordHash");
    if (!customer) {
      return response.status(404).json({ message: "Profile not found." });
    }
    return response.json(customer);
  } catch (error) {
    return next(error);
  }
});

router.put("/profile", requireCustomer, async (request, response, next) => {
  try {
    const name = typeof request.body.name === "string" ? request.body.name.trim() : "";
    const phone = typeof request.body.phone === "string" ? request.body.phone.trim() : "";
    if (!name) {
      return response.status(400).json({ message: "Name is required." });
    }
    const customer = await Customer.findByIdAndUpdate(
      request.customer.customerId,
      { name, phone },
      { new: true, runValidators: true },
    ).select("-passwordHash");
    if (!customer) {
      return response.status(404).json({ message: "Profile not found." });
    }
    return response.json(customer);
  } catch (error) {
    return next(error);
  }
});

router.put("/wishlist", requireCustomer, async (request, response, next) => {
  try {
    const productIds = Array.isArray(request.body.productIds) ? request.body.productIds : [];
    const favorites = [...new Set(productIds.filter((id) => mongoose.isValidObjectId(id)))];
    const customer = await Customer.findByIdAndUpdate(
      request.customer.customerId,
      { favorites },
      { new: true, runValidators: true },
    ).select("-passwordHash");
    if (!customer) {
      return response.status(404).json({ message: "Profile not found." });
    }
    return response.json({ favorites: customer.favorites.map((id) => id.toString()) });
  } catch (error) {
    return next(error);
  }
});

export default router;
