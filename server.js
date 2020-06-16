"use strict";

const express = require("express");
const fccTesting = require("./freeCodeCamp/fcctesting.js");
const path = require('path');
const passport = require('passport');
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

mongo.connect(process.env.DATABASE,{ useUnifiedTopology: true }, (err, db) => {
  if (err) {
    console.log('Database error: ' + err);
    
  } else {
    console.log('Successful database connection');

    passport.serializeUser((user, done)=> {
      done(null, user._id);
    });
    
  }
});


passport.deserializeUser((id, done)=> {
  db.collection('users').findOne({
    _id: new ObjectID(id)
  },
  (err, doc) => {
    done(null, doc);
  })
  
})


app.route("/").get((req, res) => {
  //Change the response to render the Pug template
  res.render('index', {title: 'Hello', message: 'Please login'}); // render view file on this endpoint
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
