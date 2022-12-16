const Paragraph = require("../models/paragraph.model.js");
const { API_CODE_SUCCESS, API_CODE_BY_SERVER } = require("../constants");

exports.createParagraph = async (req, res) => {
  const { paragraph, heading } = req.body;
  const { presentation } = req;

  try {
    const paragraphSlide = await Paragraph.create({
      paragraph,
      heading
    });

    presentation.slides.push({
      slide_type: "Paragraph",
      slide_id: paragraphSlide._id
    });

    await presentation.save();

    res.json({
      code: API_CODE_SUCCESS,
      message: "Success",
      data: {
        paragraph: paragraphSlide
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

exports.getParagraphs = async (req, res) => {
  const { presentation } = req;

  try {
    const paragraphs = await Paragraph.find({
      _id: {
        $in: presentation.slides
          .filter((slide) => slide.slide_type === "Paragraph")
          .map((slide) => slide.slide_id)
      }
    });

    res.json({
      code: API_CODE_SUCCESS,
      message: "Success",
      data: {
        paragraphs
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

exports.getParagraph = async (req, res) => {
  const { paragraph } = req;

  res.json({
    code: API_CODE_SUCCESS,
    message: "Success",
    data: {
      paragraph
    }
  });
};

exports.updateParagraph = async (req, res) => {
  const { paragraph } = req;
  const { paragraph: newParagraph, heading: newHeading } = req.body;

  try {
    paragraph.paragraph = newParagraph;
    paragraph.heading = newHeading;
    await paragraph.save();

    res.json({
      code: API_CODE_SUCCESS,
      message: "Success",
      data: {
        paragraph
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

exports.deleteParagraph = async (req, res) => {
  const { paragraph, presentation } = req;

  try {
    await paragraph.remove();
    presentation.slides = presentation.slides.filter(
      (slide) => slide.slide_id.toString() != paragraph._id.toString()
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
