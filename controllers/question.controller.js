const Question = require("../models/question.model");
const mongoose = require("mongoose");
const { API_CODE_SUCCESS, API_CODE_BY_SERVER } = require("../constants");

exports.getQuestions = async (req, res) => {
  const {
    presentation_id,
    last_question_id,
    limit = 10,
    sort = "newest"
  } = req.query;
  const { user } = req;

  try {
    const lastQuestion = await Question.findOne({
      _id: last_question_id
    });

    const sortOptions = {
      newest: {
        createdAt: -1
      },
      oldest: {
        createdAt: 1
      },
      "most-votes": {
        total_votes: -1,
        createdAt: -1
      },
      "least-votes": {
        total_votes: 1,
        createdAt: -1
      },
      marked: {
        is_answered: -1,
        createdAt: -1
      },
      unmarked: {
        is_answered: 1,
        createdAt: -1
      }
    };

    let queryOptions = {
      presentation_id: mongoose.Types.ObjectId(presentation_id)
    };

    let questions = await Question.aggregate([
      {
        $match: queryOptions
      },
      {
        $addFields: {
          total_votes: {
            $size: "$upvotes"
          },
          is_voted: {
            $in: [mongoose.Types.ObjectId(user._id), "$upvotes.user_id"]
          }
        }
      }
    ]).sort(sortOptions[sort]);

    await Question.populate(questions, [
      {
        path: "questioner_id",
        select: "name first_name last_name"
      },
      {
        path: "answers.answerer_id",
        select: "first_name last_name"
      }
    ]);

    const index = lastQuestion
      ? questions.findIndex(
          (question) => question._id.toString() == lastQuestion._id.toString()
        )
      : -1;

    questions = questions.slice(index + 1, index + parseInt(limit) + 1);

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
