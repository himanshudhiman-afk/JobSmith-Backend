import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDB() {
  mongoose.set("strictQuery", true);
  try {
    await mongoose.connect(env.mongoUri);
    console.log(`[db] connected to MongoDB (${mongoose.connection.name})`);
  } catch (err) {
    console.error("[db] connection failed:", err.message);
    throw err;
  }

  mongoose.connection.on("error", (err) => {
    console.error("[db] connection error:", err.message);
  });
  mongoose.connection.on("disconnected", () => {
    console.warn("[db] disconnected");
  });
}

export async function disconnectDB() {
  await mongoose.disconnect();
}
