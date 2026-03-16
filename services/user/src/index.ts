import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/user.js";
import cors from "cors";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/user", userRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
