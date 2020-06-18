const passport = require('passport');
const bcrypt = require('bcrypt');
require('dotenv').config()


module.exports = function(app, db) {

  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    } else {
      res.redirect('/');
    }
  }
  app.route('/')
  .get((req, res) => {
    //Change the response to render the Pug template
    res.render(process.cwd() + '/views/pug/index', {
      title: 'Hello',
      message: 'Please login',
      showLogin: true,
      showRegistration: true
    }); // render view file on this endpoint
  });

  app
    .route('/login')
    .post(passport.authenticate('local', {
      failureRedirect: '/'
    }), (req, res) => {
      res.redirect('/profile');
    });

  app
    .route('/profile')
    .get(ensureAuthenticated, (req, res) => {
      res.render(process.cwd() + '/views/pug/profile', {
        username: req.user.username
      })
    })

  // registering a new user
  app.route('/register')
    .post((req, res, next) => {
      var hash = bcrypt.hashSync(req.body.password, 12);
      db.collection('users').findOne({
        username: req.body.username
      }, function (err, user) {

        if (err) {
          next(err);

        } else if (user) {
          res.redirect('/');

        } else {
          db.collection('users').insertOne({
              username: req.body.username,
              password: hash
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
    },
    passport.authenticate('local', {
      successRedirect:'/profile',
      failureRedirect: '/'
    }),
    (req, res, next) => {
      res.redirect('/profile')
    })


  app.route('/logout')
    .get((req, res) => {
      req.logout();
      res.redirect('/')
    });

  // handling missing pages (404)
  app.use((req, res, next) => {
    res.status(404)
      .type('text')
      .send('Not found')
  })

}