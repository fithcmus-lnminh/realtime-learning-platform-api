const { API_CODE_SUCCESS } = require("../constants");

exports.getCurrentUser = (req, res, next) => {
  console.log(req.user)
  return res.json({
    code: API_CODE_SUCCESS,
    message: "Success",
    data: req.user
  });
};
