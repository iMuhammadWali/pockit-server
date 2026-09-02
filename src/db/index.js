import mongoose from "mongoose";
import config from "../config/config.js";
import dns from "dns";

export async function connectToDB() {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  if (!process.env.VERCEL) {
    try {
      dns.setServers(["1.1.1.1", "8.8.8.8"]);
    } catch (err) {
      console.warn("Could not set custom DNS servers:", err.message);
    }
  }

  try {
    await mongoose.connect(config.MONGO_URI);
    console.log("Connected to Database.");
  } catch (e) {
    console.error("Could not connect to Database.", e);
    throw e;
  }
}

