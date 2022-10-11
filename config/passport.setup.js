const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
require("dotenv").config();
const User = require("../models/user.models");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => {
    done(null, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      callbackURL: "/auth/google/redirect",
      clientID: process.env.clientID,
      clientSecret: process.env.clientSecret,
    },
    (accessToken, refreshToken, profile, done) => {
      // console.log(profile);
      User.findOne({ googleid: profile.id }).then((currentUser) => {
        if (currentUser) {
          console.log(`User is ${currentUser}`);
          done(null, currentUser);
        } else {
          new User({
            username: profile.displayName,
            googleId: profile.id,
            thumbnail: profile._json.picture,
          })
            .save()
            .then((newUser) => {
              console.log(`new user created ${newUser}`);
              done(null, newUser);
            });
        }
      });
      const dataInfo = {
        status: "success",
        message: "login successfull",
        accessToken:  accessToken,
      };
    console.log(dataInfo);
    }
  )
);
