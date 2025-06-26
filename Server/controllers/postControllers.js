const httpError = require('../models/errorModel');
const PostModel = require('../models/postModel');
const UserModel = require('../models/userModel');
const Group = require('../models/groupModel');

const { v4: uuid } = require('uuid');
const cloudinary = require('../utils/cloudinary');
const fs = require('fs');
const path = require('path');





// ─────────────── CREATE POST ───────────────
const createPost = async (req, res, next) => {
  try {
    const { body, groupId, visibility } = req.body;

    if (!body) {
      return next(new httpError("Fill in text field and choose a media file", 422));
    }

    if (!req.files?.image) {
      return next(new httpError("Please choose an image or video", 422));
    }

    const { image } = req.files;

    const isImage = image.mimetype.startsWith("image/");
    const isVideo = image.mimetype.startsWith("video/");

    if (!isImage && !isVideo) {
      return next(new httpError("Only image or video files are allowed", 422));
    }

    if (isImage && image.size > 10 * 1024 * 1024) {
      return next(new httpError("Image too big. Maximum allowed size is 10MB.", 422));
    }

    if (isVideo && image.size > 50 * 1024 * 1024) {
      return next(new httpError("Video too big. Maximum allowed size is 50MB.", 422));
    }

    let fileName = image.name.split(".");
    fileName = fileName[0] + uuid() + "." + fileName[fileName.length - 1];

    const uploadPath = path.join(__dirname, '..', 'uploads', fileName);
    await image.mv(uploadPath);

    const result = await cloudinary.uploader.upload(uploadPath, { resource_type: "auto" });

    fs.unlinkSync(uploadPath);
    if (!result.secure_url) {
      return next(new httpError("Couldn't upload media to cloudinary", 400));
    }

    const newPost = await PostModel.create({
      creator: req.user.id,
      body,
      image: result.secure_url,
      mediaType: image.mimetype,
      group: groupId || null,
      visibility: groupId ? 'group' : (visibility || 'public')
    });

    await UserModel.findByIdAndUpdate(newPost.creator, {
      $push: { posts: newPost._id },
    });

    res.status(201).json(newPost);
  } catch (error) {
    return next(new httpError(error.message || "Creating post failed", 500));
  }
};


// ─────────────── GET ALL POSTS ───────────────
const getPosts = async (req, res, next) => {
  try {
    console.log('Fetching posts...');

    const user = await UserModel.findById(req.user.id);
    console.log('User found:', user);

    const groups = await Group.find({ members: req.user.id });
    console.log('Groups found:', groups);

    const groupIds = groups.map(group => group._id);

    const posts = await PostModel.find({
      $or: [
        { visibility: 'public' },
        { visibility: { $exists: false } },
        { group: { $in: groupIds } }
      ]
    }).sort({ createdAt: -1 });

    console.log('Posts found:', posts);

    res.json(posts);
  } catch (error) {
    console.log('Error in getPosts:', error);
    return next(new httpError(error.message || "Fetching posts failed", 500));
  }
};


// ─────────────── GET ONE POST ───────────────
const getPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await PostModel.findById(id)
      .populate("creator")
      .populate({ path: "comments", options: { sort: { createdAt: -1 } } });

    console.log('Fetched single post:', post);

    res.json(post);
  } catch (error) {
    return next(new httpError("Fetching post failed", 500));
  }
};





// ─────────────── UPDATE POST ───────────────
const updatePost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const { body } = req.body;

    const post = await PostModel.findById(postId);
    if (post?.creator != req.user.id) {
      return next(new httpError("You can't update this post since you are not the creator", 403));
    }

    const updatedPost = await PostModel.findByIdAndUpdate(
      postId,
      { body },
      { new: true }
    );

    res.status(200).json(updatedPost);
  } catch (error) {
    return next(new httpError("Updating post failed", 500));
  }
};

// ─────────────── DELETE POST ───────────────
const deletePost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const post = await PostModel.findById(postId);

    if (post?.creator != req.user.id) {
      return next(new httpError("You can't delete this post since you are not the creator", 403));
    }

    const deletedPost = await PostModel.findByIdAndDelete(postId);
    await UserModel.findByIdAndUpdate(post.creator, {
      $pull: { posts: post._id },
    });

    res.json(deletedPost);
  } catch (error) {
    return next(new httpError("Deleting post failed", 500));
  }
};

