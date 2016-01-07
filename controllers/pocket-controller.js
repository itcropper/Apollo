var PocketModel = require('../models/pocket-model'),
    UserModel = require('../models/user-model'),
    EventModel = require('../models/event-model'),
    bodyParser = require('body-parser'),
    express = require('express'), 
    app = express(),    
    url = require('url'),
    jsonResult = require('../jsonResult').Response,
    guid = require('../guid');

exports.getMyPockets = function(req, res){
    var params = params = url.parse(req.url, true).query,
        username = params.username;
    
        UserModel.findOne({username: params.username}, function(err, user){
        if(err){
            res.send(jsonResult("", "fail", err));
            return;
        }
        PocketModel.find({author_id : user._id}, function(err, pockets){
            res.send(jsonResult(pockets));
        });
    });
};

exports.createNewPocket = function(req, res){
    
    var params = params = url.parse(req.url, true).query,
        pocket = new PocketModel();
    
    UserModel.findOne({username: params.username}, function(err, user){
        if(err){
            res.send(jsonResult("", "fail", err));
            return;
        }
        console.log(user);
        pocket.author_id = user._id;
        pocket.location = [parseFloat(params.lon), parseFloat(params.lat)];
        pocket.radius = parseFloat(params.radius);
        pocket.name = params.name;
        pocket.description = params.desc;
        pocket.created = new Date();

        pocket.save(function(err, savedPocket){
            if(err){
                res.send(jsonResult("", "fail", err));
            }else {
                res.send(jsonResult(savedPocket));
            }
        });
    });    
};

exports.getEventsFromPocket = function(req, res){
    console.log(">>", req.user);
    var params = params = url.parse(req.url, true).query,
        sinceTime = new Date(new Date() - 1000 * 60 * 60 * 24 * 7 * 2 * 10);
    
 
    PocketModel.findOne({_id: req.params.id}, function(err, pocket){
        sinceTime = sinceTime.getTime() > new Date(pocket.created).getTime() ? new Date(pocket.created) : sinceTime;
        EventModel.find(
        {
            $and: [
                { created: { $gte: sinceTime } },
                { 
                    location: {
                        $nearSphere: {
                            $geometry: {
                                type: "Point",
                                coordinates : [ pocket.location[0], pocket.location[1] ],
                                $maxDistance: pocket.radius
                            }
                        }
                    }
                }
            ]
        })
        .limit(5)
        .exec(function(err, events){
            if(err){
                res.send(jsonResult("", "could not retrieve events from pocket", err));
            }else {
                res.json(jsonResult(events, "success"));
            }
        });
       
   });
};