const mongoose = require("mongoose");
const presentationUser = require("./presentationUser.model.js");

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

  const presentationUsers = await presentationUser.find({
    presentation_id: presentationGroup.presentation_id
  });

  await presentationUser.updateMany(
    {
      _id: {
        $in: presentationUsers.map((presentationUser) => presentationUser._id)
      }
    },
    {
      $inc: { counter: -1 }
    }
  );

  await presentationUser.deleteMany({
    _id: {
      $in: presentationUsers.map((presentationUser) => presentationUser._id)
    },
    counter: 0,
    role: "Co-Owner"
  });
});

module.exports = mongoose.model("PresentationGroup", presentationGroupSchema);
