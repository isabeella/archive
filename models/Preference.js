const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const validator = require('validator'); 

// pref1 - emails to reviewers when new article is submitted
//
// pref2 - emails to contributors when their articles are reviewed
//
// pref3 - emails to assigned reviewers when the contributor submits their edits
//
// pref4 - emails to contributor when their article gets published

const preferenceSchema = new mongoose.Schema({
  pref1: {
    type: Boolean,
    default: true
  },
  pref2: {
    type: Boolean,
    default: true
  },
  pref3: {
    type: Boolean,
    default: true
  },
  pref4: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Preference', preferenceSchema);