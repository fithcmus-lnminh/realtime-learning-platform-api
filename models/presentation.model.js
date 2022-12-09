const mongoose = require("mongoose");

const presentationSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    slides: [
      {
        slide_type: {
          type: String,
          enum: ["MultipleChoice", "Paragraph", "Heading"],
          required: true,
        },
        slide_id: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "slides.slide_type",
          required: true,
        },
      },
    ],
    access_code: {
      type: String,
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    group_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Presentation", presentationSchema);
