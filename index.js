const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { createServer } = require("http");
const connectDb = require("./config/db");
const { errorHandler } = require("./middlewares/error");
const authRouter = require("./routes/auth.route");
const groupRouter = require("./routes/group.route");
const accountRouter = require("./routes/account.route");
const OAuth2Router = require("./routes/oauth2.route");
const userRouter = require("./routes/user.route");
const presentationRouter = require("./routes/presentation.route");
const anonymousRouter = require("./routes/anonymous.route");
const passport = require("passport");
const session = require("express-session");
const cron = require("node-cron");

const app = express();

dotenv.config();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
connectDb();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
const port = process.env.PORT || 5000;

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
    proxy: true,
    name: "session-google",
    cookie: {
      secure: process.env.NODE_ENV !== "development",
      maxAge: 1000 * 60 * 60 * 48,
      sameSite: process.env.NODE_ENV !== "development" ? "none" : "lax",
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

require("./config/passport");

app.use("/api/auth", authRouter);
app.use("/api/group", groupRouter);
app.use("/api/account", accountRouter);
app.use("/auth/google", OAuth2Router);
app.use("/api/user", userRouter);
app.use("/api/presentation", presentationRouter);
app.use("/api/anonymous", anonymousRouter);

app.use(errorHandler);

//prevent hosting server shut down after 15 minutes
cron.schedule("*/15 * * * *", () => {
  console.log(`The app is still listening on port ${port}!`);
});

const httpServer = createServer(app);
httpServer.listen(port, () =>
  console.log(`The app is listening on port ${port}!`)
);

module.exports = httpServer;

require("./sockets/presentation").attach(httpServer);
