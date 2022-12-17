const mongoose = require("mongoose");

const headingSchema = mongoose.Schema(
  {
    heading: {
      type: String,
      default: ""
    },
    subheading: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Heading", headingSchema);
