const Group = require('../models/groupModel');
const User = require('../models/userModel');
const httpError = require('../models/errorModel');

const createGroup = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return next(new httpError('Group name is required', 422));
    }

    const newGroup = await Group.create({
      name,
      description,
      admin: req.user.id,
      members: [req.user.id]
    });

    res.status(201).json(newGroup);
  } catch (error) {
    next(error);
  }
};

const getGroups = async (req, res, next) => {
  try {
    const groups = await Group.find().populate('admin', 'fullName');
    res.status(200).json(groups);
  } catch (error) {
    next(error);
  }
};

const getGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('admin', 'fullName')
      .populate('members', 'fullName')
      .populate('pendingRequests', 'fullName');

    if (!group) {
      return next(new httpError('Group not found', 404));
    }

    res.status(200).json(group);
  } catch (error) {
    next(error);
  }
};

const requestToJoinGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return next(new httpError('Group not found', 404));
    }

    if (group.members.includes(req.user.id)) {
      return next(new httpError('You are already a member of this group', 400));
    }

    if (group.pendingRequests.includes(req.user.id)) {
      return next(new httpError('Request already sent', 400));
    }

    group.pendingRequests.push(req.user.id);
    await group.save();

    res.status(200).json('Join request sent successfully');
  } catch (error) {
    next(error);
  }
};

const acceptJoinRequest = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return next(new httpError('Group not found', 404));
    }

    if (group.admin.toString() !== req.user.id) {
      return next(new httpError('Only group admin can accept requests', 403));
    }

    const { userId } = req.body;

    if (!group.pendingRequests.includes(userId)) {
      return next(new httpError('No such pending request', 400));
    }

    group.members.push(userId);
    group.pendingRequests = group.pendingRequests.filter(id => id.toString() !== userId);
    await group.save();

    res.status(200).json('User added to group successfully');
  } catch (error) {
    next(error);
  }
};

const declineJoinRequest = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return next(new httpError('Group not found', 404));
    }

    if (group.admin.toString() !== req.user.id) {
      return next(new httpError('Only group admin can decline requests', 403));
    }

    const { userId } = req.body;

    if (!group.pendingRequests.includes(userId)) {
      return next(new httpError('No such pending request', 400));
    }

    group.pendingRequests = group.pendingRequests.filter(id => id.toString() !== userId);
    await group.save();

    res.status(200).json('Request declined successfully');
  } catch (error) {
    next(error);
  }
};

const removeGroupMember = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return next(new httpError('Group not found', 404));
    }

    if (group.admin.toString() !== req.user.id) {
      return next(new httpError('Only group admin can remove members', 403));
    }

    const { userId } = req.body;

    if (!group.members.includes(userId)) {
      return next(new httpError('User is not a member of the group', 400));
    }

    group.members = group.members.filter(id => id.toString() !== userId);
    await group.save();

    res.status(200).json('User removed from group successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createGroup,
  getGroups,
  getGroup,
  requestToJoinGroup,
  acceptJoinRequest,
  declineJoinRequest,
  removeGroupMember
};
