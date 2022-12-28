const mongoose = require("mongoose");
const PresentationUser = require("./presentationUser.model");

const presentationGroupSchema = mongoose.Schema(
  {
    presentation_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Presentation",
      required: true
    },
    group_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true
    }
  },
  {
    timestamps: true
  }
);

presentationGroupSchema.pre("remove", async function (next) {
  const presentationGroup = this;

  const groupUsers = await mongoose.connection
    .collection("groupusers")
    .find({
      group_id: presentationGroup.group_id,
      role: { $in: ["Owner", "Co-Owner"] }
    })
    .toArray();

  await PresentationUser.updateMany(
    {
      user_id: {
        $in: groupUsers.map((groupUser) => groupUser.user_id)
      }
    },
    {
      $inc: { counter: -1 }
    }
  );

  await PresentationUser.deleteMany({
    user_id: {
      $in: groupUsers.map((groupUser) => groupUser.user_id)
    },
    counter: 0,
    role: "Co-Owner"
  });

  next();
});

module.exports = mongoose.model("PresentationGroup", presentationGroupSchema);
