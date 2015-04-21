var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PocketSchema = new Schema({
    name: String,
    location:{
        type: { type: String }, 
        coordinates: []
    },
    address: {
        street: String,
        city: String,
        state: String,
        zip: String
    },
    author_id: { type: String, index: true },
    created: Date,
    events: [String] 
});

PocketSchema.index({ location : '2dsphere' });



module.exports = mongoose.model('Pocket', PocketSchema);