const Message = require("../models/message.model");
const { API_CODE_SUCCESS, API_CODE_BY_SERVER } = require("../constants");

exports.getMessages = async (req, res) => {
  const { presentation_id, last_message_id, limit = 10 } = req.query;

  try {
    const lastMessage = await Message.findOne({
      _id: last_message_id
    });

    const messages = await Message.find({
      presentation_id,
      createdAt: {
        $lt: lastMessage ? lastMessage.createdAt : new Date().toISOString()
      }
    })
      .sort({
        createdAt: -1
      })
      .limit(limit);

    res.json({
      code: API_CODE_SUCCESS,
      message: "Success",
      data: messages
    });
  } catch (err) {
    res.json({
      code: API_CODE_BY_SERVER,
      message: err.message,
      data: null
    });
  }
};
