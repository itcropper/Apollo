var restful = require('node-restful'),
    mongoose = restful.mongoose;

var productSchema = new mongoose.Schema({
    name: String, 
    sku: String,
    price: Number
});


module.exports = restful.model('Products', productSchema);