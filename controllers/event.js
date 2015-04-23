var Event = require('../models/event'),
    bodyParser = require('body-parser'),
    express = require('express'), 
    app = express(),    
    guid = require('../guid'),
    AWS = require('aws-sdk'),
    s3 = new AWS.S3(),
    fs = require('fs'),
    zlib = require('zlib'),
    busboy = require('connect-busboy'),
    path = require('path'),
    jsonResult = require('../jsonResult').Response,
    url = require('url');

//create temp directory if it doesnt exist
var temp_dir = path.join(process.cwd(), 'tmp/');
var BucketName = "atlasappeventvideos";


if (!fs.existsSync(temp_dir))
    fs.mkdirSync(temp_dir);

app.use(busboy()); 

//fileconfig
app.use(bodyParser.json());
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'us-east-1'
});

exports.getFeed = function(req, res){
    var params, twoWeeksAgo, page;
    
    params = url.parse(req.url, true).query;
    
    page = params.page;
    
    twoWeeksAgo = new Date(new Date() - 1000 * 60 * 60 * 24 * 14);
    
    Event.find(
        {
            
        }
    );
}

//this request should always require a lat/lon as a center, and a radius (meters?)
exports.getAll  = function(req, res){ 
    var params, lat, lon, radius, twoWeeksAgo;
    
    params = url.parse(req.url, true).query;
    
    twoWeeksAgo = new Date(new Date() - 1000 * 60 * 60 * 24 * 28);
    
    lat = params.lat;
    lon = params.lon;
    radius = params.radius || 5000;

    Event.find(
    {
        $and: [
            { created: { $gte: twoWeeksAgo } },
            { 
                location: {
                    $nearSphere: {
                        $geometry: {
                            type: "Point",
                            [ lon, lat ],
                            $maxDistance: radius
                        }
                    }
                }
            }
        ]
    })
    .limit(5)
    .exec(function(err, events){
        console.log("SENDING EVENTS******", events);
        res.json(jsonResult(events, "success"));
    });
}

exports.getOne = function(req, res){
    Event.findOne({"_id": req.params.id}, function(err, event){
        res.send(jsonResult(event));
    });
}
exports.getAllHornsByUser = function(req, res){
    console.log(req.params.id);
    Event.find({"author_id": req.params.id}, function(err, events){
        res.send(jsonResult(events));
    });
}
exports.createNew = function(req, res){
    var ev = new Event(),
        id = guid() +  new Date().getTime(),
        tempFilePath = '',
        fstream = {};

    tempFilePath = path.join(temp_dir, id + '.MP4');

    req.pipe(req.busboy);

    //load plain inputs
    var params = {};
    req.busboy.on('field', function(fieldname, val) {
        params[fieldname] = val;
    });

    //load video file
    function loadFileIntoTempDirectory(fieldname, file, filename){
        fs.openSync(tempFilePath, 'w');
        fstream = fs.createWriteStream(tempFilePath);
        file.pipe(fstream);
    }
    req.busboy.on('file',  loadFileIntoTempDirectory);

    req.busboy.on('finish', function() {

        //save data to mongo object
        ev.name = params.name;
        ev.location = [parseFloat(params.lon),  parseFloat(params.lat)];
        ev.author_id = params.author_id;
        ev.created = new Date();
        ev.tags = params.tags;
        ev.path = "https://atlasappeventvideos.s3.amazonaws.com/"+id+".MP4";

        //call async
        setTimeout(function(){ sendVideoToAWS(id, tempFilePath); }, 0);

        console.log("\n\n", ev, "\n\n");

        //save to mongo
        ev.save(function(err, savedEvent){
           if(err){ console.log(err); return;}
            res.send(jsonResult(savedEvent));
        });

        //delete temp file after 5 minutes
        setTimeout(function(){
            fs.unlink(tempFilePath, function (err) {
                if (err) console.log(err);
                    console.log('Temp Time Expired. Successfully deleted ' + tempFilePath);
            });
        }, 1000 * 60 * 5);
    });     

}
exports.update = function(req, res){
    console.log('update');
}
exports.delete  = function(req, res){ 
    
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
