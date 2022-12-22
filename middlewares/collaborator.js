const PresentationUser = require("../models/presentationUser.model");
const { API_CODE_NOTFOUND, API_CODE_BY_SERVER } = require("../constants");

exports.isPresentationMemberExists = async (req, res, next) => {
  const { presentation } = req;
  const { user_id } = req.body;

  try {
    const presentationMember = await PresentationUser.findOne({
      presentation_id: presentation._id,
      user_id: user_id
    });

    if (!presentationMember) {
      res.json({
        code: API_CODE_NOTFOUND,
        message: "Member does not exist",
        data: null
      });
    } else {
      req.presentationMember = presentationMember;
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
