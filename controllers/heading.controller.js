const Heading = require("../models/heading.model.js");
const { API_CODE_SUCCESS, API_CODE_BY_SERVER } = require("../constants");

exports.createHeading = async (req, res) => {
  const { heading, subheading } = req.body;
  const { presentation } = req;

  try {
    const headingSlide = await Heading.create({
      heading,
      subheading
    });

    presentation.slides.push({
      slide_type: "Heading",
      slide_id: headingSlide._id
    });

    await presentation.save();

    res.json({
      code: API_CODE_SUCCESS,
      message: "Success",
      data: {
        heading: headingSlide
      }
    });
  } catch (err) {
    res.json({
      code: API_CODE_BY_SERVER,
      message: err.message,
      data: null
    });
  }
};

exports.getHeadings = async (req, res) => {
  const { presentation } = req;

  try {
    const headings = await Heading.find({
      _id: {
        $in: presentation.slides
          .filter((slide) => slide.slide_type === "Heading")
          .map((slide) => slide.slide_id)
      }
    });

    res.json({
      code: API_CODE_SUCCESS,
      message: "Success",
      data: {
        headings
      }
    });
  } catch (err) {
    res.json({
      code: API_CODE_BY_SERVER,
      message: err.message,
      data: null
    });
  }
};

exports.getHeading = async (req, res) => {
  const { heading } = req;

  res.json({
    code: API_CODE_SUCCESS,
    message: "Success",
    data: {
      heading
    }
  });
};

exports.updateHeading = async (req, res) => {
  const { heading } = req;
  const { heading: newHeading, subheading: newSubheading } = req.body;

  try {
    if (newHeading) heading.heading = newHeading;
    if (newSubheading) heading.subheading = newSubheading;

    await heading.save();

    res.json({
      code: API_CODE_SUCCESS,
      message: "Success",
      data: {
        heading
      }
    });
  } catch (err) {
    res.json({
      code: API_CODE_BY_SERVER,
      message: err.message,
      data: null
    });
  }
};

exports.deleteHeading = async (req, res) => {
  const { heading, presentation } = req;

  try {
    await heading.remove();

    presentation.slides = presentation.slides.filter(
      (slide) => slide.slide_id.toString() != heading._id.toString()
    );

    await presentation.save();

    res.json({
      code: API_CODE_SUCCESS,
      message: "Success",
      data: null
    });
  } catch (err) {
    res.json({
      code: API_CODE_BY_SERVER,
      message: err.message,
      data: null
    });
  }
};
