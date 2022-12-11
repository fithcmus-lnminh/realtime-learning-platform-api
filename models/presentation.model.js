const mongoose = require("mongoose");
const MultipleChoice = require("./multipleChoice.model.js");

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
      required: true,
    },
    group_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

presentationSchema.pre("remove", async function (next) {
  const presentation = this;

  await MultipleChoice.deleteMany({
    _id: {
      $in: presentation.slides
        .filter((slide) => slide.slide_type === "MultipleChoice")
        .map((slide) => slide.slide_id),
    },
  });

  next();
});

presentationSchema.virtual("user", {
  ref: "User",
  localField: "user_id",
  foreignField: "_id",
  justOne: true,
});

module.exports = mongoose.model("Presentation", presentationSchema);
