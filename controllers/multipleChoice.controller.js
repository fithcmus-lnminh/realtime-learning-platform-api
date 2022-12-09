const MultipleChoice = require("../models/multipleChoice.model.js");
const { API_CODE_SUCCESS, API_CODE_BY_SERVER } = require("../constants");

exports.createMultipleChoice = async (req, res) => {
  const { question } = req.body;
  const { presentation } = req;

  try {
    const multipleChoice = await MultipleChoice.create({
      question,
    });

    presentation.slides.push({
      slide_type: "MultipleChoice",
      slide_id: multipleChoice._id,
    });

    await presentation.save();

    res.json({
      code: API_CODE_SUCCESS,
      message: "Success",
      data: multipleChoice,
    });
  } catch (err) {
    res.json({
      code: API_CODE_BY_SERVER,
      message: err.message,
      data: null,
    });
  }
};

exports.getMultipleChoices = async (req, res) => {
  const { presentation } = req;

  try {
    const multipleChoices = await MultipleChoice.find({
      _id: {
        $in: presentation.slides
          .filter((slide) => slide.slide_type === "MultipleChoice")
          .map((slide) => slide.slide_id),
      },
    });

    res.json({
      code: API_CODE_SUCCESS,
      message: "Success",
      data: multipleChoices,
    });
  } catch (err) {
    res.json({
      code: API_CODE_BY_SERVER,
      message: err.message,
      data: null,
    });
  }
};

exports.getMultipleChoice = async (req, res) => {
  const { multiple_choice_id } = req.params;

  try {
    const multipleChoice = await MultipleChoice.findById(multiple_choice_id);

    res.json({
      code: API_CODE_SUCCESS,
      message: "Success",
      data: multipleChoice,
    });
  } catch (err) {
    res.json({
      code: API_CODE_BY_SERVER,
      message: err.message,
      data: null,
    });
  }
};

exports.updateMultipleChoice = async (req, res) => {
  const { question } = req.body;
  const { multipleChoice } = req;

  try {
    multipleChoice.question = question;

    res.json({
      code: API_CODE_SUCCESS,
      message: "Success",
      data: multipleChoice,
    });
  } catch (err) {
    res.json({
      code: API_CODE_BY_SERVER,
      message: err.message,
      data: null,
    });
  }
};

exports.deleteMultipleChoice = async (req, res) => {
  const { multipleChoice, presentation } = req;

  try {
    await multipleChoice.remove();

    presentation.slides = presentation.slides.filter(
      (slide) => slide.slide_id != multipleChoice._id
    );

    await presentation.save();

    res.json({
      code: API_CODE_SUCCESS,
      message: "Success",
      data: null,
    });
  } catch (err) {
    res.json({
      code: API_CODE_BY_SERVER,
      message: err.message,
      data: null,
    });
  }
};
