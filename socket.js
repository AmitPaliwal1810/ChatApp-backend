import { Server as SocketIoServer } from "socket.io";
import Message from "./models/messagesModel.js";

const setupSocket = (server) => {
  const io = new SocketIoServer(server, {
    cors: {
      origin: process.env.ORIGIN,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const disconnect = () => {
    console.log(`Client disconnected ${socket.id}`);
    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        break;
      }
    }
  };

  const userSocketMap = new Map();

  const sendMessage = async (message) => {
    const senderSocketId = userSocketMap.get(message.sender);
    const recipientSocketId = userSocketMap.get(message.recipient);

    const createdMessage = await Message.create(message);

    const messageData = await Message.findById(createdMessage._id)
      .populate("sender", "id email firstName lastName image color")
      .populate("receipent", "id email firstName lastName image color");

    if (recipientSocketId) {
      io.to(recipientSocketId).emit("receiveMessage", messageData);
    }
    if (senderSocketId) {
      io.to(senderSocketId).emit("receiveMessage", messageData);
    }
  };

  io.on("connnection", (socket) => {
    const userId = socket?.handshake?.query?.userId;
    if (userId) {
      userSocketMap.set(userId, socket?.id);
      console.log(`user connected : ${userId} with socketIdL ${socket?.id}`);
    } else {
      console.log("User Id not provided");
    }

    socket.on("sendMessage", sendMessage);

    socket.on("disconnect", () => disconnect);
  });
};

export default setupSocket;
