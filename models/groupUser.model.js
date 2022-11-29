const mongoose = require("mongoose");

const groupUserSchema = mongoose.Schema(
  {
    group_id: {
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
      enum: ["Owner", "Co-Owner", "Member"],
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("GroupUser", groupUserSchema);
