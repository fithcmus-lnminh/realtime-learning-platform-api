const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const validateEmail = function (email) {
  const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return regex.test(email);
};

const userSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      validate: [validateEmail, "Please enter a valid email"],
      unique: true
    },
    password: {
      type: String
    },
    first_name: {
      type: String,
      required: true
    },
    last_name: {
      type: String,
      required: true
    },
    token: {
      type: String
    },
    google_id: {
      type: String
    },
    activated: {
      type: Boolean
    },
    source: {
      type: String,
      default: "normal"
    }
  },
  {
    timestamps: true
  }
);

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
