var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    name_first: String, 
    name_last: String,
    email: String,
    password: String,
    age: Number,
    gender: String,
    created: Date
});

var GooseUser = mongoose.model('user', userSchema);

module.exports = GooseUser;