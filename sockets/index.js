const { Server } = require("socket.io");
const { validate } = require("./auth");
const { registerPresentationHandler } = require("./presentation");
const { registerNotificationHandler } = require("./notification");
const { registerGroupHandler } = require("./group");

const io = new Server({
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true
  }
});

const presentationSocket = io.of("/presentation").use(validate);
const notificationSocket = io.of("/notification").use(validate);
const groupSocket = io.of("/group").use(validate);

presentationSocket.on("connection", (socket) => {
  registerPresentationHandler(io, socket);
});

notificationSocket.on("connection", async (socket) => {
  await registerNotificationHandler(io, socket);
});

groupSocket.on(
  "connection",
  async (socket) => await registerGroupHandler(io, socket)
);

module.exports = io;
