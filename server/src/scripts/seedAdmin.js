import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import Admin from "../models/Admin.js";

const { MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

if (!MONGODB_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  throw new Error("Set MONGODB_URI, ADMIN_EMAIL, and ADMIN_PASSWORD in server/.env.");
}
if (ADMIN_PASSWORD.length < 12) {
  throw new Error("ADMIN_PASSWORD must be at least 12 characters.");
}

try {
  await mongoose.connect(MONGODB_URI);
  const email = ADMIN_EMAIL.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await Admin.findOneAndUpdate(
    { email },
    { email, passwordHash },
    { upsert: true, new: true, runValidators: true },
  );
  console.log(`Admin account ready for ${email}.`);
} catch (error) {
  console.error("Could not create the admin account:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
