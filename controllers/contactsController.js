import UserModel from "../models/userModel.js";

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
