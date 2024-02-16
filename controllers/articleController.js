const mongoose = require('mongoose');
const Article = mongoose.model('Article');
const Reviewer = mongoose.model('Reviewer');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');
const mail = require('../handlers/mail');

//const multerOptions = { 
//  storage: multer.diskStorage({
//    destination: './public/uploads',
//    filename: function(req, file, cb){
//        cb(null, file.originalname)
//    },
//  fileFilter(req, file, next) {
//    const isPhoto = file.mimetype.startsWith('image/');
//    if(isPhoto) {
//      next(null, true);
//    } else {
//      next({ message: 'That filetype isn\'t allowed!' }, false);
//    }
//  }
//})};

var storage = multer.diskStorage({
    destination: './public/uploads',
    filename: function(req, file, cb){
        cb(null, file.originalname)
    }
});

//exports.upload = multer(multerOptions).single('photo');
exports.upload = multer( {storage: storage}).single('file');


exports.resize = async (req, res, next) => {
  // check if there is no new file to resize
  if (!req.file) {
    next(); // skip to the next middleware
    return;
  }
  const extension = req.file.mimetype.split('/')[1];
  req.body.photo = `${uuid.v4()}.${extension}`;
  // now we resize
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`);
  // once we have written the photo to our filesystem, keep going!
  next();
};

exports.home = async(req, res) => {
    const articles = await Article.find({ reviewStat: "Reviewed" });
    res.render('main', {articles});
};

exports.contribute = (req, res) => {
  res.render('contribute', { title: 'Contribute' });
};

exports.submit = async (req, res) => {
    console.log(req.file);
    console.log(req.body);
    req.body.file = req.file.originalname;
    const article = await (new Article(req.body)).save();
    console.log(article)
    res.render('thanku');
};

exports.getArticle = async (req, res) => {
    console.log(req.params.id);
    const article = await Article.findOne({ _id: req.params.id });
    res.render('article', { article });
}

exports.reviewers = async(req, res) => {
    const reviewers = await Reviewer.find();
    res.render('reviewers', { reviewers });
}

exports.contact = async(req, res) => {
    res.render('contact');
}

exports.toreview = async(req, res) => {
    const articles = await Article.find({ reviewStat: "In Review" });
    res.render('articles', { articles });
}

exports.reviewed = async(req, res) => {
    const articles = await Article.find({ reviewStat: "Reviewed" });
    res.render('articles', { articles });
}

exports.reviewArticle = async(req, res) => {
    const article = await Article.findOne({ _id: req.params.id });
    res.render('reviewing', { article });
}

exports.submitReview = async(req, res) => {
  var toSplit = req.body.tags;
  var arrayWTags = toSplit.split(", ");
  const updates = {
    email: req.body.email,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    title: req.body.title,
    description: req.body.description,
    abstract: req.body.abstract,
    subject: req.body.subject,
    tags: req.body.tags,
    tagsArray: arrayWTags,
    reviewedBy: req.user.id,
    reviewStat: req.body.reviewStat
  };
  const reviewer = await Article.findOneAndUpdate(
    { _id: req.params.id },
    { $set: updates },
    { new: true, runValidators: true, context: 'query' }
  );
  res.redirect('/');
}


exports.homeSciences = async(req, res) => {
    const articles = await Article.find({ reviewStat: "Reviewed", subject: "Sciences"});
    res.render('main', {title: "Sciences", articles});
};
exports.homeMathematics = async(req, res) => {
    const articles = await Article.find({ reviewStat: "Reviewed", subject: "Mathematics"});
    res.render('main', {title: "Mathematics", articles});
};
exports.homeSocialSciences = async(req, res) => {
    const articles = await Article.find({ reviewStat: "Reviewed", subject: "Social Sciences"});
    res.render('main', {title: "Social Sciences", articles});
};
exports.homeEnglish = async(req, res) => {
    const articles = await Article.find({ reviewStat: "Reviewed", subject: "English"});
    res.render('main', {title: "English", articles});
};
exports.homeComputerScience = async(req, res) => {
    const articles = await Article.find({ reviewStat: "Reviewed", subject: "Computer Science"});
    res.render('main', {title: "Computer Science", articles});
};
exports.homeEngineering = async(req, res) => {
    const articles = await Article.find({ reviewStat: "Reviewed", subject: "Engineering"});
    res.render('main', {title: "Engineering", articles});
};
exports.homeArts = async(req, res) => {
    const articles = await Article.find({ reviewStat: "Reviewed", subject: "Arts"});
    res.render('main', {title: "Arts", articles});
};
exports.homeOther = async(req, res) => {
    const articles = await Article.find({ reviewStat: "Reviewed", subject: "Other"});
    res.render('main', {title: "Other", articles});
};


exports.searchArticles = async (req, res) => {
  const searchTerm = req.body.query;
  console.log(typeof(req.body.query));
  if (searchTerm === '') return;
  const articles = await Article.find({
      $or: [
          { title: { $regex: searchTerm, $options: 'i' } }, 
          { firstname: { $regex: searchTerm, $options: 'i' } },
          { lastname: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
          { subject: { $regex: searchTerm, $options: 'i' } },
          { abstract: { $regex: searchTerm, $options: 'i' } },
          { tagsArray: { $regex: searchTerm, $options: 'i' } },
          
      ],
      $and: [
        { reviewStat: "Reviewed" }
      ]
  })
  .sort({ title: 1 })
  .limit(5);
  console.log(articles);
  //res.json(articles);
  res.render('main', {articles});
};