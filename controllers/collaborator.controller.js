const PresentationUser = require("../models/presentationUser.model");
const CollaboratorToken = require("../models/collaboratorToken.model");
const {
  API_CODE_SUCCESS,
  API_CODE_BY_SERVER,
  API_CODE_PERMISSION_DENIED
} = require("../constants");
const sendMail = require("../utils/mailer");
const { v4 } = require("uuid");

exports.createCollaborator = async (req, res) => {
  const { presentation } = req;
  const { email } = req.body;

  try {
    const collaboratorToken = await CollaboratorToken.findOneAndUpdate(
      {
        email: email,
        presentation_id: presentation._id
      },
      {
        token: v4()
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );

    const token = collaboratorToken.token;
    const url = `${process.env.CLIENT_URL}/collaborator/${token}`;

    if (collaboratorToken) {
      await sendMail(
        email,
        "Collaborator invitation",
        `<div style="font-size: 16px">
            <p>Hi,</p>
            <p>Please click this link to collaborate with this presentation: <a href="${url}">${url}</a></p>
            <p>This link will be expired in 1 day</p>
            </div>`
      );

      res.json({
        code: API_CODE_SUCCESS,
        message: "Success",
        data: null
      });
    }
  } catch (err) {
    res.json({
      code: API_CODE_BY_SERVER,
      message: "Server error",
      data: null
    });
  }
};

exports.getCollaborators = async (req, res) => {
  const { presentation } = req;

  try {
    const collaborators = await PresentationUser.find({
      presentation_id: presentation._id
    }).populate("user_id", "email first_name last_name");

    res.json({
      code: API_CODE_SUCCESS,
      message: "Success",
      data: collaborators
    });
  } catch (err) {
    res.json({
      code: API_CODE_BY_SERVER,
      message: "Server error",
      data: null
    });
  }
};

exports.updateCollaborator = async (req, res) => {
  const { presentationMember } = req;
  const { role } = req.body;

  if (presentationMember.role === "Owner") {
    return res.json({
      code: API_CODE_PERMISSION_DENIED,
      message: "Permission denied",
      data: null
    });
  }

  if (role !== "Co-Owner" && role !== "Collaborator") {
    return res.json({
      code: API_CODE_PERMISSION_DENIED,
      message: "Invalid role",
      data: null
    });
  }

  try {
    presentationMember.role = role;
    await presentationMember.save();

    res.json({
      code: API_CODE_SUCCESS,
      message: "Success",
      data: null
    });
  } catch (err) {
    res.json({
      code: API_CODE_BY_SERVER,
      message: "Server error",
      data: null
    });
  }
};

exports.deleteCollaborator = async (req, res) => {
  const { presentationMember } = req;

  if (presentationMember.role === "Owner") {
    return res.json({
      code: API_CODE_PERMISSION_DENIED,
      message: "Permission denied",
      data: null
    });
  }

  try {
    await presentationMember.remove();

    res.json({
      code: API_CODE_SUCCESS,
      message: "Success",
      data: null
    });
  } catch (err) {
    res.json({
      code: API_CODE_BY_SERVER,
      message: "Server error",
      data: null
    });
  }
};
