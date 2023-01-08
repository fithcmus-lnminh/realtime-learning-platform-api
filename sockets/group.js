const GroupUser = require("../models/groupUser.model");
const { SOCKET_CODE_SUCCESS, SOCKET_CODE_FAIL } = require("../constants");
const presentations = require("../utils/presentations");

exports.registerGroupHandler = async (io, socket) => {
  const user = socket.user;

  socket.on("join-group", async (data, callback) => {
    const { group_id } = data;

    try {
      const groupUser = await GroupUser.findOne({
        group_id,
        user_id: user.id
      });

      if (!groupUser) {
        return callback({
          code: SOCKET_CODE_FAIL,
          message: "You are not in this group"
        });
      }

      socket.join(group_id);

      const presentation = presentations.getPresentationByGroup(group_id);

      if (presentation) {
        socket.emit("start-presentation", {
          message: `Presentation "${presentation.title}" is started`,
          data: {
            presentation_id: presentation._id,
            title: presentation.title,
            access_code: presentation.access_code
          }
        });
      }

      callback({
        code: SOCKET_CODE_SUCCESS,
        message: "Join group successfully"
      });
    } catch (err) {
      callback({
        code: SOCKET_CODE_FAIL,
        message: err.message
      });
    }
  });
};
