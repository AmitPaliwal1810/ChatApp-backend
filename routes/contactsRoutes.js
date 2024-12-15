import { Router } from "express";
import {
  getAllContacts,
  getContactForDMList,
  searchContacts,
} from "../controllers/contactsController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const contactsRoutes = Router();

contactsRoutes.post("/search", verifyToken, searchContacts);
contactsRoutes.get("/get-contact-for-dm", verifyToken, getContactForDMList);
contactsRoutes.get("/get-all-contacts", verifyToken, getAllContacts);

export default contactsRoutes;
