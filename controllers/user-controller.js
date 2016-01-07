// Load required packages
var User = require('../models/user-model'),
    jsonResult = require('../jsonResult').Response,
    url = require('url');

// Create endpoint /api/users for POST
exports.createNewUser = function(req, res) {
    
    var user = new User();

    user.name_first = req.body.name_first || '';
    user.name_last = req.body.name_last || '';
    
    if(req.body.username){
        user.username = req.body.username
    }else{
        res.json(jsonResult('', "fail", 'must provide a valid username'));
        return;
    }

    if(req.body.email) { 
        //if email address already exists... response accordingly
        user.email = req.body.email; 
    }
    //else {res.send({"message": "must provide a valid email address" });}

    user.age = req.body.age;
    user.password = req.body.password;
    
    user.save(function(err) {
        if (err){
            console.log(err);
            res.json(jsonResult("", "Fail", err));
            return;
        }
        console.log('userCreated', new Date());
        res.json(jsonResult('Account Successfully Created', "success"));
    });
}

exports.getOneUser = function(req, res){
    var params = url.parse(req.url, true).query;
    console.log (params.id);
    User.findOne({username: params.id}, function(err, user){
        res.json(jsonResult(user));
    });
};

// Create endpoint /api/users for GET
exports.getUsers = function(req, res) {
  User.find(function(err, users) {
    if (err)
      res.send(err);

    res.json(users);
  });
};

/*

    age: Number,
    gender: String,
    created: Date,
    lastModified: Date,
    followers: [{ 
            type : mongoose.Types.ObjectId, 
            ref: 'User' 
    }],
    following: [{ 
        type : mongoose.Types.ObjectId, 
        ref: 'User' 
    }],
    password: {
        type: String,
        required: true
    },
    api_token: String
*/