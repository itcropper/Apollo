var express = require('express'),
    mongoose = require('mongoose'),
    nodeRestful = require('node-restful'),
    bodyParser = require('body-parser'),
    session = require('express-session');
    app = express(),
    guid = require('./guid'),
    busboy = require('connect-busboy'),
    session = require('express-session'),
    passport = require('passport'),
    eventController = require('./controllers/event'),
    userController = require('./controllers/user'),
    authController = require('./controllers/auth'),
    oauth2Controller = require('./controllers/oauth2'),
    clientController = require('./controllers/client'),
    router = express.Router();




//Port Variables
var SERVER_PORT = Number(process.env.PORT || 3000);
var MONGOOSE_PORT =
  process.env.MONGOLAB_URI || 
  process.env.MONGOHQ_URL  || 
  'mongodb://localhost:27017;';

// CONFIG
mongoose.connect(MONGOOSE_PORT, function (err, res) {
  if (err) { 
    console.log ('ERROR connecting to: ' + MONGOOSE_PORT + '. ' + err);
  } else {
    console.log ('Succeeded connected to: ' + MONGOOSE_PORT);
  }
});
//CONFIG
app.use(busboy()); 
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(
    session(
        { 
          secret: guid(),
          saveUninitialized: true,
          resave: true
        }
    )
);
app.use(passport.initialize());
app.use(passport.session());

//load router

//event actions
router.route('/events')
    .get(eventController.getAll);
router.get('/events/:id', authController.isAuthenticated, eventController.getOne);
router.get('/events/:id/horns', authController.isAuthenticated, eventController.getAllHornsByUser);
router.post('/event', eventController.createNew);
router.put('/event', authController.isAuthenticated, eventController.update);
router.delete('/event/:id',authController.isAuthenticated, eventController.delete);

//user actions
//router.get('/user/:user_id', authController.isAuthenticated, userController.getUser);
router.post('/user', userController.createNewUser);
//router.put('/user/:user_id', authController.isAuthenticated, userController.updateUser);

//auth actions
//router.get ('/oauth2/authorize', oauth2Controller.authorization);
//router.post('/oauth2/authorize', authController.isAuthenticated, oauth2Controller.decision);

app.use('/api/v1.1.0/', router); 

//TESTING PAGES
app.use('/js', express.static(__dirname + '/public/scripts'));
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/views/create.html');
});

app.get('/create', function(req, res) {
    res.sendFile(__dirname + '/public/views/create.html');
});

app.get('/view', function(req, res){
    res.sendFile(__dirname + '/public/views/viewMap.html');
});

app.get('/Videos/:id', function(req, res){
    res.sendFile(__dirname + '/assets/Video/' + req.params.id);
});

app.get('/login', function(req, res) {
  res.json({ user : req.user });
});

app.get('/views/:id', function(req, res){
    res.send('something');
});


app.listen(SERVER_PORT, function(e){
    console.log('listening on port ' + SERVER_PORT); 
});
