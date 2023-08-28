const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username : String,
  email : {
    type : String,
    unique : true
  },
  password : String
});

const USER = mongoose.model('user', userSchema);

module.exports = USER
