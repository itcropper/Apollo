var passport = require('passport');
var Account = require('.././models/user'),
    bodyParser = require('body-parser'),
    LocalStrategy = require('passport-local').Strategy;



module.exports = function (app) {
    
app.use(bodyParser());
    
    console.log('setting up even??');

  app.get('/', function (req, res) {
      res.send('lets get registered!');
  });

  app.get('/register', function(req, res) {
      res.render('register', { });
  });

  app.post('/register', function(req, res) {
      console.log('registering');
      Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
        if (err) {
            return res.send("error");
        }

        passport.authenticate('local')(req, res, function () {
          res.send('ok');
        });
    });
  });

  app.get('/login', function(req, res) {
      res.render('login', { user : req.user });
  });

  app.post('/login', passport.authenticate('local'), function(req, res) {
      res.redirect('/');
  });

  app.get('/logout', function(req, res) {
      req.logout();
      res.redirect('/');
  });

  app.get('/ping', function(req, res){
      res.send("pong!", 200);
  });

};