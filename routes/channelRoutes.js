import { Router } from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
  createChannel,
  getAllChannels,
  getChannelsMessages,
} from "../controllers/channelController.js";

const channelRoutes = Router();

channelRoutes.post("/create-channel", verifyToken, createChannel);
channelRoutes.get("/get-all-channels", verifyToken, getAllChannels);
channelRoutes.get(
  "/get-all-channel-messages/:channelId",
  verifyToken,
  getChannelsMessages
);

export default channelRoutes;
