import "dotenv/config";
import mongoose from "mongoose";
import Product from "../models/Product.js";

if (!process.env.MONGODB_URI) {
  throw new Error("Set MONGODB_URI in server/.env.");
}

const sampleProducts = [
  { name: "Basmati Rice (1 kg)", category: "Grocery", price: 120, stock: 25 },
  { name: "Toor Dal (1 kg)", category: "Grocery", price: 145, stock: 18 },
  { name: "Sunflower Oil (1 L)", category: "Grocery", price: 165, stock: 20 },
  { name: "Bathing Soap (125 g)", category: "Personal Care", price: 38, stock: 40 },
  { name: "Hand Wash (200 ml)", category: "Personal Care", price: 85, stock: 15 },
  { name: "Dishwash Bar", category: "Home", price: 25, stock: 30 },
  { name: "Laundry Detergent (1 kg)", category: "Home", price: 110, stock: 12 },
  { name: "Salted Chips", category: "Snacks", price: 20, stock: 35 },
];

try {
  await mongoose.connect(process.env.MONGODB_URI);
  for (const product of sampleProducts) {
    await Product.updateOne(
      { name: product.name },
      { $setOnInsert: product },
      { upsert: true },
    );
  }
  console.log(`Sample products ready (${sampleProducts.length} products).`);
} catch (error) {
  console.error("Could not add sample products:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
