const mongoose = require("mongoose");

const presentationUserSchema = mongoose.Schema(
  {
    presentation_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    role: {
      type: String,
      enum: ["Owner", "Co-Owner", "Collaborator"],
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("PresentationUser", presentationUserSchema);
