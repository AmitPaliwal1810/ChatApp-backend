import { Router } from "express";
import {
  getContactForDMList,
  searchContacts,
} from "../controllers/contactsController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const contactsRoutes = Router();

contactsRoutes.post("/search", verifyToken, searchContacts);
contactsRoutes.get("/get-contact-for-dm", verifyToken, getContactForDMList);

export default contactsRoutes;
