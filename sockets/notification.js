const GroupUser = require("../models/groupUser.model");
const { SOCKET_CODE_SUCCESS, SOCKET_CODE_FAIL } = require("../constants");

exports.registerNotificationHandler = async (io, socket) => {
  const user = socket.user;
  const groupUsers = await GroupUser.find({ user_id: user.id });

  groupUsers.forEach((groupUser) => {
    socket.join(groupUser.group_id.toString());
  });

  console.log(socket.rooms);
};
