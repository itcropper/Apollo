var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var LikeSchema = new Schema({
    user_id: {
        type: String,
        require: true
    },
    created: {
        type: Date,
        retuired: true
    },
    event_id: {
        type: string,
        required: true
    }
});

module.exports = mongoose.model('Like', LikeSchema);