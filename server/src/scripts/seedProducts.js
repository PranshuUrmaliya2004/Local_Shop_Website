import "dotenv/config";
import { connectDatabase, disconnectDatabase } from "../config/database.js";
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
  { name: "Wheat Flour (5 kg)", category: "Grocery", price: 240, stock: 20 },
  { name: "Sugar (1 kg)", category: "Grocery", price: 48, stock: 35 },
  { name: "Tea Leaves (250 g)", category: "Grocery", price: 115, stock: 20 },
  { name: "Milk (1 L)", category: "Fresh Products", price: 60, stock: 24 },
  { name: "Bread (400 g)", category: "Fresh Products", price: 45, stock: 18 },
  { name: "Eggs (6 pcs)", category: "Fresh Products", price: 54, stock: 30 },
  { name: "Apples (1 kg)", category: "Fresh Products", price: 160, stock: 12 },
  { name: "Shampoo (180 ml)", category: "Personal Care", price: 120, stock: 15 },
  { name: "Toothpaste (150 g)", category: "Personal Care", price: 95, stock: 18 },
  { name: "Floor Cleaner (1 L)", category: "Home", price: 105, stock: 15 },
  { name: "Toilet Tissue (4 rolls)", category: "Home", price: 75, stock: 20 },
  { name: "Namkeen Mix (400 g)", category: "Snacks", price: 55, stock: 24 },
];

try {
  await connectDatabase();
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
  await disconnectDatabase();
}
