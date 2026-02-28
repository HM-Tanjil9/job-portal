import express from "express";
import authRoutes from "./routes/auth.js";
import { connectKafka } from "./producer.js";

const app = express();
connectKafka();
app.use(express.json());
app.use("/auth", authRoutes);
export default app;