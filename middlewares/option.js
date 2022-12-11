const Option = require("../models/option.model.js");
const { API_CODE_NOTFOUND } = require("../constants");

exports.isOptionExist = async (req, res, next) => {
  const { option_id } = req.params;
  const { multipleChoice } = req;

  if (multipleChoice.options.find((option) => option._id == option_id)) {
    const option = await Option.findOne({
      _id: option_id,
    });

    req.option = option;

    next();
  } else {
    res.status(404).json({
      code: API_CODE_NOTFOUND,
      message: "Option not exist",
      data: null,
    });
  }
};
