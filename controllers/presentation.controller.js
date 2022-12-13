const generate = require("generate-password");
const Presentation = require("../models/presentation.model");
const {
  API_CODE_SUCCESS,
  API_CODE_BY_SERVER,
  API_CODE_NOTFOUND,
} = require("../constants");

exports.getPresentation = async (req, res) => {
  const { user } = req;
  const { presentation_id } = req.params;

  try {
    const presentation = await Presentation.findOne({
      _id: presentation_id,
      user_id: user._id,
    })
      .populate({
        path: "slides.slide_id",
      })
      .populate({
        path: "user",
        select: "first_name last_name email",
      })
      .lean({ autopopulate: true });

    presentation.slides = presentation.slides.map((slide) => {
      return {
        slide_type: slide.slide_type,
        content: {...slide.slide_id, options: slide.slide_id.options.map(option => ({ ...option, numUpvote: option.upvotes.length }))},
      };
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

exports.CheckAccessCodeValid = async (req, res, next) => {
  const { access_code } = req.body;

  try {
    const presentation = await Presentation.findOne({ access_code });

    if (!presentation) {
      return res.json({
        code: API_CODE_NOTFOUND,
        message: "Access code not found",
        data: null,
      });
    }

    return res.json({
      code: API_CODE_SUCCESS,
      message: "Access code is valid",
      data: {
        group_id: presentation.group_id,
      },
    });
  } catch (err) {
    return res.json({
      code: API_CODE_BY_SERVER,
      message: err.message,
      data: null,
    });
  }
};
