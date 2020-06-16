"use strict";

const express = require("express");
const fccTesting = require("./freeCodeCamp/fcctesting.js");
const path = require('path');
const passport = require('passport');
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

app.route("/").get((req, res) => {
  //Change the response to render the Pug template
  res.render('index', {title: 'Hello', message: 'Please login'}); // render view file on this endpoint
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
