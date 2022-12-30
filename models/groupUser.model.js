const mongoose = require("mongoose");
const PresentationGroup = require("../models/presentationGroup.model");
const PresentationUser = require("../models/presentationUser.model");

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

groupUserSchema.pre("remove", async function (next) {
  const groupUser = this;

  if (groupUser.role === "Co-Owner" || groupUser.role === "Owner") {
    const presentationGroups = await PresentationGroup.find({
      group_id: groupUser.group_id
    }).distinct("presentation_id");

    await PresentationUser.updateMany(
      {
        presentation_id: { $in: presentationGroups },
        user_id: groupUser.user_id
      },
      {
        $inc: { counter: -1 }
      }
    );

    await PresentationUser.deleteMany({
      user_id: groupUser.user_id,
      role: "Co-Owner",
      counter: 0
    });
  }

  next();
});

module.exports = mongoose.model("GroupUser", groupUserSchema);
