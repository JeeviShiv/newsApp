const mongoose = require('mongoose');
const adminSchema = new mongoose.Schema({
    username:String,
    password:String,
    name:String,
    emailId:String,
    role:{type:String, default:'admin'}
});

mongoose.model('admin', adminSchema);
module.exports = mongoose.model('admin');
