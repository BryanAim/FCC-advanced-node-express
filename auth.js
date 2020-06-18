const session = require('express-session');
const passport = require('passport');
const ObjectID = require('mongodb').ObjectID;
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');
require('dotenv').config()


module.exports = function(app, db) {
    // Create a session middleware with the given options
    app.use(session({
      secret: process.env.SESSION_SECRET,
      resave: true,
      saveUninitialized: true
    }));
    // initialize passport middleware
    app.use(passport.initialize());
    // enable session support
    app.use(passport.session());

    passport.serializeUser((user, done) => {
      done(null, user._id);
    });

    passport.deserializeUser((id, done) => {
      db.collection('users').findOne({
          _id: new ObjectID(id)
        },
        (err, doc) => {
          done(null, doc);
        })
    });

    
    // tell passport to use an instantiated LocalStrategy object with a few settings defined
    passport.use(new LocalStrategy(
      function (username, password, done) {
        // tries to find a user in our database with the username entered,
        db.collection('users').findOne({
          username: username
        }, function (err, user) {
          console.log("User " + username + " attempted to log in.");
          if (err) {
            return done(err)
          }
          if (!user) {
            return done(null, false)
          }
          // checks for the password to match
          if (!bcrypt.compareSync(password, user.password)) {
            return done(null, false)
          } else {
            // if no errors have popped up that we checked for, like an incorrect password, the users object is returned and they are authenticated.
            return done(null, user);
          }
        })
      }
    ));


}