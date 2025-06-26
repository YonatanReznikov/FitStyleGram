const httpError = require("../models/errorModel");
const UserModel = require('../models/userModel');
const PostModel = require('../models/postModel');
const CommentModel = require('../models/commentModel')



// ─────────────── CREATE COMMENT ───────────────
const createComment = async (req, res, next) => {
    try {
      const { postId } = req.params;
      const { comment } = req.body;
  
      if (!comment) {
        return next(new httpError("Please add a comment", 422));
      }
  
      const post = await PostModel.findById(postId);
      if (!post) {
        return next(new httpError("Post not found", 404));
      }
  
      const user = await UserModel.findById(req.user.id);
  
      const newComment = await CommentModel.create({
        creator: {
          creatorId: req.user.id,
          creatorName: user?.fullName,
          creatorPhoto: user?.profilePhoto
        },
        comment,
        postId
      });
  
      await PostModel.findByIdAndUpdate(
        postId,
        { $push: { comments: newComment._id } },
        { new: true }
      );
  
      res.status(201).json(newComment);
    } catch (error) {
      return next(new httpError("Creating comment failed", 500));
    }
  };





const getPostComments = async (req, res, next) => {
    try{

      const { postId } = req.params;
      const comments = await PostModel.findById(postId).populate({path: "comments",
        options: {sort: {createdAt: -1}}})
        res.json(comments)
    }
    catch (error) {
      return next(new httpError("Fetching comments failed", 500));

    }
}




const deleteComment = async (req, res, next) => {
    try{

      const { commentId } = req.params;
      const comment = await CommentModel.findById(commentId);
      const commentCreator = await UserModel.findById(comment?.creator?.creatorId)
      if (comment?.creator?.creatorId.toString() !== req.user.id) {
        return next(new httpError("Unauthorized action", 403));
      }
      await PostModel.findByIdAndUpdate(comment?.postId, {$pull: {comments: commentId}})
      const deleteComment = await CommentModel.findByIdAndDelete(commentId)
      res.json(deleteComment)
    }
    catch (error) {
        return next(new httpError)

    }
}





module.exports = { createComment, getPostComments, deleteComment };
