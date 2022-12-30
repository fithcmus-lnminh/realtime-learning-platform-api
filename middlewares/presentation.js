const Group = require("../models/group.model");
const GroupUser = require("../models/groupUser.model");
const Presentation = require("../models/presentation.model");
const PresentationUser = require("../models/presentationUser.model");
const PresentationGroup = require("../models/presentationGroup.model");
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
    const presentationUser = await PresentationUser.findOne({
      presentation_id: presentation._id,
      user_id: user._id
    });

    if (!presentationUser) {
      res.status(403).json({
        code: API_CODE_PERMISSION_DENIED,
        message: "You are not the member of this presentation",
        data: null
      });
    } else {
      req.presentationUser = presentationUser;
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
  const { presentationUser } = req;

  if (presentationUser.role !== "Owner") {
    res.json({
      code: API_CODE_PERMISSION_DENIED,
      message: "You are not the owner of this presentation",
      data: null
    });
  } else {
    next();
  }
};

exports.isPresentationGroupExist = async (req, res, next) => {
  const { presentation_id, group_id } = req.params;

  try {
    const presentationGroup = await PresentationGroup.findOne({
      presentation_id,
      group_id
    });

    if (!presentationGroup) {
      res.json({
        code: API_CODE_NOTFOUND,
        message: "Presentation does not belong to this group",
        data: null
      });
    } else {
      req.presentationGroup = presentationGroup;
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
