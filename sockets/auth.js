const jwt = require("jsonwebtoken");
const Anonymous = require("../models/anonymous.model");
const User = require("../models/user.model");

exports.validate = async (socket, next) => {
  try {
    const { token } = socket.handshake.headers;

    if (!token) {
      return next(new Error("Missing token"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return next(new Error("Invalid token"));
    }

    socket.user = decoded;

    if (
      (socket.user.role === "Anonymous" &&
        !(await Anonymous.findById(socket.user.id))) ||
      (socket.user.role === "User" && !(await User.findById(socket.user.id)))
    ) {
      return next(new Error("User not found"));
    }

    next();
  } catch (err) {
    return new Error(err.message);
  }
};
