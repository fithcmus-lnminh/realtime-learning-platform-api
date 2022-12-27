const PresentationGroup = require("../models/presentationGroup.model.js");
const GroupUser = require("../models/groupUser.model.js");
const PresentationUser = require("../models/presentationUser.model.js");
const {
  API_CODE_SUCCESS,
  API_CODE_BY_SERVER,
  API_CODE_NOTFOUND
} = require("../constants");

exports.createPresentationGroup = async (req, res) => {
  const { group_id } = req.body;
  const { presentation } = req;

  try {
    const presentationGroup = await PresentationGroup.findOneAndUpdate(
      {
        presentation_id: presentation._id,
        group_id
      },
      {
        presentation_id: presentation._id,
        group_id
      },
      {
        new: true,
        upsert: true
      }
    );

    const GroupUsers = await GroupUser.find({
      group_id,
      role: "Co-Owner"
    });

    const groupUserIds = GroupUsers.map((groupUser) => groupUser.user_id);

    await PresentationUser.insertMany(
      groupUserIds.map((groupUserId) => ({
        user_id: groupUserId,
        presentation_id: presentation._id,
        role: "Co-Owner"
      })),
      {
        ordered: false
      }
    ).catch((err) => {});

    await PresentationUser.updateMany(
      {
        presentation_id: presentation._id,
        user_id: { $in: groupUserIds }
      },
      {
        $inc: { counter: 1 }
      }
    );

    res.json({
      code: API_CODE_SUCCESS,
      message: "Success",
      data: null
    });
  } catch (err) {
    res.json({
      code: API_CODE_BY_SERVER,
      message: err.message,
      data: null
    });
  }
};

exports.getPresentationGroups = async (req, res) => {
  const { presentation } = req;

  try {
    const presentationGroup = await PresentationGroup.find({
      presentation_id: presentation._id
    }).populate("group_id", "name");

    res.json({
      code: API_CODE_SUCCESS,
      message: "Success",
      data: presentationGroup
    });
  } catch (err) {
    res.json({
      code: API_CODE_BY_SERVER,
      message: err.message,
      data: null
    });
  }
};

exports.deletePresentationGroup = async (req, res) => {
  const { presentationGroup } = req;

  try {
    await presentationGroup.remove();

    res.json({
      code: API_CODE_SUCCESS,
      message: "Success",
      data: null
    });
  } catch (err) {
    res.json({
      code: API_CODE_BY_SERVER,
      message: err.message,
      data: null
    });
  }
};
