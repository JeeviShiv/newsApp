const mongoose = require('mongoose');
const newsSchema = new mongoose.Schema({
    title: String,
    description: String,
    url:String,
    imageUrl:String,
    category:String,
    publishedAt:{ type: Date, default: Date.now}
});
mongoose.model('newsFeeds', newsSchema) ;
module.exports = mongoose.model('newsFeeds');