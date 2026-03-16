import mongoose from "mongoose";

const uri = process.env.MONGO_URI;

if (!uri) {
  console.error("MONGO_URI is not defined");
}

mongoose.connect(uri as string)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));
