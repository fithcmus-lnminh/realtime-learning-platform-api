const mongoose = require("mongoose");

const multipleChoiceSchema = mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    options: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Option",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("MultipleChoice", multipleChoiceSchema);
