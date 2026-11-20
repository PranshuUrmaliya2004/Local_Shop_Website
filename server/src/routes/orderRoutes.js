import { Router } from "express";
import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import requireAdmin from "../middleware/requireAdmin.js";
import requireCustomer from "../middleware/requireCustomer.js";

const router = Router();

router.post("/", requireCustomer, async (request, response, next) => {
  try {
    const customerName = typeof request.body.customerName === "string" ? request.body.customerName.trim() : "";
    const phone = typeof request.body.phone === "string" ? request.body.phone.trim() : "";
    const address = typeof request.body.address === "string" ? request.body.address.trim() : "";
    const pincode = typeof request.body.pincode === "string" ? request.body.pincode.trim() : "";
    const paymentMethod = request.body.paymentMethod === undefined ? "whatsapp" : request.body.paymentMethod;
    const items = Array.isArray(request.body.items) ? request.body.items : [];
    if (paymentMethod !== "whatsapp" && paymentMethod !== "cod") {
      return response.status(400).json({ message: "Payment method must be WhatsApp confirmation or cash on delivery." });
    }
    if (!customerName || !phone || phone.length > 20 || !address || !/^[0-9]{6}$/.test(pincode) || items.length === 0) {
      return response.status(400).json({ message: "Customer name, phone, delivery address, 6-digit pincode and at least one item are required." });
    }

    const ids = items.map((item) => item.productId).filter((id) => mongoose.isValidObjectId(id));
    const products = await Product.find({ _id: { $in: ids } });
    const orderItems = [];
    let total = 0;
    for (const item of items) {
      const product = products.find((entry) => entry._id.toString() === item.productId);
      const quantity = Number(item.quantity);
      if (!product || !product.available || product.stock < quantity || !Number.isInteger(quantity) || quantity < 1) {
        return response.status(400).json({ message: "One or more items are unavailable or invalid." });
      }
      orderItems.push({ product: product._id, name: product.name, price: product.price, quantity });
      total += product.price * quantity;
    }

    for (const item of orderItems) {
      const updated = await Product.findOneAndUpdate(
        { _id: item.product, available: true, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true },
      );
      if (!updated) {
        return response.status(409).json({ message: "Stock changed while placing the order. Please review your basket." });
      }
    }

    const order = await Order.create({
      customer: request.customer.customerId,
      customerName,
      phone,
      address,
      pincode,
      paymentMethod,
      items: orderItems,
      total,
    });
    return response.status(201).json(order);
  } catch (error) {
    return next(error);
  }
});

router.get("/mine", requireCustomer, async (request, response, next) => {
  try {
    const orders = await Order.find({ customer: request.customer.customerId }).sort({ createdAt: -1 });
    return response.json(orders);
  } catch (error) {
    return next(error);
  }
});

router.get("/", requireAdmin, async (_request, response, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).populate("customer", "name email phone");
    return response.json(orders);
  } catch (error) {
    return next(error);
  }
});

router.patch("/:id/status", requireAdmin, async (request, response, next) => {
  if (!mongoose.isValidObjectId(request.params.id)) {
    return response.status(400).json({ message: "Invalid order ID." });
  }
  const allowed = ["pending", "confirmed", "packed", "delivered", "cancelled"];
  if (!allowed.includes(request.body.status)) {
    return response.status(400).json({ message: "Invalid order status." });
  }
  try {
    const order = await Order.findByIdAndUpdate(request.params.id, { status: request.body.status }, { new: true, runValidators: true });
    if (!order) {
      return response.status(404).json({ message: "Order not found." });
    }
    return response.json(order);
  } catch (error) {
    return next(error);
  }
});

router.delete("/:id", requireAdmin, async (request, response, next) => {
  if (!mongoose.isValidObjectId(request.params.id)) {
    return response.status(400).json({ message: "Invalid order ID." });
  }
  try {
    const order = await Order.findByIdAndDelete(request.params.id);
    if (!order) {
      return response.status(404).json({ message: "Order not found." });
    }
    return response.json({ message: "Order history deleted." });
  } catch (error) {
    return next(error);
  }
});

export default router;
