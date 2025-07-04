const { Schema, model } = require("mongoose");

const postSchema = new Schema({
  creator: { type: Schema.Types.ObjectId, ref: "User" },
  body: { type: String, required: true },
  image: { type: String, required: true },
  likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  mediaType: { type: String, required: true },
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  
  group: { type: Schema.Types.ObjectId, ref: "Group", default: null },
  visibility: { type: String, enum: ['public', 'group'], default: 'public' }

}, { timestamps: true });

module.exports = model('Post', postSchema);

