const GroupUser = require("../models/groupUser.model");
const Presentation = require("../models/presentation.model");
const PresentationGroup = require("../models/presentationGroup.model");
const PresentationUser = require("../models/presentationUser.model");
const Option = require("../models/option.model");
const Message = require("../models/message.model");
const Question = require("../models/question.model");
const { SOCKET_CODE_SUCCESS, SOCKET_CODE_FAIL } = require("../constants");

const presentations = require("../utils/presentations");
const viewers = require("../utils/viewers");

exports.registerPresentationHandler = (io, socket) => {
  const { user } = socket;

  socket.on("teacher-join-presentation", async (data, callback) => {
    const { access_code } = data;

    try {
      const presentation = await Presentation.findOne({
        access_code
      });

      if (!presentation) {
        return callback({
          code: SOCKET_CODE_FAIL,
          message: "Presentation not found"
        });
      }

      const presentationUser = await PresentationUser.findOne({
        presentation_id: presentation._id,
        user_id: user.id
      });

      if (!presentationUser) {
        return callback({
          code: SOCKET_CODE_FAIL,
          message: "User is not a member of this presentation"
        });
      }

      user.access_code = access_code;
      user.is_teacher = true;

      socket.join(access_code);

      socket.emit("get-total-students", {
        total_users: viewers.getTotalUsers(access_code)
      });

      if (presentations.getPresentation(access_code))
        socket.emit("start-presentation");

      callback({
        code: SOCKET_CODE_SUCCESS,
        message: "Teacher joined presentation"
      });
    } catch (err) {
      callback({
        code: SOCKET_CODE_FAIL,
        message: err.message
      });
    }
  });

  socket.on("teacher-start-presentation", async (data, callback) => {
    const { current_slide } = data;
    const { is_teacher, access_code } = user;

    try {
      if (!is_teacher) {
        return callback({
          code: SOCKET_CODE_FAIL,
          message: "User is not a teacher"
        });
      }

      const presentation = await Presentation.findOne({
        access_code
      })
        .populate("slides.slide_id")
        .lean({ autopopulate: true });

      if (!presentation) {
        return callback({
          code: SOCKET_CODE_FAIL,
          message: "Presentation not found"
        });
      }

      if (current_slide > presentation.slides.length || current_slide < 1) {
        return callback({
          code: SOCKET_CODE_FAIL,
          message: "Invalid current slide"
        });
      }

      if (presentations.getPresentation(access_code)) {
        return callback({
          code: SOCKET_CODE_FAIL,
          message: "Presentation is already presented"
        });
      }

      presentation.slides = presentation.slides.map((slide) => {
        return {
          slide_type: slide.slide_type,
          content: slide.slide_id
        };
      });

      const presentationGroups = await PresentationGroup.find({
        presentation_id: presentation._id
      }).distinct("group_id");

      const group_ids = presentationGroups.map((group) => group.toString());

      presentations.addPresentation({
        _id: presentation._id,
        title: presentation.title,
        access_code,
        slides: presentation.slides,
        current_slide: parseInt(current_slide),
        group_ids
      });

      user.is_host = true;

      socket.to(access_code).emit("get-slide", {
        presentation_id: presentation._id,
        slide: {
          ...presentation.slides[0],
          content: {
            ...presentation.slides[0].content,
            options: presentation.slides[0].content?.options?.map((option) => ({
              ...option,
              numUpvote: option.upvotes.length
            }))
          }
        },
        current_slide: current_slide,
        total_slides: presentation.slides.length
      });

      socket.emit("get-slide", {
        presentation_id: presentation._id,
        slide: {
          ...presentation.slides[0],
          content: {
            ...presentation.slides[0].content,
            options: presentation.slides[0].content?.options?.map((option) => ({
              ...option,
              numUpvote: option.upvotes.length
            }))
          }
        },
        current_slide: current_slide,
        total_slides: presentation.slides.length
      });

      socket.to(access_code).emit("start-presentation");

      io.of("/notification")
        .to(presentation._id.toString())
        .emit("new-notification", {
          message: `Presentation "${presentation.title}" is started`,
          data: {
            type: "presentation",
            presentation_id: presentation._id,
            title: presentation.title,
            access_code: presentation,
            host_id: user.id
          }
        });

      group_ids.forEach((group_id) => {
        io.of("/group")
          .to(group_id)
          .emit("start-presentation", {
            message: `Presentation "${presentation.title}" is started`,
            data: {
              presentation_id: presentation._id,
              title: presentation.title,
              access_code: presentation.access_code
            }
          });
      });

      callback({
        code: SOCKET_CODE_SUCCESS,
        message: "Presentation started"
      });
    } catch (err) {
      callback({
        code: SOCKET_CODE_FAIL,
        message: err.message
      });
    }
  });

  socket.on("student-join-presentation", async (data, callback) => {
    const { access_code } = data;

    try {
      if (user.access_code) {
        return callback({
          code: SOCKET_CODE_FAIL,
          message: "User already joined presentation"
        });
      }

      const presentation = await Presentation.findOne({
        access_code
      });

      if (!presentation) {
        return callback({
          code: SOCKET_CODE_FAIL,
          message: "Presentation not found"
        });
      }

      if (
        await PresentationUser.exists({
          presentation_id: presentation._id,
          user_id: user.id
        })
      ) {
        user.is_teacher = true;
      } else if (!presentation.is_public) {
        if (user.type == "Anonymous")
          return callback({
            code: SOCKET_CODE_FAIL,
            message: "Presentation is not public"
          });

        const presentationGroups = await PresentationGroup.find({
          presentation_id: presentation._id
        });

        if (
          !(await GroupUser.exists({
            user_id: user.id,
            group_id: {
              $in: presentationGroups.map((group) => group.group_id)
            }
          }))
        )
          return callback({
            code: SOCKET_CODE_FAIL,
            message: "User not in group"
          });
      }

      viewers.addViewer({
        access_code,
        id: user.id,
        type: user.type
      });

      user.access_code = access_code;

      if (
        await PresentationUser.exists({
          user_id: user.id,
          presentation_id: presentation._id
        })
      ) {
        user.is_teacher = true;
      }

      socket.join(access_code);

      socket.to(access_code).emit("get-total-students", {
        total_users: viewers.getTotalUsers(access_code)
      });

      socket.emit("get-total-students", {
        total_users: viewers.getTotalUsers(access_code)
      });

      const currentPresentation = presentations.getPresentation(access_code);

      if (currentPresentation) {
        socket.emit("get-slide", {
          presentation_id: presentation.id,
          slide: {
            ...currentPresentation.slides[
              currentPresentation.current_slide - 1
            ],
            content: {
              ...currentPresentation.slides[
                currentPresentation.current_slide - 1
              ].content,
              options: currentPresentation.slides[
                currentPresentation.current_slide - 1
              ].content?.options?.map((option) => ({
                ...option,
                numUpvote: option.upvotes.length
              }))
            }
          },
          current_slide: currentPresentation.current_slide,
          total_slides: currentPresentation.slides.length
        });
      }

      callback({
        code: SOCKET_CODE_SUCCESS,
        message: "Student joined presentation",
        data: {
          is_teacher: user.is_teacher
        }
      });
    } catch (err) {
      callback({
        code: SOCKET_CODE_FAIL,
        message: err.message
      });
    }
  });

  socket.on("teacher-next-slide", async (data, callback) => {
    const { access_code, is_host } = user;

    if (!is_host) {
      return callback({
        code: SOCKET_CODE_FAIL,
        message: "User is not teacher"
      });
    }

    const presentation = presentations.getPresentation(access_code);
    const next_slide = presentation.current_slide + 1;

    if (next_slide > presentation.slides.length) {
      return callback({
        code: SOCKET_CODE_FAIL,
        message: "No more slides"
      });
    }

    presentation.current_slide = next_slide;

    socket.to(access_code).emit("get-slide", {
      presentation_id: presentation._id,
      slide: {
        ...presentation.slides[next_slide - 1],
        content: {
          ...presentation.slides[next_slide - 1].content,
          options: presentation.slides[next_slide - 1].content?.options?.map(
            (option) => ({ ...option, numUpvote: option.upvotes.length })
          )
        }
      },
      current_slide: next_slide,
      total_slides: presentation.slides.length
    });

    socket.emit("get-slide", {
      presentation_id: presentation._id,
      slide: {
        ...presentation.slides[next_slide - 1],
        content: {
          ...presentation.slides[next_slide - 1].content,
          options: presentation.slides[next_slide - 1].content?.options?.map(
            (option) => ({ ...option, numUpvote: option.upvotes.length })
          )
        }
      },
      current_slide: next_slide,
      total_slides: presentation.slides.length
    });

    callback({
      code: SOCKET_CODE_SUCCESS,
      message: "Next slide"
    });
  });

  socket.on("teacher-previous-slide", async (data, callback) => {
    const { access_code, is_host } = user;

    if (!is_host) {
      return callback({
        code: SOCKET_CODE_FAIL,
        message: "User is not host"
      });
    }

    const presentation = presentations.getPresentation(access_code);
    const previous_slide = presentation.current_slide - 1;

    if (previous_slide < 1) {
      return callback({
        code: SOCKET_CODE_FAIL,
        message: "No more slides"
      });
    }

    presentation.current_slide = previous_slide;

    socket.to(access_code).emit("get-slide", {
      presentation_id: presentation._id,
      slide: {
        ...presentation.slides[previous_slide - 1],
        content: {
          ...presentation.slides[previous_slide - 1].content,
          options: presentation.slides[
            previous_slide - 1
          ].content?.options?.map((option) => ({
            ...option,
            numUpvote: option.upvotes.length
          }))
        }
      },
      current_slide: previous_slide,
      total_slides: presentation.slides.length
    });

    socket.emit("get-slide", {
      presentation_id: presentation._id,
      slide: {
        ...presentation.slides[previous_slide - 1],
        content: {
          ...presentation.slides[previous_slide - 1].content,
          options: presentation.slides[
            previous_slide - 1
          ].content?.options?.map((option) => ({
            ...option,
            numUpvote: option.upvotes.length
          }))
        }
      },
      current_slide: previous_slide,
      total_slides: presentation.slides.length
    });

    callback({
      code: SOCKET_CODE_SUCCESS,
      message: "Previous slide"
    });
  });

  socket.on("teacher-end-presentation", async (data, callback) => {
    try {
      const { access_code, is_host } = user;

      if (!is_host) {
        return callback({
          code: SOCKET_CODE_FAIL,
          message: "User is not host"
        });
      }

      const presentation = presentations.getPresentation(access_code);

      if (presentation) {
        const { group_ids } = presentation;

        group_ids.forEach((group_id) => {
          io.of("/group").to(group_id).emit("end-presentation");
        });

        presentations.removePresentation(access_code);
      }

      socket.to(access_code).emit("end-presentation");

      user.is_host = false;

      callback({
        code: SOCKET_CODE_SUCCESS,
        message: "Presentation ended"
      });
    } catch (err) {
      callback({
        code: SOCKET_CODE_FAIL,
        message: err.message
      });
    }
  });

  socket.on("student-vote-option", async (data, callback) => {
    const { option_id } = data;
    const { access_code } = user;

    try {
      if (!access_code) {
        return callback({
          code: SOCKET_CODE_FAIL,
          message: "User is not in presentation"
        });
      }

      const presentation = presentations.getPresentation(access_code);

      if (!presentation) {
        return callback({
          code: SOCKET_CODE_FAIL,
          message: "Presentation not found"
        });
      }

      const slide = presentation.slides[presentation.current_slide - 1];

      if (slide.slide_type !== "MultipleChoice") {
        return callback({
          code: SOCKET_CODE_FAIL,
          message: "Slide is not multiple choice"
        });
      }

      const option = slide.content.options.find(
        (option) => option._id == option_id
      );

      if (!option) {
        return callback({
          code: SOCKET_CODE_FAIL,
          message: "Option not found"
        });
      }

      const voter = slide.content.options.find((option) => {
        return option.upvotes.find(
          (upvote) => upvote.user_id == user.id && upvote.user_type == user.type
        );
      });

      if (voter) {
        return callback({
          code: SOCKET_CODE_FAIL,
          message: "User already voted"
        });
      }

      const optionInDb = await Option.findById(option_id);

      optionInDb.upvotes.push({
        user_id: user.id,
        user_type: user.type
      });

      await optionInDb.save();

      option.upvotes.push({
        user_id: user.id,
        user_type: user.type
      });

      socket.to(access_code).emit("get-score", {
        options: slide.content.options.map((option) => ({
          ...option,
          numUpvote: option.upvotes.length
        }))
      });

      socket.emit("get-score", {
        options: slide.content.options.map((option) => ({
          ...option,
          numUpvote: option.upvotes.length
        }))
      });

      callback({
        code: SOCKET_CODE_SUCCESS,
        message: "Option voted"
      });
    } catch (err) {
      callback({
        code: SOCKET_CODE_FAIL,
        message: err.message
      });
    }
  });

  socket.on("student-check-vote", async (data, callback) => {
    const { access_code } = user;

    if (!access_code) {
      return callback({
        code: SOCKET_CODE_FAIL,
        message: "User is not in presentation"
      });
    }

    const presentation = presentations.getPresentation(access_code);

    if (!presentation) {
      return callback({
        code: SOCKET_CODE_FAIL,
        message: "Presentation not found"
      });
    }

    const slide = presentation.slides[presentation.current_slide - 1];

    if (slide.slide_type !== "MultipleChoice") {
      return callback({
        code: SOCKET_CODE_FAIL,
        message: "Slide is not multiple choice"
      });
    }

    const voter = slide.content.options.find((option) => {
      return option.upvotes.find(
        (upvote) => upvote.user_id == user.id && upvote.user_type == user.type
      );
    });

    if (!voter) {
      return callback({
        code: SOCKET_CODE_SUCCESS,
        message: "User has not voted",
        data: {
          is_voted: false
        }
      });
    }

    callback({
      code: SOCKET_CODE_SUCCESS,
      message: "User has voted",
      data: {
        is_voted: true,
        option_id: voter._id
      }
    });
  });

  socket.on("send-message", async (data, callback) => {
    const { access_code } = user;

    if (!access_code) {
      return callback({
        code: SOCKET_CODE_FAIL,
        message: "User is not in presentation"
      });
    }

    const { content } = data;

    try {
      const presentation = await Presentation.findOne({ access_code });
      const message = await Message.create({
        content,
        presentation_id: presentation._id,
        sender_type: user.type,
        sender_id: user.id
      });

      socket.to(access_code).emit("message-received", {
        message
      });

      callback({
        code: SOCKET_CODE_SUCCESS,
        message: "Message sent"
      });
    } catch (err) {
      callback({
        code: SOCKET_CODE_FAIL,
        message: err.message
      });
    }
  });

  socket.on("send-question", async (data, callback) => {
    const { access_code } = user;

    if (!access_code) {
      return callback({
        code: SOCKET_CODE_FAIL,
        message: "User is not in presentation"
      });
    }

    const { question } = data;

    try {
      const presentation = await Presentation.findOne({ access_code });
      const questionI = await Question.create({
        question,
        presentation_id: presentation._id,
        upvotes: [],
        questioner_type: user.type,
        questioner_id: user.id
      });

      socket.to(access_code).emit("question-received", {
        question: {
          ...questionI._doc,
          total_votes: questionI.upvotes.length
        }
      });

      callback({
        code: SOCKET_CODE_SUCCESS,
        message: "Question sent"
      });
    } catch (err) {
      callback({
        code: SOCKET_CODE_FAIL,
        message: err.message
      });
    }
  });

  socket.on("send-answer", async (data, callback) => {
    const { is_teacher, access_code } = user;

    if (!is_teacher)
      return callback({
        code: SOCKET_CODE_FAIL,
        message: "User is not teacher"
      });

    const { question_id, answer } = data;

    try {
      const questionI = await Question.findOneAndUpdate(
        {
          _id: question_id
        },
        {
          $push: {
            answers: {
              answer,
              answerer_id: user.id
            }
          }
        },
        {
          new: true
        }
      );

      socket.to(access_code).emit("question-updated", {
        question: {
          ...questionI._doc,
          total_votes: questionI.upvotes.length
        }
      });

      callback({
        code: SOCKET_CODE_SUCCESS,
        message: "Answer sent"
      });
    } catch (err) {
      callback({
        code: SOCKET_CODE_FAIL,
        message: err.message
      });
    }
  });

  socket.on("mark-answer", async (data, callback) => {
    const { is_teacher, access_code } = user;

    if (!is_teacher)
      return callback({
        code: SOCKET_CODE_FAIL,
        message: "User is not teacher"
      });

    try {
      const questionI = await Question.findOne({
        _id: data.question_id
      });

      questionI.is_answered = !questionI.is_answered;

      await questionI.save();

      socket.to(access_code).emit("question-updated", {
        question: {
          ...questionI._doc,
          total_votes: questionI.upvotes.length
        }
      });

      callback({
        code: SOCKET_CODE_SUCCESS,
        message: "Answer marked"
      });
    } catch (err) {
      callback({
        code: SOCKET_CODE_FAIL,
        message: err.message
      });
    }
  });

  socket.on("vote-question", async (data, callback) => {
    const { access_code } = user;

    if (!access_code) {
      return callback({
        code: SOCKET_CODE_FAIL,
        message: "User is not in presentation"
      });
    }

    const { question_id } = data;

    try {
      const questionI = await Question.findOne({
        _id: question_id
      });

      const voter = questionI.upvotes.find(
        (upvote) => upvote.user_id == user.id && upvote.user_type == user.type
      );

      if (voter) {
        questionI.upvotes = questionI.upvotes.filter(
          (upvote) => upvote.user_id != user.id || upvote.user_type != user.type
        );
      } else {
        questionI.upvotes.push({
          user_id: user.id,
          user_type: user.type
        });
      }

      await questionI.save();

      socket.to(access_code).emit("question-updated", {
        question: {
          ...questionI._doc,
          total_votes: questionI.upvotes.length
        }
      });

      callback({
        code: SOCKET_CODE_SUCCESS,
        message: "Question upvoted"
      });
    } catch (err) {
      callback({
        code: SOCKET_CODE_FAIL,
        message: err.message
      });
    }
  });

  socket.on("disconnecting", () => {
    try {
      const { access_code } = user;
      const viewer = viewers.getViewer(access_code, user.id);

      if (viewer) {
        viewers.removeViewer(access_code, user.id);

        socket.to(access_code).emit("get-total-students", {
          total_users: viewers.getTotalUsers(access_code)
        });
      }

      if (user.is_host) {
        const presentation = presentations.getPresentation(access_code);

        if (presentation) {
          const { group_ids } = presentation;

          group_ids.forEach((group_id) => {
            io.of("/group").to(group_id).emit("end-presentation");
          });

          presentations.removePresentation(access_code);
        }
      }
    } catch (err) {
      console.log(err);
    }
  });
};
