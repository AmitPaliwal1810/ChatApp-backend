import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import contactsRoutes from "./routes/contactsRoutes.js";
import setupSocket from "./socket.js";
import messagesRoutes from "./routes/messagesRoutes.js";

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

app.use("/uploads/profiles", express.static("uploads/profiles"));
app.use("/uploads/files", express.static("uploads/files"));

app.use(cookieParser()); // frontend will send some cookies some that we need this cookie-parser.

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactsRoutes);
app.use("/api/messages", messagesRoutes);

// created a server instance to pass in the socket
const server = app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});

setupSocket(server);

const connectDB = async () => {
  try {
    await mongoose.connect(databaseURL);
    console.log("MongoDB connected...");
  } catch (error) {
    console.log(error);
  }
};

connectDB();
