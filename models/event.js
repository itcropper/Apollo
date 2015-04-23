var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var EventSchema = new Schema({
    name: String,
    location:[Number],
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
    path: String,
    tags: [String] 
});
EventSchema.index({ location : '2dsphere' });

// Execute before each user.save() call
EventSchema.pre('save', function(callback) {
  var event = this;

  if(!event.created){
      event.created = new Date();
  }
  return callback();
});

module.exports = mongoose.model('Event', EventSchema);
