const Anonymous = require("../models/anonymous.model");
const { API_CODE_SUCCESS, API_CODE_BY_SERVER } = require("../constants");
const generateToken = require("../utils/generateToken");

exports.createAnonymous = async (req, res) => {
  const { name } = req.body;

  try {
    const anonymous = await Anonymous.create({ name });
    const token = generateToken(
      anonymous._id,
      process.env.JWT_SECRET,
      "Anonymous"
    );

    res.status(201).json({
      code: API_CODE_SUCCESS,
      message: "Success",
      data: { token },
    });
  } catch (err) {
    res.status(500).json({
      code: API_CODE_BY_SERVER,
      success: false,
      message: err.message,
    });
  }
};
