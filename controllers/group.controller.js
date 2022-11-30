const Group = require("../models/group.model");
const GroupUser = require("../models/groupUser.model");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const { API_CODE_SUCCESS, API_CODE_BY_SERVER } = require("../constants");
const sendMail = require("../utils/mailer");

exports.getGroup = async (req, res) => {
  const { group_id } = req.params;

  try {
    const group = await Group.findOne({ _id: group_id });
    const owner = await GroupUser.findOne({
      group_id,
      role: "Owner",
    }).populate("user_id");
    const totalMembers = await GroupUser.countDocuments({ group_id });
    let isJoined = null;
    let user_id = null;

    if (req.user) {
      user_id = req.user._id;
    } else {
      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
      ) {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");

        if (user.token === token) user_id = user._id;
      }
    }

    if (user_id)
      isJoined = (await GroupUser.exists({
        group_id,
        user_id,
      }))
        ? true
        : false;

    return res.json({
      code: API_CODE_SUCCESS,
      message: "Success",
      data: {
        group,
        owner: {
          first_name: owner.user_id.first_name,
          last_name: owner.user_id.last_name,
          email: owner.user_id.email,
        },
        total_members: totalMembers,
        is_joined: isJoined,
      },
    });
  } catch (err) {
    return res.json({
      code: API_CODE_BY_SERVER,
      message: err.message,
      data: null,
    });
  }
};

exports.getGroups = async (req, res) => {
  const { page = 1, limit = 10, role } = req.query;

  try {
    const groups = await GroupUser.aggregate([
      {
        $match: {
          user_id: req.user._id,
          role: role
            ? { $in: Array.isArray(role) ? role : [role] }
            : { $ne: null },
        },
      },
      {
        $lookup: {
          from: "groupusers",
          localField: "group_id",
          foreignField: "group_id",
          as: "group_users",
        },
      },
      {
        $project: {
          _id: 0,
          role: 1,
          group_id: 1,
          total_users: { $size: "$group_users" },
        },
      },
      {
        $skip: (page - 1) * limit,
      },
      {
        $limit: limit * 1,
      },
    ]);

    await GroupUser.populate(groups, {
      path: "group_id",
      select: { _id: 1, name: 1, maximum_members: 1, description: 1 },
    });

    const totalGroups = await GroupUser.countDocuments({
      user_id: req.user._id,
      role: role ? { $in: Array.isArray(role) ? role : [role] } : { $ne: null },
    });

    const totalPages = Math.ceil(totalGroups / limit);

    res.json({
      code: API_CODE_SUCCESS,
      message: "Success",
      data: {
        groups,
        total_groups: totalGroups,
        total_pages: totalPages,
      },
    });
  } catch (err) {
    res.json({
      code: API_CODE_BY_SERVER,
      message: err.message,
      data: null,
    });
  }
};

exports.createGroup = async (req, res) => {
  const { name, description, maximum_members } = req.body;

  try {
    const group = await Group.create({ name, description, maximum_members });
    const groupUser = await GroupUser.create({
      group_id: group._id,
      user_id: req.user._id,
      role: "Owner",
    });

    res.json({
      code: API_CODE_SUCCESS,
      message: "Success",
      data: {
        _id: group._id,
        name: group.name,
        maximum_members: group.maximum_members,
        role: groupUser.role,
      },
    });
  } catch (err) {
    res.json({
      code: API_CODE_BY_SERVER,
      message: err.message,
      data: null,
    });
  }
};

exports.updateGroup = async (req, res) => {
  const { group_id } = req.params;
  const { name, description, maximum_members } = req.body;

  try {
    const group = await Group.findByIdAndUpdate(
      group_id,
      { name, description, maximum_members },
      { new: true }
    );

    res.json({
      code: API_CODE_SUCCESS,
      message: "Success",
      data: {
        _id: group._id,
        name: group.name,
        description: group.description,
        maximum_members: group.maximum_members,
      },
    });
  } catch (err) {
    res.json({
      code: API_CODE_BY_SERVER,
      message: error.message,
      data: null,
    });
  }
};

exports.deleteGroup = async (req, res) => {
  const { group_id } = req.params;

  try {
    await Group.findByIdAndDelete(group_id);
    await GroupUser.deleteMany({ group_id });

    res.json({
      code: API_CODE_SUCCESS,
      message: "Success",
      data: null,
    });
  } catch (err) {
    res.json({
      code: API_CODE_BY_SERVER,
      message: err.message,
      data: null,
    });
  }
};

exports.inviteUser = async (req, res) => {
  const { group_id } = req.params;
  const { email } = req.body;
  const { user, group } = req;
  const inviteLink = `${process.env.CLIENT_URL}/invite/${group_id}`;

  try {
    await sendMail(
      email,
      `Group invitation: "${group.name}"`,
      `<div style="font-size: 16px">
        <p>Hi! </p>
        <p>${user.first_name} ${user.last_name} invited you to the group ${group.name}!</p>
        <a href="${inviteLink}">Join now</a>
        <p>If you accept, your contact information will be shared with members of the group.</p>
      </div>`
    );

    res.json({
      code: API_CODE_SUCCESS,
      message: "Success",
      data: null,
    });
  } catch (err) {
    res.json({
      code: API_CODE_BY_SERVER,
      message: err.message,
      data: null,
    });
  }
};

exports.joinGroup = async (req, res) => {
  const { group_id } = req.params;
  const { user } = req;

  try {
    const groupUser = await GroupUser.create({
      group_id,
      user_id: user._id,
      role: "Member",
    });

    res.json({
      code: API_CODE_SUCCESS,
      message: "Success",
      data: {
        _id: groupUser._id,
        role: groupUser.role,
      },
    });
  } catch (err) {
    res.json({
      code: API_CODE_BY_SERVER,
      message: err.message,
      data: null,
    });
  }
};

exports.leaveGroup = async (req, res, next) => {
  const { group_id } = req.params;
  const { user } = req;

  try {
    await GroupUser.deleteOne({
      group_id,
      user_id: user._id,
    });

    res.json({
      code: 0,
      message: "Leave group successfully",
      data: null,
    });
  } catch (err) {
    res.json({
      code: API_CODE_BY_SERVER,
      message: err.message,
      data: null,
    });
  }
};

exports.kickUser = async (req, res) => {
  const { member } = req;

  try {
    await GroupUser.deleteOne({
      group_id: member.group_id,
      user_id: member.user_id,
    });

    res.json({
      code: API_CODE_SUCCESS,
      message: "Success",
      data: null,
    });
  } catch (err) {
    res.json({
      code: API_CODE_BY_SERVER,
      message: err.message,
      data: null,
    });
  }
};

exports.promoteUser = async (req, res) => {
  const { member } = req;
  const { role } = req.body;

  try {
    const groupUser = await GroupUser.findOneAndUpdate(
      { group_id: member.group_id, user_id: member.user_id },
      { role },
      { new: true }
    );

    res.json({
      code: API_CODE_SUCCESS,
      message: "Success",
      data: {
        role: groupUser.role,
      },
    });
  } catch (err) {
    res.json({
      code: API_CODE_BY_SERVER,
      message: err.message,
      data: null,
    });
  }
};
