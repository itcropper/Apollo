var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PocketSchema = new Schema({
    name: String,
    location    : {
        type: [Number] , 
        index:'2d' 
    },
    address:     {
        street: String,
        city: String,
        state: String,
        zip: String
    },
    author_id   : { type: String, index: true },
    created     : Date,
    events      : [String],
    name        : String,
    description : String,
    radius      : Number
});

PocketSchema.index({ location : '2dsphere' });

PocketSchema.pre('save', function(callback) {
    this.created = new Date();
    callback();
});

module.exports = mongoose.model('Pocket', PocketSchema);