const MultipleChoice = require("../models/multipleChoice.model");
const { API_CODE_NOTFOUND } = require("../constants");

exports.isMultipleChoiceExist = async (req, res, next) => {
  const { multiple_choice_id } = req.params;
  const { presentation } = req;

  if (
    presentation.slides.find((slide) => slide.slide_id == multiple_choice_id)
  ) {
    const multipleChoice = await MultipleChoice.findOne({
      _id: multiple_choice_id,
    });

    req.multipleChoice = multipleChoice;

    next();
  } else {
    res.status(404).json({
      code: API_CODE_NOTFOUND,
      message: "Multiple choice not exist",
      data: null,
    });
  }
};
