var express = require('express'),
    mongoose = require('mongoose'),
    nodeRestful = require('node-restful'),
    bodyParser = require('body-parser'),
    app = express();

mongoose.connect('mongodb://localhost:27017;');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use('/api', require('./routes/api')); 

app.get('/', function(req, res){
   res.send('index'); 
});



app.listen(3000);
console.log('listening on 3000');