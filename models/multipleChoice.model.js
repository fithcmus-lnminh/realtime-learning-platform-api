const mongoose = require("mongoose");
const Option = require("./option.model.js");

const multipleChoiceSchema = mongoose.Schema(
  {
    question: {
      type: String,
    },
    options: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Option",
        autopopulate: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

multipleChoiceSchema.plugin(require("mongoose-autopopulate"));

multipleChoiceSchema.pre("deleteMany", async function (next) {
  const multipleChoices = await this.model.find(this.getFilter());

  const optionIds = multipleChoices
    .map((multipleChoice) => multipleChoice.options.map((option) => option._id))
    .flat();

  await Option.deleteMany({
    _id: optionIds,
  });

  next();
});

multipleChoiceSchema.pre("remove", async function (next) {
  const multipleChoice = this;

  await Option.deleteMany({
    _id: {
      $in: multipleChoice.options,
    },
  });

  next();
});

module.exports = mongoose.model("MultipleChoice", multipleChoiceSchema);
