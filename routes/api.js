var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    User = require('../models/user'),
    bcrypt = require('bcrypt');


router.post('/users', function(req, res){
    var user = new User({
        name_first: req.body.name_first,
        name_last:req.body.name_last,
        age: req.body.age,
        gender: req.body.gender,
        email: req.body.email,
        password: encryptPassword(req.body.password)
    });
    
    user.save(function(err) {
        if(err){res.send('error'); return;}
        res.send('saved!');
    });
});

router.get('/users', function(req, res){
    User.find({}, function(err, users){
        if(err){res.send(err); return;}
        
        res.send(users);
    });
});


function encryptPassword(password){
    var bcrypt = require('bcrypt');
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync('B4c0/\/', salt);
    return hash;
}

module.exports = router;