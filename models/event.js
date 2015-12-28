var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var EventSchema = new Schema({
    name: String,
    location :{
        type: [Number],  // [<longitude>, <latitude>]
        index: '2dsphere'      // create the geospatial index 
    },
    path: {type: String},
    description : {
        type: String
    },
    address: {
        street: String,
        city: String,
        state: String,
        zip: String
    },
    is_private: {type : Boolean},
    author_id: { type: String, index: true },
    created: Date,
    expires: Date,
    mediaPath: String,
    tags: [String] 
});

// Execute before each user.save() call
EventSchema.pre('save', function(callback) {
  var event = this;

  if(!event.created){
      event.created = new Date();
  }
  return callback();
});

module.exports = mongoose.model('Event', EventSchema);


/*
put id in mongo and then recreate the path from a api url to get to the amazon stream
HLS streaming
*/