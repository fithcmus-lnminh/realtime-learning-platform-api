const Heading = require("../models/heading.model");
const { API_CODE_NOTFOUND } = require("../constants");

exports.isHeadingExist = async (req, res, next) => {
  const { heading_id } = req.params;
  const { presentation } = req;

  if (presentation.slides.find((slide) => slide.slide_id == heading_id)) {
    const heading = await Heading.findOne({
      _id: heading_id
    });

    req.heading = heading;

    next();
  } else {
    res.status(404).json({
      code: API_CODE_NOTFOUND,
      message: "Heading not exist",
      data: null
    });
  }
};
