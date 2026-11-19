import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Customer from "../models/Customer.js";
import requireAdmin from "../middleware/requireAdmin.js";

const router = Router();

router.post("/login", async (request, response, next) => {
  const email = typeof request.body.email === "string" ? request.body.email.trim().toLowerCase() : "";
  const password = typeof request.body.password === "string" ? request.body.password : "";

  if (!email || !password) {
    return response.status(400).json({ message: "Email and password are required." });
  }

  try {
    const admin = await Admin.findOne({ email });
    const passwordMatches = admin
      ? await bcrypt.compare(password, admin.passwordHash)
      : false;

    if (!admin || !passwordMatches) {
      return response.status(401).json({ message: "Email or password is incorrect." });
    }

    const token = jwt.sign(
      { adminId: admin._id.toString(), email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "8h" },
    );
    return response.json({ token });
  } catch (error) {
    return next(error);
  }
});

router.get("/dashboard", requireAdmin, async (_request, response, next) => {
  try {
    const [productCount, customerCount, orderCount, revenueResult, recentOrders] = await Promise.all([
      Product.countDocuments(),
      Customer.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $group: { _id: null, revenue: { $sum: "$total" } } },
      ]),
      Order.find().sort({ createdAt: -1 }).limit(5),
    ]);
    return response.json({
      productCount,
      customerCount,
      orderCount,
      revenue: revenueResult[0]?.revenue || 0,
      recentOrders,
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
