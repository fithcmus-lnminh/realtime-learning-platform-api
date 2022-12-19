const ResetPasswordToken = require("../models/resetPasswordToken.model");
const CollaboratorToken = require("../models/collaboratorToken.model");
const PresentationUser = require("../models/presentationUser.model");
const {
  API_CODE_SUCCESS,
  API_CODE_NOTFOUND,
  API_CODE_PERMISSION_DENIED,
  API_CODE_BY_SERVER,
  API_CODE_VALIDATION_ERROR
} = require("../constants");
const sendMail = require("../utils/mailer");
const User = require("../models/user.model");
const { v4 } = require("uuid");
const bcrypt = require("bcryptjs");

exports.createResetPasswordToken = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user.source !== "normal")
      return res.json({
        code: API_CODE_PERMISSION_DENIED,
        message: "You can't reset password with this email",
        data: null
      });

    const resetPasswordToken = await ResetPasswordToken.findOneAndUpdate(
      {
        user_id: user._id
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

    if (resetPasswordToken) {
      const token = resetPasswordToken.token;
      const url = `${process.env.CLIENT_URL}/reset-password/${token}`;
      await sendMail(
        email,
        "Reset password",
        `<div style="font-size: 16px">
          <p>Hi ${user.first_name + " " + user.last_name},</p>
          <p>Please click this link to reset your password: <a href="${url}">${url}</a></p>
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
      message: err.message,
      data: null
    });
  }
};

exports.resetPassword = async (req, res) => {
  const { token_id } = req.params;
  const { password } = req.body;

  try {
    const resetPasswordToken = await ResetPasswordToken.findOne({
      token: token_id
    });

    if (resetPasswordToken) {
      const updatedAt = resetPasswordToken.updatedAt;
      const now = new Date();
      const diff = now.getTime() - updatedAt.getTime();
      const diffDays = Math.ceil(diff / (1000 * 3600 * 24));

      if (diffDays > 1) {
        return res.json({
          code: API_CODE_VALIDATION_ERROR,
          message: "Token is expired",
          data: null
        });
      }

      const user = await User.findById(resetPasswordToken.user_id);
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      user.token = null;

      await user.save();

      res.json({
        code: API_CODE_SUCCESS,
        message: "Success",
        data: null
      });
    } else
      res.json({
        code: API_CODE_NOTFOUND,
        message: "Token is not found",
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

exports.acceptCollaborator = async (req, res) => {
  const { token_id } = req.params;

  try {
    const collaboratorToken = await CollaboratorToken.findOne({
      token: token_id
    });

    if (!collaboratorToken)
      return res.json({
        code: API_CODE_NOTFOUND,
        message: "Token is not found",
        data: null
      });

    const updatedAt = collaboratorToken.updatedAt;
    const now = new Date();
    const diff = now.getTime() - updatedAt.getTime();
    const diffDays = Math.ceil(diff / (1000 * 3600 * 24));

    if (diffDays > 1) {
      return res.json({
        code: API_CODE_VALIDATION_ERROR,
        message: "Token is expired",
        data: null
      });
    }

    const user = await User.findOne({
      email: collaboratorToken.email
    });

    if (!user)
      return res.json({
        code: API_CODE_NOTFOUND,
        message: "User is not found",
        data: null
      });

    await PresentationUser.create({
      user_id: user._id,
      presentation_id: collaboratorToken.presentation_id,
      role: "Collaborator"
    });

    res.json({
      code: API_CODE_SUCCESS,
      message: "Success",
      data: {
        presentation_id: collaboratorToken.presentation_id
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
