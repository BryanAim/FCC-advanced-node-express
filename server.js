"use strict";

const express = require("express");
const fccTesting = require("./freeCodeCamp/fcctesting.js");
const path = require('path');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongo = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const session = require('express-session');
require('dotenv').config()

const app = express();

fccTesting(app); //For FCC testing purposes

app.use("/public", express.static(process.cwd() + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// set method to assign 'pug' as the 'view-engine'.
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views/pug'))// sets the view directory


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

mongo.connect(process.env.DATABASE,{ useUnifiedTopology: true }, (err, client) => {
  let db = client.db('myproject')
  if (err) {
    console.log('Database error: ' + err);
    
  } else {
    console.log('Successful database connection');

    
// tell passport to use an instantiated LocalStrategy object with a few settings defined


    passport.serializeUser((user, done)=> {
      done(null, user._id);
    });

    passport.deserializeUser((id, done)=> {
      db.collection('users').findOne({
        _id: new ObjectID(id)
      },
      (err, doc) => {
        done(null, doc);
      })
      
    })

    passport.use( new LocalStrategy(
      function (username, password, done) { 
        // tries to find a user in our database with the username entered,
        db.collection('users').findOne({ username: username }, function(err, user) {
          console.log("User : " + username + " attempted to log in");
          if (err) {
            return done(err)
          }
          if (!user) {
            return done(null, false)
          }
          // checks for the password to match
          if (password!== user.password) {
            return done(null, false)
          } else {
            // if no errors have popped up that we checked for, like an incorrect password, the users object is returned and they are authenticated.
            return done(null, user);
          }
        })
       }
    ));
    
    



app.route("/").get((req, res) => {
  //Change the response to render the Pug template
  res.render('index', {
    title: 'Hello',
    message: 'Please login',
    showLogin: true,
  showRegistration: true
}); // render view file on this endpoint
});

// registering a new user
app.route('/register')
.post((req, res, next)=>{
  db.collection('users').findOne({ username: req.body.username },function (err, user) {
    if (err) {
      next(err);
    } else if (user) {
      res.redirect('/');
    } else {
      db.collection('users').insertOne({
        username: req.body.username,
        password: req.body.password
      },
      (err, doc) => {
        if (err) {
          res.redirect('/');
        } else {
          next(null, user);
        }
      })
    }
  })
})


app
.route('/login')
.post(passport.authenticate('local', {failureRedirect: '/' }), (req, res)=> {
  res.redirect('/profile');
});

app
.route('/profile')
.get(ensureAuthenticated, (req, res)=> {
  res.render(process.cwd() + '/views/pug/profile',{ username: req.user.username })
})

app.route('/logout')
.get((req, res) => {
  req.logout();
  res.redirect('/')
});
// handling missing pages (404)
app.use((req, res, next)=>{
  res.status(404)
  .type('text')
  .send('Not found')
})

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  } else {
    res.redirect('/');
  }

}
passport.authenticate('local', {failureRedirect: '/'}), 
(req, res, next) => {
  res.redirect('/profile')
}

    
  }
});




const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
