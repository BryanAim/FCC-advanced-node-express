"use strict";

const express = require("express");
const fccTesting = require("./freeCodeCamp/fcctesting.js");
const session = require('express-session');
const mongo = require('mongodb').MongoClient;
const routes = require('./routes.js');
const auth = require('./auth.js');
const path = require('path');
require('dotenv').config()


const app = express();

fccTesting(app); //For FCC testing purposes

app.use("/public", express.static(process.cwd() + "/public"));
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

// set method to assign 'pug' as the 'view-engine'.
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views/pug')) // sets the view directory


mongo.connect(process.env.DATABASE, {
  useUnifiedTopology: true
}, (err, client) => {

  let db = client.db('myproject');

  if (err) {
    console.log('Database error: ' + err);

  } else {
    console.log('Successful database connection');

    auth(app, db);

    routes(app, db);

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Listening on port ${PORT}`);
    });

  }
});