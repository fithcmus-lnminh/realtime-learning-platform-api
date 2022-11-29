const mongoose = require("mongoose");
const GroupUser = require("../models/groupUser.model");

const groupSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
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

groupSchema.methods.isFullMember = async function (enteredPassword) {
  const totalUsers = await GroupUser.countDocuments({ group_id: this._id });
  return totalUsers >= this.maximum_members;
};

module.exports = mongoose.model("Group", groupSchema);
