const generate = require("generate-password");
const Presentation = require("../models/presentation.model");
const { API_CODE_SUCCESS, API_CODE_BY_SERVER } = require("../constants");

exports.getPresentation = async (req, res) => {
  const { user } = req;
  const { presentation_id } = req.params;

  try {
    const presentation = await Presentation.findOne({
      _id: presentation_id,
      user_id: user._id,
    }).populate("slides.slide_id");

    console.log(presentation);

    res.json({
      code: API_CODE_SUCCESS,
      message: "Success",
      data: {
        presentation,
      },
    });
  } catch (err) {
    res.json({
      code: API_CODE_BY_SERVER,
      message: err.message,
      data: null,
    });
  }
};

exports.getPresentations = async (req, res) => {
  const { user } = req;
  const { group_id } = req.query;

  try {
    const presentations = await Presentation.find({
      user_id: user._id,
      group_id: group_id,
    });

    res.json({
      code: API_CODE_SUCCESS,
      message: "Success",
      data: {
        presentations,
      },
    });
  } catch (err) {
    res.json({
      code: API_CODE_BY_SERVER,
      message: err.message,
      data: null,
    });
  }
};

exports.createPresentation = async (req, res) => {
  const { title, group_id } = req.body;
  const { user } = req;

  try {
    let access_code = generate.generate({
      length: 6,
      numbers: true,
      uppercase: true,
      lowercase: true,
      symbols: false,
      excludeSimilarCharacters: true,
      strict: true,
    });

    while (await Presentation.exists({ access_code })) {
      access_code = generate.generate({
        length: 6,
        numbers: true,
        uppercase: true,
        lowercase: true,
        symbols: false,
        excludeSimilarCharacters: true,
        strict: true,
      });
    }

    const presentation = await Presentation.create({
      title,
      access_code,
      user_id: user._id,
      group_id,
    });

    res.json({
      code: API_CODE_SUCCESS,
      message: "Success",
      data: {
        presentation,
      },
    });
  } catch (err) {
    res.json({
      code: API_CODE_BY_SERVER,
      message: err.message,
      data: null,
    });
  }
};

exports.updatePresentation = async (req, res) => {
  const { title } = req.body;
  const { presentation } = req;

  try {
    presentation.title = title;
    await presentation.save();

    res.json({
      code: API_CODE_SUCCESS,
      message: "Success",
      data: {
        presentation,
      },
    });
  } catch (err) {
    res.json({
      code: API_CODE_BY_SERVER,
      message: err.message,
      data: null,
    });
  }
};

exports.deletePresentation = async (req, res) => {
  const { presentation } = req;

  try {
    await presentation.remove();

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