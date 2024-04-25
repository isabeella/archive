const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const validator = require('validator'); 

//pref2 - emails to contributors when their articles are reviewed and need edits
//
//pref3 - emails to assigned reviewers when the contributor submits their edits
//
//pref4 - emails to contributor when their article gets published
//
//pref5 - emails to level 2 reviewers when new article is submitted
//
//pref6 - emails to level 3 reviewers when new article is submitted
//
//pref7 - emails to level 4 reviewers when new article is submitted

const preferenceSchema = new mongoose.Schema({
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
  },
  pref5: {
    type: Boolean,
    default: true
  },
  pref6: {
    type: Boolean,
    default: true
  },
  pref7: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Preference', preferenceSchema);