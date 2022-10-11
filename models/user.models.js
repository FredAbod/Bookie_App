const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: String,
    googleId: String,
    thumbnail: String,
  },
  { collection: "user_info", timestamps: true, versionKey: false }
);

const User = mongoose.model("user", userSchema);
module.exports = User;
