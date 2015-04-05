var express = require('express'),
    mongoose = require('mongoose'),
    nodeRestful = require('node-restful'),
    bodyParser = require('body-parser'),
    authController = require('./routes/auth'),
    app = express(),
    busboy = require('connect-busboy');

app.use(busboy()); 


//Port Variables
var SERVER_PORT = Number(process.env.PORT || 3000);
var MONGOOSE_PORT =
  process.env.MONGOLAB_URI || 
  process.env.MONGOHQ_URL  || 
  'mongodb://localhost:27017;';

mongoose.connect(MONGOOSE_PORT, function (err, res) {
  if (err) { 
    console.log ('ERROR connecting to: ' + MONGOOSE_PORT + '. ' + err);
  } else {
    console.log ('Succeeded connected to: ' + MONGOOSE_PORT);
  }
});


app.configure(function () {
    app.use(allowCrossDomain);
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());
    app.set('view engine', 'ejs');
}

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
};

app.use('/api/v1.1.0/', require('./routes/routes')); 

//TESTING PAGES
app.use('/js', express.static(__dirname + '/public/scripts'));
app.get('/create', function(req, res) {
    res.sendFile(__dirname + '/public/views/create.html');
});

app.get('/view', function(req, res){
    res.sendFile(__dirname + '/public/views/viewMap.html');
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
