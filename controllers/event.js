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
    url = require('url'),
    transcoder = require('../models/elastic_transcoder');

//create temp directory if it doesnt exist
var temp_dir = path.join(process.cwd(), 'tmp/');
var BucketName = "atlasappeventvideos";


if (!fs.existsSync(temp_dir))
    fs.mkdirSync(temp_dir);

app.use(busboy()); 

//fileconfig
app.use(bodyParser.json());
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "AKIAJI4TVAFIYKO7G5FA",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "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",
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
    
    twoWeeksAgo = new Date(new Date() - 1000 * 60 * 60 * 24 * 7 * 2 * 10);
    
    if(params.lat && params.lon){
        lat = parseFloat(params.lat);
        lon = parseFloat(params.lon);
        radius = params.radius || 5000;
    }else{
        res.json(jsonResult("", "error", "no lat/lon params sent"));
        return;
    }

    Event.find(
    {
        $and: [
            { created: { $gte: twoWeeksAgo } },
            { 
                location: {
                    $nearSphere: {
                        $geometry: {
                            type: "Point",
                            coordinates : [ lon, lat ],
                            $maxDistance: radius
                        }
                    }
                }
            }
        ]
    })
    .limit(5)
    .exec(function(err, events){
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
        ev.email = params.email;
        ev.created = new Date();
        ev.tags = params.tags;
        ev.description = params.description;
        ev.streamLinks = {
            smoothStream_high    : "https://s3-us-west-2.amazonaws.com/atlasappeventvideos/Videos/"+id+"/ss1m.ismv",
            httpLiveStream_medium: "https://s3-us-west-2.amazonaws.com/atlasappeventvideos/Videos/"+id+"/HLS600k.m3u8",
            httpLiveStream_high  : "https://s3-us-west-2.amazonaws.com/atlasappeventvideos/Videos/"+id+"/HLS1M.m3u8",
        };
        ev.thumbnailLink = "https://s3-us-west-2.amazonaws.com/dingo-event-video-thumbnails/Videos/"+id+"/1M00001.png";

        //call async
        setTimeout(function(){ sendVideoToAWS(id, tempFilePath); }, 0);

        //save to mongo
        ev.save(function(err, savedEvent){
           if(err){ console.log(err); res.json(jsonResult("", "fail", err)); return;}
            console.log('saved');
            res.json(jsonResult(savedEvent));
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
    var s3obj = new AWS.S3({
            params: {
                Bucket: BucketName, 
                Key: id + ".MP4",
                ACL:'public-read'
            }});
    s3obj.upload({Body: body})
    .on('httpUploadProgress', function(evt) {  })
    .send(function(err, data) { 
        if(err){
            console.log('error', err);
            return false;
        } else {
            transcoder.createAndRunAWSJob(id);
        }
        console.log(err, data);
    });
}
