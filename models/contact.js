const mongoose = require("mongoose");
const ContactSchema = new mongoose.Schema({
    name:String,
    emailId:String,
    message:String,
    dateCreated:{default:Date}
});
mongoose.model('contact',ContactSchema);
module.exports = mongoose.model('contact');
