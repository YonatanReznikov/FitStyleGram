const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  profilePhoto: {
    type: String,
    default: "https://res.cloudinary.com/dg6hdberu/image/upload/v1748180390/user-icon_d8zxfr.jpg"
  },
  bio: { type: String, default: "Not bio yet" },
  followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
  following: [{ type: Schema.Types.ObjectId, ref: "User" }],
  bookmarks: [{ type: Schema.Types.ObjectId, ref: "Post" }],
  posts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
}, { timestamps: true });

module.exports = model("User", userSchema);
