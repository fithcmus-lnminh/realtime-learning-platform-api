const GroupUser = require("../models/groupUser.model");

exports.registerNotificationHandler = async (io, socket) => {
  const user = socket.user;
  const groupUsers = await GroupUser.find({ user_id: user.id });

  groupUsers.forEach((groupUser) => {
    socket.join(groupUser.group_id.toString());
  });

  console.log(socket.rooms);
};
