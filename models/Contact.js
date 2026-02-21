// we use models and schema(pattern) for connect to our collections in db.

import mongoose, { models, model, Schema } from "mongoose";

const contactSchema = new Schema(
  {
    // we define here every contacts in our collection must have what property and what rules follow
    firstName: {
      type: String,
      // personalization error message:
      minLength: [3, "The firstName must be at least 3 characters long"],
      maxLength: [20, "The firstName must be a maximum of 20 characters"],
      required: [true, "firstName is required"],
      trim: true,
      // we use trim for prevent from put space instead of true value, in fact ignore all space.
    },
    lastName: {
      type: String,
      minLength: [3, "The lastName must be at least 3 characters long"],
      maxLength: [20, "The lastName must be a maximum of 20 characters"],
      required: [true, "lastName is required"],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, "age is required"],
      min: [15, "age must be at least 15"],
    },
    gender: {
      type: String,
      required: [true, "gender is required"],
      enum: ["male", "female"],
    },
    phone: {
      type: String,
      maxLength: [11, "the phone number should not be more than 11 digits"],
      required: [true, "phone is required"],
      trim: true,
      // we use regex pattern below for validation of phone number, start with 09 and after 09 we must write 9 number, at least we must put 11 number in this field.
      match: [/^09\d{9}$/, "phone must be valid"],
    },
    // this below for like the contacts
    favorite: {
      type: Boolean,
      default: false,
    },
    // here below we save that id which user create this contact(att all every user login just show their contact another contact that another user add not show):
    // at all this userId below equal to _id that save in user collection in database.
    // what user create this contact?
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "userId is required"],
    },
  },
  // this code below for add when createdAt and updatedAt in database.
  { timestamps: true },
);

// this code below for phone field if user write duplicate number on add contacts error but important things here, just send error for that user, another user want add same number we do not show error because this number save on another user.
// for example for better understanding: we think on telegram two person can save ali number exactly, but first person can not save ali again because is exist on contact list.
contactSchema.index({ userId: 1, phone: 1 }, { unique: true });

// we write models.contact for prevent remake the model below.
const Contact = models.Contact || model("Contact", contactSchema);
export default Contact;

// we must do something if user after successful login, want go to contacts page just show that contacts that him or his self add and if another user login can't see before contacts that before user add.

// we must specify what user, make what contact, and every contacts must be uniq by login user.

// we use this, relationship concept one-to-many in this Contact model by userId on User model.
// |------<-(diagram)

// at all we have 3 relationship concept in database
// 1: one-to-one |------|
// 2: one-to-many |------<-
// 3: many-to-many ->------<-
