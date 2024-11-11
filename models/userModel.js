import { genSalt, hash } from "bcrypt";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is requiredd"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Password is requiredd"],
    unique: true,
  },
  firstName: {
    type: String,
    required: false,
  },
  lastName: {
    type: String,
    required: false,
  },
  image: {
    type: String,
    required: false,
  },
  color: {
    type: Number,
    required: false,
  },
  profileSetup: {
    type: Boolean,
    default: false,
  },
});


// here two types of data, which is pre and post. pre means before saving the data this midleware will use.
// don't use arrow function here because you will unable to use this from outside.
userSchema.pre("save", async function (next) {
  const salt = await genSalt(10);
  this.password = await hash(this.password, salt); // before saving the 
  next();
});

const UserModel = mongoose.model("Users", userSchema);

export default UserModel;
