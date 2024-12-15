import mongoose from "mongoose";
import UserModel from "../models/userModel.js";
import Message from "../models/messagesModel.js";

export const searchContacts = async (req, res, next) => {
  const { searchTerm } = req.body;
  try {
    if (searchTerm === undefined || searchTerm === null) {
      return res.status(400).send("Searchterm is required");
    }

    const sanitizedSeachTerm = searchTerm.replace(/[.*+?^${}|[\]\\]/g, "\\$&");

    const regex = new RegExp(sanitizedSeachTerm, "i");

    const contacts = await UserModel.find({
      $and: [
        { _id: { $ne: req.userId } },
        {
          $or: [{ firstName: regex }, { lastName: regex }, { email: regex }],
        },
      ],
    });

    return res.status(200).json({
      contacts,
    });
  } catch (error) {
    console.error("Error in RemoveProfileImage:", error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

//------------------------------------------------- Get Contact for DM------------------------------------------

export const getContactForDMList = async (req, res, next) => {
  try {
    let { userId } = req;

    userId = new mongoose.Types.ObjectId(userId);

    const contacts = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { recipient: userId }],
        },
      },
      {
        $sort: { timestamp: -1 },
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ["$sender", userId] },
              then: "$recipient",
              else: "$sender",
            },
          },
          lastMessageTime: {
            $first: "$timestamp",
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "contactInfo",
        },
      },
      {
        $unwind: "$contactInfo",
      },
      {
        $project: {
          _id: 1,
          lastMessageTime: 1,
          email: "$contactInfo.email",
          firstName: "$contactInfo.firstName",
          lastName: "$contactInfo.lastName",
          image: "$contactInfo.image",
          color: "$contactInfo.color",
        },
      },
      {
        $sort: { lastMessageTime: -1 },
      },
    ]);

    return res.status(200).json({
      contacts,
    });
  } catch (error) {
    console.error("Error in RemoveProfileImage:", error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

//--------------------- GetAll contacts--------------------

export const getAllContacts = async (req, res, next) => {
  const users = await UserModel.find(
    { _id: { $ne: req.userId } },
    "firstName lastName email _id"
  );

  try {
    const contacts = users.map((user) => ({
      label: user.firstName
        ? `${user.firstName} ${user.lastName}`
        : `${user.email}`,
      value: user._id,
    }));

    return res.status(200).json({
      contacts,
    });
  } catch (error) {
    console.error("Error in RemoveProfileImage:", error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
