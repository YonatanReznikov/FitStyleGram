const httpError = require('../models/errorModel');
const conversationModel = require('../models/conversationModel');
const messageModel = require('../models/messageModel');
const { getReceiverSocketId, io} = require('../socket/socket');


const createMessage = async (req, res, next) => {
  try {
    const { receiverId } = req.params;
    const { messageBody } = req.body;

    let conversation = await conversationModel.findOne({
      participants: { $all: [req.user.id, receiverId] }
    });

    if (!conversation) {
      conversation = await conversationModel.create({
        participants: [req.user.id, receiverId],
        lastMessage: { text: messageBody, senderId: req.user.id }
      });
    }

    const newMessage = await messageModel.create({
      conversationId: conversation._id,
      senderId: req.user.id,
      text: messageBody
    });

    await conversation.updateOne({lastMessage: {text: messageBody, senderId: req.user.id}})

    const receiverSocketId = getReceiverSocketId(receiverId)
    if(receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.json(newMessage);
  } catch (error) {
    return next(new httpError(error));
  }
};


const getMessages = async (req, res, next) => {
  try {
    const { receiverId } = req.params;
    const conversation = await conversationModel.findOne({
      participants: { $all: [req.user.id, receiverId] }
    });

    if (!conversation) {
      return next(new httpError("You have no conversation with this person", 404));
    }

    const messages = await messageModel.find({
      conversationId: conversation._id
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    return next(new httpError(error));
  }
};


const getConversations = async (req, res, next) => {
  try {
    let conversations = await conversationModel.find({
      participants: req.user.id
    }).populate({
      path: "participants",
      select: "fullName profilePhoto"
    }).sort({ createdAt: -1 });

    conversations.forEach((conversation) => {
      conversation.participants = conversation.participants.filter(
        (participant) => participant._id.toString() !== req.user.id.toString()
      );
    });

    res.json(conversations);
  } catch (error) {
    return next(new httpError(error));
  }
};


module.exports = { createMessage, getMessages, getConversations };
