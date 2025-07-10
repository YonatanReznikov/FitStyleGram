const httpError = require('../models/errorModel');
const UserModel = require('../models/userModel');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const uuid = require("uuid").v4;
const fs = require("fs");
const cloudinary = require("../utils/cloudinary");
const path = require("path");
const sendEmail = require("../utils/sendEmail");

const registerUser = async (req, res, next) => {
  try {
    const { fullName, email, password, confirmPassword } = req.body;

    if (!fullName || !email || !password || !confirmPassword) {
      return next(new httpError("Fill in all fields", 422));
    }

    const lowerCaseEmail = email.toLowerCase();
    const emailExists = await UserModel.findOne({ email: lowerCaseEmail });

    if (emailExists) {
      return next(new httpError("Email already exists", 422));
    }

    if (password !== confirmPassword) {
      return next(new httpError("Passwords don't match", 422));
    }

    if (password.length < 6) {
      return next(new httpError("Password should be at least 6 characters", 422));
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await UserModel.create({
      fullName,
      email: lowerCaseEmail,
      password: hashedPassword
    });

    res.status(201).json(newUser);

  } catch (error) {
    return next(new httpError(error.message || "Registration failed", 500));
  }
};


const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new httpError("Fill in all fields", 422));
    }

    const lowerCaseEmail = email.toLowerCase();
    const user = await UserModel.findOne({ email: lowerCaseEmail });
    if (!user) {
      return next(new httpError("Invalid credentials", 422));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(new httpError("Invalid credentials", 422));
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h"
    });

    res.status(200).json({ token, id: user._id });

  } catch (error) {
    return next(new httpError(error.message || "Login failed", 500));
  }
};


const getUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await UserModel.findById(id).select("-password");
    if (!user) {
      return next(new httpError("User not found", 404));
    }
    res.status(200).json(user);
  } catch (error) {
    return next(new httpError(error.message || "Failed to fetch user", 500));
  }
};


const getUsers = async (req, res, next) => {
  try {
    const users = await UserModel.find().limit(10).sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    return next(new httpError(error.message || "Failed to fetch users", 500));
  }
};


const editUser = async (req, res, next) => {
  try {
    const { fullName, bio } = req.body;
    const updatedUser = await UserModel.findByIdAndUpdate(
      req.user.id,
      { fullName, bio },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (error) {
    return next(new httpError(error.message || "Failed to edit user", 500));
  }
};


const followUnfollowUser = async (req, res, next) => {
  try {
    const userToFollowId = req.params.id;

    if (req.user.id === userToFollowId) {
      return next(new httpError("You can't follow/unfollow yourself", 422));
    }

    const currUser = await UserModel.findById(req.user.id);
    const isFollowing = currUser.following.includes(userToFollowId);

    let updatedUser;

    if (!isFollowing) {
      updatedUser = await UserModel.findByIdAndUpdate(
        userToFollowId,
        { $push: { followers: req.user.id } },
        { new: true }
      );
      await UserModel.findByIdAndUpdate(req.user.id, {
        $push: { following: userToFollowId }
      });
    } else {
      updatedUser = await UserModel.findByIdAndUpdate(
        userToFollowId,
        { $pull: { followers: req.user.id } },
        { new: true }
      );
      await UserModel.findByIdAndUpdate(req.user.id, {
        $pull: { following: userToFollowId }
      });
    }

    res.json(updatedUser);
  } catch (error) {
    return next(new httpError(error.message || "Follow action failed", 500));
  }
};

const searchUsers = async (req, res, next) => {
  try {
    const { fullName, email } = req.query;

    if ((!fullName || fullName.trim() === '') && (!email || email.trim() === '')) {
      return next(new httpError('Please provide at least one search parameter', 400));
    }

    let query = {};

    if (fullName && fullName.trim() !== '') {
      query.fullName = { $regex: fullName.trim(), $options: 'i' };
    }

    if (email && email.trim() !== '') {
      query.email = { $regex: email.trim(), $options: 'i' };
    }

    console.log('Query to Mongo:', query);

    const users = await UserModel.find(query).select('-password -__v');

    if (!users || users.length === 0) {
      return next(new httpError('No users found', 404));
    }

    res.json(users);
  } catch (error) {
    console.log('Search Users Error:', error);
    return next(new httpError(error.message || "User search failed", 500));
  }
};

const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      return next(new httpError("User not found", 404));
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;

    const html = `
      <h2>Hello ${user.fullName || "there"},</h2>
      <p>You requested a password reset for your FitStyleGram account.</p>
      <p><a href="${resetLink}" target="_blank">Click here to reset your password</a></p>
      <p>This link will expire in 15 minutes.</p>
      <p>If you did not request this, you can ignore this email.</p>
    `;

    await sendEmail(user.email, "Reset Your FitStyleGram Password", html);
    res.json({ message: "Reset link sent to your email" });
  } catch (err) {
    return next(new httpError(err.message || "Failed to send reset email", 500));
  }
};

const resetPassword = async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(decoded.id);
    if (!user) return next(new httpError("User not found", 404));

    user.password = password;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    return next(new httpError("Invalid or expired token", 400));
  }
};



// ЗАМЕНА АВАТАРА
const changeUserAvatar = async (req, res, next) => {
  try {
    if (!req.files || !req.files.avatar) {
      return next(new httpError("Please choose an image", 422));
    }

    const { avatar } = req.files;
    if (avatar.size > 10 *1024 * 1024) {
      return next(new httpError("Picture too big", 422));
    }

    const ext = path.extname(avatar.name);
    const baseName = path.basename(avatar.name, ext);
    const newFileName = `${baseName}-${uuid()}${ext}`;
    const filePath = path.join(__dirname, "..", "uploads", newFileName);

    avatar.mv(filePath, async (err) => {
      if (err) return next(new httpError("Failed to upload image", 500));

      const result = await cloudinary.uploader.upload(filePath, {
        resource_type: "image"
      });

      if (!result.secure_url) {
        return next(new httpError("Couldn't upload image to Cloudinary", 422));
      }

      const updatedUser = await UserModel.findByIdAndUpdate(
        req.user.id,
        { profilePhoto: result.secure_url },
        { new: true }
      );

      // Удалить временный файл
      fs.unlink(filePath, (err) => {
        if (err) console.error("Failed to delete temp file:", err);
      });

      res.status(200).json(updatedUser);
    });

  } catch (error) {
    return next(new httpError(error.message || "Failed to update avatar", 500));
  }
};


module.exports = {
  registerUser,
  loginUser,
  getUser,
  getUsers,
  editUser,
  followUnfollowUser,
  changeUserAvatar,
  forgotPassword,
  resetPassword,
  searchUsers
};
