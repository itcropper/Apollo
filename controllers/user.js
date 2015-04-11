// Load required packages
var User = require('../models/user');

// Create endpoint /api/users for POST
exports.createNewUser = function(req, res) {
    
    
    var user = new User();

    user.name_first = req.body.name_first || '';
    user.name_last = req.body.name_last || '';
    
    if(req.body.username){
        user.username = req.body.username
    }else{
        res.send('must provide a valid username');   
    }

    if(req.body.email) { 
        //if email address already exists... response accordingly
        user.email = req.body.email; 
    }
    //else {res.send({"message": "must provide a valid email address" });}

    user.age = req.body.age;
    user.gender = req.body.gender;
    user.password = req.body.password;
    
    console.log(user);

    user.save(function(err) {
        if (err){
            res.json({"message" : "there was an error", "error" : err});
            return;
        }
        res.json({ message: 'New beer drinker added to the locker room!' });
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