const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Silver Schema 
const UserSchema = new Schema({
  id:   { type: Number },
  name: { type: String },
  username: { type: String },
  email: { type: String },
  address: {},
  phone: { type: String },
  website: { type: String },
  company: {},
  password: { type: String },
  role: { type: String, default: 'admin' }
}, { timestamps: true });

module.exports = UserModel = mongoose.model('user', UserSchema, 'user');
