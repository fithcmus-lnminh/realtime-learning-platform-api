const Question = require("../models/question.model");
const { API_CODE_SUCCESS, API_CODE_BY_SERVER } = require("../constants");

exports.getQuestions = async (req, res) => {
  const { presentation_id, last_question_id, limit = 10 } = req.query;
  const { user } = req;

  try {
    const lastQuestion = await Question.findOne({
      _id: last_question_id
    });

    let questions = await Question.find({
      presentation_id,
      createdAt: {
        $lt: lastQuestion ? lastQuestion.createdAt : new Date().toISOString()
      }
    })
      .sort({
        createdAt: -1
      })
      .limit(limit)
      .lean({
        autopopulate: true
      });

    questions = questions.map((question) => {
      question.total_votes = question.upvotes.length;
      question.is_voted = false;

      question.upvotes.forEach((upvote) => {
        if (upvote.user_id.toString() === user._id.toString()) {
          question.is_voted = true;
        }
      });

      return question;
    });

    res.json({
      code: API_CODE_SUCCESS,
      message: "Success",
      data: questions.reverse()
    });
  } catch (err) {
    res.json({
      code: API_CODE_BY_SERVER,
      message: err.message,
      data: null
    });
  }
};
