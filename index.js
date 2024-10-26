import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 8080;
const databaseURL = process.env.DATABASE_URL;

app.use(
  cors({
    origin: process.env.ORIGIN,
    methods: ["GET", "PUT", "POST", "PATCH", "DELETE"],
    credentials: true, // when you use cookie that time you need to make it true.
  })
);

app.use('/uploads/profiles', express.static("uploads/profiles"))

app.use(cookieParser()); // frontend will send some cookies some that we need this cookie-parser.

app.use(express.json());

app.use("/api/auth", authRoutes);

const connectDB = async () => {
  try {
    await mongoose.connect(databaseURL);
    console.log("MongoDB connected...");
  } catch (error) {
    console.log(error);
  }
};

connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});