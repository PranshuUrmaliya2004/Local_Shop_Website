import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", default: null },
    customerName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    address: { type: String, trim: true, default: "" },
    pincode: { type: String, trim: true, default: "" },
    paymentMethod: {
      type: String,
      enum: ["whatsapp", "cod"],
      default: "whatsapp",
      required: true,
    },
    items: { type: [orderItemSchema], required: true },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "packed", "delivered", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Order", orderSchema);
