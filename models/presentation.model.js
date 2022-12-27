const mongoose = require("mongoose");
const MultipleChoice = require("./multipleChoice.model.js");
const PresentationUser = require("./presentationUser.model.js");
const PresentationGroup = require("./presentationGroup.model.js");
const Heading = require("./heading.model.js");
const Paragraph = require("./paragraph.model.js");
const CollaboratorToken = require("./collaboratorToken.model.js");

const presentationSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    slides: [
      {
        slide_type: {
          type: String,
          enum: ["MultipleChoice", "Paragraph", "Heading"],
          required: true
        },
        slide_id: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "slides.slide_type",
          required: true
        }
      }
    ],
    access_code: {
      type: String,
      required: true
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
  }
);

presentationSchema.pre("remove", async function (next) {
  const presentation = this;

  await MultipleChoice.deleteMany({
    _id: {
      $in: presentation.slides
        .filter((slide) => slide.slide_type === "MultipleChoice")
        .map((slide) => slide.slide_id)
    }
  });

  await Heading.deleteMany({
    _id: {
      $in: presentation.slides

        .filter((slide) => slide.slide_type === "Heading")
        .map((slide) => slide.slide_id)
    }
  });

  await Paragraph.deleteMany({
    _id: {
      $in: presentation.slides
        .filter((slide) => slide.slide_type === "Paragraph")
        .map((slide) => slide.slide_id)
    }
  });

  await PresentationGroup.deleteMany({
    presentation_id: presentation._id
  });

  await PresentationUser.deleteMany({
    presentation_id: presentation._id
  });

  await CollaboratorToken.deleteMany({
    presentation_id: presentation._id
  });

  next();
});

presentationSchema.virtual("user", {
  ref: "User",
  localField: "user_id",
  foreignField: "_id",
  justOne: true
});

module.exports = mongoose.model("Presentation", presentationSchema);
