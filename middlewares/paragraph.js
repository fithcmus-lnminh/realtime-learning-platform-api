const Paragraph = require("../models/paragraph.model");
const { API_CODE_NOTFOUND } = require("../constants");

exports.isParagraphExist = async (req, res, next) => {
  const { paragraph_id } = req.params;
  const { presentation } = req;

  if (presentation.slides.find((slide) => slide.slide_id == paragraph_id)) {
    const paragraph = await Paragraph.findOne({
      _id: paragraph_id
    });

    req.paragraph = paragraph;

    next();
  } else {
    res.status(404).json({
      code: API_CODE_NOTFOUND,
      message: "Paragraph not exist",
      data: null
    });
  }
};
