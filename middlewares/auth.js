const jwt = require("jsonwebtoken");
const { API_CODE_UNAUTHORIZED, API_CODE_FAIL } = require("../constants");
const User = require("../models/user.model");
const Anonymous = require("../models/anonymous.model");

exports.isAuth = async (req, res, next) => {
  try {
    if (req.user) {
      next();
    } else {
      let token;
      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
      ) {
        token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        let user;

        if (decoded.type == "User")
          user = await User.findById(decoded.id).select("-password");
        else if (decoded.type == "Anonymous")
          user = await Anonymous.findById(decoded.id);

        if (decoded.type == "Anonymous" || user.token === token) {
          req.user = user;
          next();
        } else {
          res.status(401).json({
            code: API_CODE_UNAUTHORIZED,
            message: "Token has been expired",
            data: null
          });
        }
      } else {
        res.status(401).json({
          code: API_CODE_UNAUTHORIZED,
          message: "Not authorized",
          data: null
        });
      }
    }
  } catch (err) {
    res.status(401).json({
      code: API_CODE_UNAUTHORIZED,
      message: err.message,
      data: null
    });
  }
};
