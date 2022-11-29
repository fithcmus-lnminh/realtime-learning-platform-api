const { API_CODE_SUCCESS } = require("../constants");

exports.getCurrentUser = (req, res, next) => {
  return res.json({
    code: API_CODE_SUCCESS,
    message: "Success",
    data: req.user
  });
};
