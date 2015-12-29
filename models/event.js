var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var EventSchema = new Schema({
    name: String,
    location :{
        type: [Number],  // [<longitude>, <latitude>]
        index: '2dsphere'      // create the geospatial index 
    },
    streamLinks: {
        "1m": String,
        "600k":String
    },
    thumbnailLink : String,
    description : String,
    address: {
        street: String,
        city: String,
        state: String,
        zip: String
    },
    is_private: Boolean,
    author_id: { type: String, index: true },
    created: Date,
    expires: Date,
    tags: [String],
    
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