const { Schema, model } = require('mongoose');

const commentSchema = new Schema({
  creator: {
    creatorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    creatorName: { type: String, required: true },
    creatorPhoto: { type: String, required: true }
  },
  postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  comment: { type: String, required: true }
}, { timestamps: true });

module.exports = model("Comment", commentSchema);
