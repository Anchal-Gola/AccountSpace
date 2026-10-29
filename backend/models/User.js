const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    phone: {
      type: String,
      default: "",
      maxlength: 20,
    },
    bio: {
      type: String,
      default: "",
      maxlength: 200,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);