var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    User = require('../models/user'),
    Horn = require('../models/horn'),
    Location = require('../models/location'),
    authController = require('./auth');
    passwordHash = require('password-hash');


router.post('/users', function(req, res){
    var user = new User({
        name_first: req.body.name_first,
        name_last:req.body.name_last,
        age: req.body.age,
        gender: req.body.gender,
        _id: req.body.email,
        password: req.body.password
    });
    
    var dbUser = user.find({_id: req.body.email});
    
    if(dbUser.length > 0 && dbUser.token_id == req.body.api_token){
        user.token_id = req.body.api_token;
    }else{
    
        user.save(function(err) {
            if(err){res.send('error'); return;}
            res.Json({"data":{"token_id" : this.token_id}});
        });
    }
});

router.get('/users', function(req, res){
    User.find({}, function(err, users){
        if(err){res.send(err); return;}
        
        res.send(users);
    });
});

router.get('/horns', function(req, res){
    if(req.query.api_token == "12345678"){
        Horn.find({}, function(err, horns){
            //console.log(horns);
            
            horns = horns.map(function(horn){
                var user = User.find({_id: horn.author_id});
                //console.log(user);
                return {
                    _id: horn._id,
                    name: horn.name,
                    created: horn.create || horn.created,
                    src: horn.path,
                    user: {
                        email: user.email,
                        _id: user._id,
                        name:user.name_first + " " +user.name_last
                    },
                    lat: horn.location.lat,
                    lon: horn.location.lon,
                    tags: horn.tags
                };
            });
            
            res.json(horns);
        });
    }else {
        res.send('sorry, you are not a real person'  + req.query.api_token);
    }
});


router.post('/horns', function(req, res){
    if(req.body.api_token == "12345678"){
        console.log(req.body.author_id, User.find({email: req.body.author_id})._id);
       var horn = new Horn({
               name: req.body.name,
                location: {
                    address: {
                        street: req.body.location.address.street,
                        city: req.body.location.address.city,
                        state: req.body.location.address.state,
                        zip: req.body.location.address.zip
                    }
                },
                author_id: req.body.author_id,
                created: new Date(),
                path: "",
                tags: req.body.tags
       });
        
        horn.save(function(err){
            if(err) {res.send(err); return;}
            res.send('successfully saved');
        });
    }else {
        
        res.send('sorry, you are not a real person' + req.body.name);
    }
});

router.delete('/horns', function(req, res){
    if(req.body.api_token == "12345678"){
        Horn.remove({_id: req.body._id}, function(err){
            if(err){res.send(err); return;}
            res.send('deleted');
        });
    }else{
        res.send('sorry, you are not a real person' + req.body.api_token);
    }
});

function encryptPassword(password){
    return passwordHash.generate(password);
}

module.exports = router;