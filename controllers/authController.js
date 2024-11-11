import jwt from "jsonwebtoken";
import UserModel from "../models/userModel.js";
import { compare } from "bcrypt";
import path from "path";
import { promises as fsPromises, unlinkSync } from "fs";

const maxAge = 3 * 24 * 60 * 60 * 1000;

const createToken = (email, userId) => {
  return jwt.sign({ email, userId }, process.env.JWT_KEY, {
    expiresIn: maxAge,
  });
};

//----------------------------------SignUp--------------------------------------
export const signup = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send("Email and Password is required");
    }

    const user = await UserModel.create({ email, password });
    res.cookie("jwt", createToken(email, user?.id), {
      maxAge,
      secure: true,
      sameSite: "None",
    });
    return res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        image: user.image,
        profileSetup: user.profileSetup,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

// -------------------------login-----------------
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send("Email and Password is required");
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).send("No user found");
    }

    const auth = await compare(password, user?.password);

    if (!auth) {
      return res.status(401).send("invalid email password");
    }

    res.cookie("jwt", createToken(email, user?.id), {
      maxAge,
      secure: true,
      sameSite: "None",
    });
    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        image: user.image,
        profileSetup: user.profileSetup,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

//--------------------getUserInfo-----------------------

export const getUserInfo = async (req, res, next) => {
  const userId = req.userId;
  if (!userId)
    return res.status(401).json({
      message: "unauthorized",
    });
  try {
    const userData = await UserModel.findById(userId);
    if (!userData)
      return res.status(401).json({
        message: "user not found",
      });

    return res.status(200).json({
      user: {
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        image: userData.image,
        profileSetup: userData.profileSetup,
        color: userData.color,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

//---------------- updateProfile ----------------

export const updateProfile = async (req, res, next) => {
  const { userId } = req;
  const { firstName, lastName, color } = req.body;

  if (!firstName || !lastName) {
    return res.status(400).send("firstname , lastname and color is required");
  }

  try {
    const userData = await UserModel.findByIdAndUpdate(
      userId,
      {
        firstName,
        lastName,
        color,
        profileSetup: true,
      },
      { new: true, runValidators: true } // new means mongodb will return us new data back.
    );

    return res.status(200).json({
      user: {
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        image: userData.image,
        profileSetup: userData.profileSetup,
        color: userData.color,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const UpdateProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).send("File is required");
    }
    const date = Date.now();
    const newFileName = date + "-" + req.file.originalname; // Correct spelling: originalname
    const newFilePath = path.join("uploads", "profiles", newFileName);

    await fsPromises.rename(req.file.path, newFilePath);

    const updatedUser = await UserModel.findByIdAndUpdate(
      req.userId,
      { image: newFilePath },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      image: updatedUser.image,
    });
  } catch (error) {
    console.error("Error updating profile image:", error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const RemoveProfileImage = async (req, res, next) => {
  try {
    const { userId } = req;

    const userData = await UserModel.findById(userId);
    if (!userData) {
      return res.status(404).send("User doesn't exist");
    }

    if (userData.image) {
      try {
        unlinkSync(userData.image);
      } catch (fileError) {
        console.error("Error deleting file:", fileError);
        return res
          .status(500)
          .send("Failed to delete profile image from server");
      }
    }

    userData.image = null;

    await userData.save();

    return res.status(200).send("Profile image deleted successfully");
  } catch (error) {
    console.error("Error in RemoveProfileImage:", error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const logout = async (req, res, next) => {
  try {
    res.cookie("jwt", "", { maxAge: 1, secure: true, sameSite: "None" });
    return res.status(200).send("Logout Successfully");
  } catch (error) {
    console.error("Error in RemoveProfileImage:", error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
