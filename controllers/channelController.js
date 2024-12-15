import mongoose from "mongoose";
import Channel from "../models/channelModal.js";
import UserModel from "../models/userModel.js";

export const createChannel = async (req, res, next) => {
  try {
    const { name, members } = req.body;
    const userId = req.userId;

    const memberIds = members.map((member) =>
      typeof member === "object" && member.value ? member.value : member
    );

    const admin = await UserModel.findById(userId);
    if (!admin) {
      return res.status(400).json({ message: "Admin user not found" });
    }

    const validMembers = await UserModel.find({ _id: { $in: memberIds } });
    if (validMembers.length !== memberIds.length) {
      return res
        .status(400)
        .json({ message: "Some members are not valid users" });
    }

    const newChannel = new Channel({
      name,
      admin: userId,
      members: memberIds,
    });

    await newChannel.save();

    return res.status(201).json({
      message: "Channel created successfully",
      channel: newChannel,
    });
  } catch (error) {
    console.error("Error in createChannel:", error);

    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Invalid data", error: error.message });
    }

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

//------------------------------------ Get all the channels -------------------------------------------

export const getAllChannels = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);
    const channels = await Channel.find({
      $or: [{ admin: userId }, { members: userId }],
    }).sort({ updatedAt: -1 });

    return res.status(200).json({
      channels,
    });
  } catch (error) {
    console.error("Error in createChannel:", error);

    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Invalid data", error: error.message });
    }

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

//---------------------------------getChannelsMessages-------------------------

export const getChannelsMessages = async (req, res, next) => {
  try {
    const { channelId } = req.params;

    const channel = await Channel.findById(channelId).populate({
      path: "messages",
      populate: {
        path: "sender",
        select: "firstName lastName email _id image color",
      },
    });

    if (!channel) {
      return res.status(404).send("channel not found");
    }

    const messages = channel?.messages;

    return res.status(200).json({
      messages,
    });
  } catch (error) {
    console.error("Error in getChannelsMessages:", error);

    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Invalid data", error: error.message });
    }

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
