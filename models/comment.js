var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CommentSchema = new Schema({
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
    },
    text: {
        type: string,
        required: true
    }
});

module.exports = mongoose.model('Comment', CommentSchema);