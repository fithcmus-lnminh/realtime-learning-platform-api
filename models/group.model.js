const mongoose = require("mongoose");
const GroupUser = require("../models/groupUser.model");
const PresentationGroup = require("../models/presentationGroup.model");

const groupSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    maximum_members: {
      type: Number,
      default: 100,
      required: true
    }
  },
  {
    timestamps: true
  }
);

groupSchema.pre("remove", async function (next) {
  const group = this;

  const presentationGroups = await PresentationGroup.find({
    group_id: group._id
  });

  await Promise.all(
    presentationGroups.map(async (presentationGroup) => {
      await presentationGroup.remove();
    })
  );

  await GroupUser.deleteMany({
    group_id: group._id
  });

  next();
});

module.exports = mongoose.model("Group", groupSchema);
