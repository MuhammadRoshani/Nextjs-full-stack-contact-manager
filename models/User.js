// we use models and schema(pattern) for connect to our collections in db.

import { models, model, Schema } from "mongoose";

const userSchema = new Schema(
  {
    // we define here every users in our collection must have what property and what rules follow
    firstName: {
      type: String,
      // personalization error message:
      minLength: [3, "The firstName must be at least 3 characters long"],
      maxLength: [20, "The firstName must be a maximum of 20 characters"],
      required: [true, "firstName is required"],
      match: [
        /^[A-Za-z]+(?:\s[A-Za-z]+)*$/,
        "The firstName must contain only letters and single spaces",
      ],
      trim: true,
      // we use trim for prevent from put space instead of true value, in fact ignore all space.
    },
    lastName: {
      type: String,
      minLength: [3, "The lastName must be at least 3 characters long"],
      maxLength: [20, "The lastName must be a maximum of 20 characters"],
      required: [true, "lastName is required"],
      match: [
        /^[A-Za-z]+(?:\s[A-Za-z]+)*$/,
        "The lastName must contain only letters and single spaces",
      ],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "email is required"],
      lowercase: true,
      // we use unique for avoid repetition of every email.
      unique: true,
      match: [
        /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
        "email is not valid",
      ],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "password is required"],
      minLength: [8, "The password must be at least 8 characters long"],
      trim: true,
    },
    role: {
      type: String,
      required: [true, "role is required"],
      enum: ["admin", "user"],
      default: "user",
    },
  },
  // this code below for add user, when createdAt and updatedAt in database.
  { timestamps: true },
);
// we write models.User for prevent remake the model below.
const User = models.User || model("User", userSchema);
export default User;
