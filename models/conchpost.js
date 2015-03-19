var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ConchSchema = new Schema({
    name: String,
    location:{
        type: Schema.ObjectId,
        ref: 'LocationSchema'
    },
    author: {
        type: Schema.ObjectId,
        ref: 'UserSchema'
    },
    create: Date,
    expires: Date,
    path: String,
    tags: []
});

var Conches = mongoose.model('conches', ConchSchema);

module.exports = Conches;