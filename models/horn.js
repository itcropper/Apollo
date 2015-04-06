var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bodyParser = require('body-parser'),
    express = require('express'), 
    app = express(),    
    guid = require('../guid'),
    exec = require('child_process').exec,
    AWS = require('aws-sdk'),
    s3 = new AWS.S3(),
    fs = require('fs'),
    zlib = require('zlib'),
    multer = require('multer'),
    busboy = require('connect-busboy'),
    path = require('path');

app.use(busboy()); 

//fileconfig
app.use(bodyParser.json());
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'us-west-1'
});


var BucketName = "atlasappeventvideos";

var EventSchema = new Schema({
    name: String,
    location:{
        lat: Number,
        lon:Number,
        address: {
            street: String,
            city: String,
            state: String,
            zip: String
        }
    },
    author_id: { type: String, index: true },
    created: Date,
    expires: Date,
    path: String,
    tags: []
});

var Event = mongoose.model('events', EventSchema);

module.exports = {
    EventsModel: Event,
    getAll : function(req, res){
        var m = Event.find(function(err, events){
            res.send(events);
        });
    },
    getOne : function(req, res){
        Event.findOne({"_id": req.params.id}, function(err, event){
            res.send(event);
        });
    },
    getAllHornsByUser : function(req, res){
        console.log(req.params.id);
        Event.find({"author_id": req.params.id}, function(err, events){
            res.send(events);
        });
    },
    createNew : function(req, res){
        var ev = new Event(),
            id = guid(),
            tempFilePath = '',
            fstream = {};
        
        tempFilePath = path.join(__dirname, '../', 'assets/Video/'+id + '.MP4');
        
        console.log(tempFilePath);
        
        req.pipe(req.busboy);
        
        //load plain inputs
        var params = {};
        req.busboy.on('field', function(fieldname, val) {
            params[fieldname] = val;
        });
        
        //load video file
        req.busboy.on('file', function (fieldname, file, filename) {

            fs.openSync(tempFilePath, 'w');
            fstream = fs.createWriteStream(tempFilePath);
            file.pipe(fstream);

        });   
        
        req.busboy.on('finish', function() {
            
            //save data to mongo object
            ev.name = params.name;
            ev.location.lat = params.lat;
            ev.location.lon = params.lon;
            ev.author_id = params.author_id;
            ev.created = new Date();
            ev.tags = params.tags;
            ev.path = "https://s3-us-west-2.amazonaws.com/atlasappeventvideos/"+id+".MP4";

            //call async
            setTimeout(function(){ sendVideoToAWS(id, tempFilePath); }, 0);

            //save to mongo
            ev.save(function(err, a){
               if(err){ console.log(err); return;}
                res.send(a);
            });

            //delete temp file after 5 minutes
            setTimeout(function(){
                fs.unlink(tempFilePath, function (err) {
                    if (err) console.log(err);
                        console.log('Temp Time Expired. Successfully deleted ' + tempFilePath);
                }, 1000 * 60 * 5);
            });
        });     

    },
    update : function(req, res){
        console.log('update');
    },
    delete : function(req, res){
         
    }
}



function sendVideoToAWS(id, path) {
    var body = fs.createReadStream(path);
    console.log(path);
    var s3obj = new AWS.S3({
            params: {
                Bucket: BucketName, 
                Key: id + ".MP4",
                ACL:'public-read'
            }});
    s3obj.upload({Body: body})
    .on('httpUploadProgress', function(evt) {  })
    .send(function(err, data) { console.log(err, data) });
}
