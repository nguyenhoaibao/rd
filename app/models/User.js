const bcrypt = require('bcrypt-nodejs');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: String,
  fullname: String,
  password: String,

  facebook: {
    id: String,
    email: String,
    token: String,
    expired: Number
  }
});

userSchema.static('hash', function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync());
});

userSchema.static('validatePassword', function(password, hash) {
  return bcrypt.compareSync(password, hash);
});

module.exports = mongoose.model('User', userSchema);
