import express, { type Express } from "express";
import cors from "cors";
import { connectMongoDB } from "./db/mongodb";
import router from "./routes";

const app: Express = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

connectMongoDB().catch((err) => {
  console.error("Failed to connect to MongoDB:", err);
  process.exit(1);
});

app.use("/api", router);

export default app;
