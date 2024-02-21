const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const validator = require('validator');
//const slug = require('slugs');

const articleSchema = new mongoose.Schema({
  email: {
    type: String,
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
  title: {
    type: String,
    trim: true,
    required: 'Please provide a title for your article'
  },
  description: {
    type: String,
    trim: true,
    required: 'Please enter a description'
  },
  abstract: {
    type: String,
    trim: true,
    required: 'Please enter an abstract'
  },
  date: {
    type: Date,
    default: Date.now
  },
  file: {
    type: String,
    required: 'Please enter a article!'
  },
  subject: {
    type: String,
    trim: true
  },
  tags: {
    type: String
  },
  reviewStat: {
    type: String,
    default: "In Review"
  },
  reviewedBy: {
    type: String
  },
  tagsArray: {
    type: [String]   
  },
  reviewerNotes: {
    type: String,
    default: ""
  }
});

articleSchema.index({
  title: 'text',
  description: 'text',
  subject: 'text',
  firstname: 'text',
  lastname: 'text',
  abstract: 'text',
  tagsArray: 'text'
});

//articleSchema.pre('save', async function(next) {
//  if (!this.isModified('title')) {
//    next(); // skip it
//    return; // stop this function from running
//  }
//  this.slug = slug(this.title);
//  //find other articles that have a slug of wes, wes-1, wes-2
//  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
//  const articlesWithSlug = await this.constructor.find({ slug: slugRegEx });
//  if (articlesWithSlug.length) {
//    this.slug = `${this.slug}-${articlesWithSlug.length + 1}`;
//  }
//  next();
//  // TODO make more resiliant so slugs are unique
//});

articleSchema.statics.getTagsList = function() {
  return this.aggregate([
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
}

module.exports = mongoose.model('Article', articleSchema);