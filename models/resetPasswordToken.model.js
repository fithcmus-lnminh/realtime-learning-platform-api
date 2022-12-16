const mongoose = require("mongoose");
const { v4 } = require("uuid");

const resetPasswordTokenSchema = mongoose.Schema(
  {
    token: {
      type: String,
      default: v4,
      required: true,
      unique: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ResetPasswordToken", resetPasswordTokenSchema);
