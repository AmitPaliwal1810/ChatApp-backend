import { Router } from "express";
import {
  getUserInfo,
  login,
  logout,
  RemoveProfileImage,
  signup,
  updateProfile,
  UpdateProfileImage,
} from "../controllers/authController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import multer from "multer";
import fs from "fs";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/profiles/";

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage });

const authRoutes = Router();

authRoutes.post("/signup", signup);
authRoutes.post("/login", login);
authRoutes.get("/user-info", verifyToken, getUserInfo);
authRoutes.post("/update-profile", verifyToken, updateProfile);
authRoutes.post(
  "/add-profile-image",
  verifyToken,
  upload.single("profile-image"), // Handle single file upload
  UpdateProfileImage
);
authRoutes.delete("/remove-profile-image", verifyToken, RemoveProfileImage);
authRoutes.post("/logout", logout);

export default authRoutes;
