const mongoose = require("mongoose");

const questionSchema = mongoose.Schema(
  {
    presentation_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Presentation",
      required: true
    },
    questioner_type: {
      type: String,
      enum: ["Anonymous", "User"],
      require: true
    },
    questioner_id: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "questioner_type",
      require: true,
      autopopulate: {
        select: "name first_name last_name"
      }
    },
    answerer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      autopopulate: {
        select: "first_name last_name"
      }
    },
    question: {
      type: String
    },
    answer: {
      type: String
    },
    upvotes: [
      {
        user_type: {
          type: String,
          enum: ["Anonymous", "User"],
          require: true
        },
        user_id: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "upvotes.user_type",
          require: true
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    is_answered: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

questionSchema.plugin(require("mongoose-autopopulate"));

module.exports = mongoose.model("Question", questionSchema);
