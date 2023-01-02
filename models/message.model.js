const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    presentation_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Presentation",
      required: true
    },
    sender_type: {
      type: String,
      enum: ["Anonymous", "User"],
      require: true
    },
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "sender_type",
      require: true,
      autopopulate: {
        select: "name first_name last_name"
      }
    },
    content: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

messageSchema.plugin(require("mongoose-autopopulate"));

module.exports = mongoose.model("Message", messageSchema);
