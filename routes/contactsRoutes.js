import { Router } from "express";
import { searchContacts } from "../controllers/contactsController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const contactsRoutes = Router();

contactsRoutes.post("/search", verifyToken, searchContacts);

export default contactsRoutes;
