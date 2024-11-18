import Message from "../models/messagesModel.js";
import UserModel from "../models/userModel.js";

export const getMessages = async (req, res, next) => {
  const user1 = req.userId;
  const user2 = req.body.id;

  try {
    if (!user1 || !user2) {
      return res.status(400).send("both user id's are required");
    }

    const messages = await Message.find(
      {
        $or: [
          {
            sender: user1,
            recipient: user2,
          },
          {
            sender: user2,
            recipient: user1,
          },
        ],
      }
    );
    return res.status(200).json({ messages });
  } catch (error) {
    console.error("Error in Messages:", error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
