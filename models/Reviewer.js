const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
const md5 = require('md5');
const validator = require('validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors');
const passportLocalMongoose = require('passport-local-mongoose');

const reviewerSchema = new Schema({
  email: {
    type: String,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Invalid Email Address'],
    required: 'Please Supply an email address'
  },
  firstname: {
    type: String,
    trim: true,
    required: 'You must supply a first name'
  }, 
  lastname: {
    type: String,
    trim: true,
    required: 'You must supply a last name'
  },
  status: {
    type: Number,
    default: 0
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
});

reviewerSchema.virtual('gravatar').get(function() {
  const hash = md5(this.email);
  return `https://gravatar.com/avatar/${hash}?s=200`;
});

reviewerSchema.plugin(passportLocalMongoose, { usernameField: 'email' });
reviewerSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('Reviewer', reviewerSchema);
