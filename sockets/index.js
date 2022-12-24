const { Server } = require("socket.io");
const { validate } = require("./auth");
const { registerPresentationHandler } = require("./presentation");
const { registerNotificationHandler } = require("./notification");

const io = new Server({
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true
  }
});

const presentationSocket = io.of("/presentation").use(validate);
const notificationSocket = io.of("/notification").use(validate);

presentationSocket.on("connection", (socket) =>
  registerPresentationHandler(io, socket)
);

notificationSocket.on("connection", (socket) =>
  registerNotificationHandler(io, socket)
);

module.exports = io;
