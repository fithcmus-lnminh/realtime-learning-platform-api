const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const Anonymous = require("../models/anonymous.model");
const User = require("../models/user.model");
const GroupUser = require("../models/groupUser.model");
const Presentation = require("../models/presentation.model");
const Option = require("../models/option.model");
const { SOCKET_CODE_SUCCESS, SOCKET_CODE_FAIL } = require("../constants");
const { Presentations } = require("../utils/presentations");
const { Viewers } = require("../utils/viewers");

const io = new Server({
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true
  }
});
const presentations = new Presentations();
const viewers = new Viewers();

io.of("/presentation")
  .use(async (socket, next) => {
    try {
      const { token } = socket.handshake.headers;

      if (!token) {
        return next(new Error("Missing token"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (!decoded) {
        return next(new Error("Invalid token"));
      }

      socket.user = decoded;

      if (
        (socket.user.role === "Anonymous" &&
          !(await Anonymous.findById(socket.user.id))) ||
        (socket.user.role === "User" && !(await User.findById(socket.user.id)))
      ) {
        return next(new Error("User not found"));
      }

      next();
    } catch (err) {
      return new Error(err.message);
    }
  })
  .on("connection", (socket) => {
    const { user } = socket;

    socket.on("teacher-join-presentation", async (data, callback) => {
      const { access_code } = data;

      const presentation = await Presentation.findOne({
        access_code,
        user_id: user.id
      });

      if (!presentation) {
        return callback({
          code: SOCKET_CODE_FAIL,
          message: "Presentation not found"
        });
      }

      user.access_code = access_code;
      user.is_teacher = true;

      socket.join(access_code);

      socket.emit("get-total-students", {
        total_users: viewers.getTotalUsers(access_code)
      });

      callback({
        code: SOCKET_CODE_SUCCESS,
        message: "Teacher joined presentation"
      });
    });

    socket.on("teacher-start-presentation", async (data, callback) => {
      const { current_slide } = data;
      const { is_teacher, access_code } = user;

      if (!is_teacher) {
        return callback({
          code: SOCKET_CODE_FAIL,
          message: "User is not a teacher"
        });
      }

      const presentation = await Presentation.findOne({
        access_code,
        user_id: user.id
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

      presentation.slides = presentation.slides.map((slide) => {
        return {
          slide_type: slide.slide_type,
          content: slide.slide_id
        };
      });

      presentations.addPresentation({
        access_code,
        slides: presentation.slides,
        current_slide: parseInt(current_slide)
      });

      socket.to(access_code).emit("get-slide", {
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

      callback({
        code: SOCKET_CODE_SUCCESS,
        message: "Presentation started"
      });
    });

    socket.on("student-join-presentation", async (data, callback) => {
      const { access_code } = data;

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
        presentation.group_id &&
        !(await GroupUser.findOne({
          user_id: user.id,
          group_id: presentation.group_id
        }))
      ) {
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

      socket.join(access_code);

      socket.to(access_code).emit("get-total-students", {
        total_users: viewers.getTotalUsers(access_code)
      });

      socket.emit("get-total-students", {
        total_users: viewers.getTotalUsers(access_code)
      });

      callback({
        code: SOCKET_CODE_SUCCESS,
        message: "Student joined presentation"
      });
    });

    socket.on("teacher-next-slide", async (data, callback) => {
      const { access_code, is_teacher } = user;

      if (!is_teacher) {
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
      const { access_code, is_teacher } = user;

      if (!is_teacher) {
        return callback({
          code: SOCKET_CODE_FAIL,
          message: "User is not teacher"
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
      const { access_code, is_teacher } = user;

      if (!is_teacher) {
        return callback({
          code: SOCKET_CODE_FAIL,
          message: "User is not teacher"
        });
      }

      presentations.removePresentation(access_code);

      socket.to(access_code).emit("end-presentation");

      callback({
        code: SOCKET_CODE_SUCCESS,
        message: "Presentation ended"
      });
    });

    socket.on("student-vote-option", async (data, callback) => {
      const { option_id } = data;
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

    socket.on("disconnecting", () => {
      const { access_code } = user;
      const viewer = viewers.getViewer(access_code, user.id);

      if (viewer) {
        viewers.removeViewer(access_code, user.id);

        socket.to(access_code).emit("get-total-students", {
          total_users: viewers.getTotalUsers(access_code)
        });
      }

      if (user.is_teacher) {
        presentations.removePresentation(access_code);
      }
    });
  });

module.exports = io;
