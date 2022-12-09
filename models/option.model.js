const mongoose = require("mongoose");

const optionSchema = mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    upvotes: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Option", optionSchema);
