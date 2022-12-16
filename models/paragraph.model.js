const mongoose = require("mongoose");

const paragraphSchema = mongoose.Schema(
  {
    heading: {
      type: String,
      default: ""
    },
    paragraph: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Paragraph", paragraphSchema);
