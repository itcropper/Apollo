var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var LocationSchema = new Schema({
    address: {
        street: String,
        stree2: String,
        city: String,
        state: String,
        zip: String
    },
    lat: Number,
    lon: Number
});

var Locations = mongoose.model('locations', LocationSchema);

module.exports = Locations;