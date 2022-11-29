const GroupUser = require("../models/groupUser.model");
const Group = require("../models/group.model");
const { API_CODE_SUCCESS, API_CODE_BY_SERVER } = require("../constants");

exports.getGroupUsers = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const { group_id } = req.params;
  const { role } = req.query;

  try {
    const group = await Group.findById(group_id);

    const owner = await GroupUser.findOne({
      group_id,
      role: "Owner"
    }).populate("user_id");

    const groupUsers = await GroupUser.find(
      {
        group_id,
        role: role
          ? { $in: Array.isArray(role) ? role : [role] }
          : { $ne: null }
      },
      { _id: 0, __v: 0, group_id: 0 }
    )
      .populate({
        path: "user_id",
        select: "first_name last_name email"
      })
      .skip((page - 1) * limit)
      .limit(limit * 1)
      .sort({ role: 1 });

    groupUsers.sort(function (a, b) {
      if (a.role === "Owner") return -1;
      if (b.role === "Owner") return 1;
      if (a.role === "Co-Owner") return -1;
      if (b.role === "Co-Owner") return 1;
      return 0;
    });

    const totalUsers = await GroupUser.countDocuments({
      group_id,
      role: role ? { $in: Array.isArray(role) ? role : [role] } : { $ne: null }
    });
    const totalPages = Math.ceil(totalUsers / limit);

    res.json({
      code: API_CODE_SUCCESS,
      message: "Success",
      data: {
        group,
        owner: {
          first_name: owner.user_id.first_name,
          last_name: owner.user_id.last_name,
          email: owner.user_id.email
        },
        group_users: groupUsers,
        total_users: totalUsers,
        total_pages: totalPages
      }
    });
  } catch (err) {
    res.json({
      code: API_CODE_BY_SERVER,
      message: err.message,
      data: null
    });
  }
};
