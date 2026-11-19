import "dotenv/config";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import adminRoutes from "./routes/adminRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import Product from "./models/Product.js";
import Order from "./models/Order.js";
import Customer from "./models/Customer.js";

const requiredEnvironment = ["MONGODB_URI", "JWT_SECRET"];
const missingEnvironment = requiredEnvironment.filter((key) => !process.env[key]);

if (missingEnvironment.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvironment.join(", ")}`);
}
if (process.env.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters long.");
}

const app = express();
const port = Number(process.env.PORT) || 5000;
const localOrigins = ["http://localhost:5173", "http://localhost:5174"];
const configuredOrigins = (process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = new Set(configuredOrigins.length > 0 ? configuredOrigins : localOrigins);
if (process.env.NODE_ENV !== "production") {
  localOrigins.forEach((origin) => allowedOrigins.add(origin));
}

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }
    callback(null, false);
  },
}));
app.use(express.json({ limit: "20kb" }));

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});
app.use("/api/products", productRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/orders", orderRoutes);

app.use((error, _request, response, _next) => {
  console.error(error);
  if (error.name === "ValidationError") {
    return response.status(400).json({ message: error.message });
  }
  if (error.code === 11000) {
    return response.status(409).json({ message: "A record with that value already exists." });
  }
  response.status(500).json({ message: "An unexpected server error occurred." });
});

async function startServer() {
  await mongoose.connect(process.env.MONGODB_URI);
  app.listen(port, () => {
    console.log(`Shop API listening on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error("Could not start the server:", error.message);
  process.exitCode = 1;
});
