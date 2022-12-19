const Group = require("../models/group.model");
const GroupUser = require("../models/groupUser.model");
const Presentation = require("../models/presentation.model");
const PresentationUser = require("../models/presentationUser.model");
const {
  API_CODE_PERMISSION_DENIED,
  API_CODE_NOTFOUND,
  API_CODE_BY_SERVER
} = require("../constants");

exports.isPresentationExist = async (req, res, next) => {
  const { presentation_id } = req.params;

  try {
    const presentation = await Presentation.findOne({ _id: presentation_id });

    if (!presentation) {
      res.json({
        code: API_CODE_NOTFOUND,
        message: "Presentation does not exist",
        data: null
      });
    } else {
      req.presentation = presentation;
      next();
    }
  } catch (err) {
    res.json({
      code: API_CODE_BY_SERVER,
      message: err.message,
      data: null
    });
  }
};

exports.isPresentationUserExist = async (req, res, next) => {
  const { presentation, user } = req;

  try {
    const presentationMember = await PresentationUser.findOne({
      presentation_id: presentation._id,
      user_id: user._id
    });

    if (!presentationMember) {
      res.json({
        code: API_CODE_PERMISSION_DENIED,
        message: "You are not the member of this presentation",
        data: null
      });
    } else {
      req.presentationMember = presentationMember;
      next();
    }
  } catch {
    res.json({
      code: API_CODE_BY_SERVER,
      message: err.message,
      data: null
    });
  }
};

exports.isPresentationOwner = async (req, res, next) => {
  const { presentationMember } = req;

  if (presentationMember.role !== "Owner") {
    res.json({
      code: API_CODE_PERMISSION_DENIED,
      message: "You are not the owner of this presentation",
      data: null
    });
  } else {
    next();
  }
};

exports.checkGroupIdInBody = async (req, res, next) => {
  const { group_id } = req.body;
  const { user } = req;

  if (group_id) {
    try {
      if (await Group.exists({ _id: group_id })) {
        const groupUser = await GroupUser.findOne({
          group_id,
          user_id: user._id
        });

        if (groupUser) {
          if (groupUser.role !== "Owner") {
            res.json({
              code: API_CODE_PERMISSION_DENIED,
              message: "Only group owner can create presentation",
              data: null
            });
          } else next();
        } else
          res.json({
            code: API_CODE_PERMISSION_DENIED,
            message: "You have not joined this group",
            data: null
          });
      } else
        res.json({
          code: API_CODE_NOTFOUND,
          message: "Group does not exist",
          data: null
        });
    } catch (err) {
      res.json({
        code: API_CODE_BY_SERVER,
        message: err.message,
        data: null
      });
    }
  } else {
    next();
  }
};
