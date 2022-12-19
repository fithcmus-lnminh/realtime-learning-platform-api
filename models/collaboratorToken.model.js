const mongoose = require("mongoose");
const { v4 } = require("uuid");

const collaboratorTokenSchema = mongoose.Schema(
  {
    token: {
      type: String,
      default: v4,
      required: true,
      unique: true
    },
    email: {
      type: String,
      required: true
    },
    presentation_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Presentation",
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("CollaboratorToken", collaboratorTokenSchema);
