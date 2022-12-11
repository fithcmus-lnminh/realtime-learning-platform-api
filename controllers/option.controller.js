const Option = require("../models/option.model.js");
const { API_CODE_SUCCESS, API_CODE_BY_SERVER } = require("../constants");

exports.createOption = async (req, res) => {
  const { multipleChoice } = req;

  try {
    const option = await Option.create({});

    multipleChoice.options.push(option._id);

    await multipleChoice.save();

    res.json({
      code: API_CODE_SUCCESS,
      message: "Success",
      data: option,
    });
  } catch (err) {
    res.json({
      code: API_CODE_BY_SERVER,
      message: err.message,
      data: null,
    });
  }
};

exports.getOptions = async (req, res) => {
  const { multipleChoice } = req;

  try {
    const options = await Option.find({
      _id: {
        $in: multipleChoice.options,
      },
    });

    res.json({
      code: API_CODE_SUCCESS,
      message: "Success",
      data: options,
    });
  } catch (err) {
    res.json({
      code: API_CODE_BY_SERVER,
      message: err.message,
      data: null,
    });
  }
};

exports.getOption = async (req, res) => {
  const { option } = req;

  res.json({
    code: API_CODE_SUCCESS,
    message: "Success",
    data: option,
  });
};

exports.updateOption = async (req, res) => {
  const { option } = req;
  const { content } = req.body;

  try {
    option.content = content;

    await option.save();

    res.json({
      code: API_CODE_SUCCESS,
      message: "Success",
      data: option,
    });
  } catch (err) {
    res.json({
      code: API_CODE_BY_SERVER,
      message: err.message,
      data: null,
    });
  }
};

exports.deleteOption = async (req, res) => {
  const { multipleChoice, option } = req;

  try {
    multipleChoice.options = multipleChoice.options.filter(
      (option_id) => option_id._id.toString() != option._id.toString()
    );

    await multipleChoice.save();
    await option.remove();

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