// ─────────────── GET FOLLOWING POSTS ───────────────
const getFollowingPosts = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.user.id);
    const posts = await PostModel.find({ creator: { $in: user?.following } });
    res.json(posts);
  } catch (error) {
    return next(new httpError("Fetching following posts failed", 500));
  }
};

// ─────────────── LIKE / DISLIKE POST ───────────────
const likeDislikePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await PostModel.findById(id);

    let updatedPost;
    if (post?.likes.includes(req.user.id)) {
      updatedPost = await PostModel.findByIdAndUpdate(
        id,
        { $pull: { likes: req.user.id } },
        { new: true }
      );
    } else {
      updatedPost = await PostModel.findByIdAndUpdate(
        id,
        { $push: { likes: req.user.id } },
        { new: true }
      );
    }

    res.json(updatedPost);
  } catch (error) {
    return next(new httpError("Like/dislike failed", 500));
  }
};

// ─────────────── GET USER'S POSTS ───────────────
const getUserPosts = async (req, res, next) => {
  try {
    const UserId = req.params.id;
    const posts = await UserModel.findById(UserId).populate({path: "posts", options: {sort: {createdAt: -1}}})
    
    res.json(posts);
  } catch (error) {
    return next(new httpError(error))
  }
};

// ─────────────── CREATE BOOKMARK ───────────────
const createBookmark = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await UserModel.findById(req.user.id);
    const postIsBookmarked = user?.bookmarks?.includes(id)

    if (postIsBookmarked) {
      const userBookmarks = await UserModel.findByIdAndUpdate(
      req.user.id,{ $pull: { bookmarks: id }},{ new: true });
      res.json(userBookmarks);

    } else {
      const userBookmarks = await UserModel.findByIdAndUpdate(req.user.id,{ $push: { bookmarks: id } },{ new: true });
      res.json(userBookmarks);

    }
  } catch (error) {
    return next(new httpError("Bookmarking failed", 500));
  }
};

// ─────────────── GET USER'S BOOKMARKS ───────────────
const getUserBookmarks = async (req, res, next) => {
  try {
    const userBookmarks = await UserModel.findById(req.user.id).populate({path: "bookmarks", options: {sort: {createdAt: -1}}})

    res.json(userBookmarks);
  } catch (error) {
    return next(new httpError("Fetching bookmarks failed", 500));
  }
};

// ─────────────── SEARCH POSTS ───────────────
const searchPosts = async (req, res, next) => {
  try {
    console.log('Query received:', req.query); // מה הגיע בבקשה

    const { body, fromDate, toDate, creator } = req.query;

    if (!body && !fromDate && !toDate && !creator) {
      return next(new httpError('Please provide at least one search parameter', 400));
    }

    let query = {};

    if (body && body.trim() !== '') {
      query.body = { $regex: body, $options: 'i' };
    }

    if (fromDate && fromDate.trim() !== '') {
      const from = new Date(fromDate);
      if (!isNaN(from)) {
        query.createdAt = { ...query.createdAt, $gte: from };
      }
    }

    if (toDate && toDate.trim() !== '') {
      const to = new Date(toDate);
      if (!isNaN(to)) {
        query.createdAt = { ...query.createdAt, $lte: to };
      }
    }

    if (creator && creator.trim() !== '') {
      query.creator = creator;
    }

    console.log('Mongo Query:', query); // תראה את השאילתא שאתה שולח למסד

    const posts = await PostModel.find(query).populate('creator');

    console.log('Found posts:', posts); // תראה מה מוחזר

    res.json(posts);
  } catch (error) {
    console.log('Search Error:', error); // תראה מה השגיאה האמיתית
    return next(new httpError(error.message || "Search failed", 500));
  }
};



module.exports = {createPost,getPosts,getPost,searchPosts,updatePost,deletePost,getFollowingPosts,likeDislikePost,getUserPosts,createBookmark,getUserBookmarks};
