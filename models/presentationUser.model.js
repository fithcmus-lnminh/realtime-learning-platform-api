const mongoose = require("mongoose");

const presentationUserSchema = mongoose.Schema(
  {
    presentation_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Presentation",
      required: true
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    role: {
      type: String,
      enum: ["Owner", "Co-Owner", "Collaborator"],
      required: true
    },
    counter: {
      type: Number,
      default: 0,
      required: true
    }
  },
  {
    timestamps: true
  }
);

presentationUserSchema.index(
  { presentation_id: 1, user_id: 1 },
  { unique: true }
);

module.exports = mongoose.model("PresentationUser", presentationUserSchema);
