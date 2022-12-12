const mongoose = require("mongoose");

const optionSchema = mongoose.Schema(
  {
    content: {
      type: String,
    },
    upvotes: [
      {
        user_type: {
          type: String,
          enum: ["Anonymous", "User"],
          require: true,
        },
        user_id: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "upvotes.user_type",
          require: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Option", optionSchema);
