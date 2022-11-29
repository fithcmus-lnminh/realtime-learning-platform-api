const passport = require("passport");
const User = require("../models/user.model");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL}/auth/google/callback`
    },
    async (accessToken, refreshToken, profile, done) => {
      const googleId = profile.id;
      const email = profile.emails[0].value;
      const firstName = profile.name.givenName;
      const lastName = profile.name.familyName;
      const source = "google";

      const currentUser = await User.findOne({ email });

      if (!currentUser) {
        const newUser = await User.create({
          google_id: googleId,
          email,
          first_name: firstName,
          last_name: lastName,
          activated: true,
          token: null,
          source
        });
        return done(null, newUser);
      }

      if (currentUser.source != "google") {
        return done(null, false, {
          message: `You have previously signed up with a different signin method`
        });
      }

      return done(null, currentUser);
    }
  )
);
