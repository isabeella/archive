const mongoose = require('mongoose');
const Article = mongoose.model('Article');
const Reviewer = mongoose.model('Reviewer');
const Preference = mongoose.model('Preference');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');
const mail = require('../handlers/mail');
const authController = require('../controllers/authController');

var storage = multer.diskStorage({
    destination: './public/uploads',
    filename: function(req, file, cb){
        cb(null, file.originalname)
    }
});

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
    //Following code creates the Preferences model in mongoose, i only turn it on for the first time i load the website and then comment it out.
//        var defaultPrefs = {
//            pref2: true,
//            pref3: true,
//            pref4: true,
//            pref5: true,
//            pref6: true,
//            pref7: true,
//        }
//        const preference = await (new Preference(defaultPrefs)).save();
    res.render('main', {articles});
};

exports.submit = async (req, res) => {
//    console.log("in submit 1" + req.body.filename);
//    console.log(req.body.file);
    try {
        req.body.email = req.user.email;
        req.body.firstname = req.user.firstname;
        req.body.lastname = req.user.lastname;
        req.body.file = req.file.originalname;
        req.body.edit = "false"
        const article = await (new Article(req.body)).save();
        console.log("in submit try" + article);
    }
    catch (error) {
        req.flash('fail', 'Please make sure to fill out all fields and upload a PDF')
        const prefill = req.body
        res.render('contribute', {prefill});
    }
    mail.send({
        user: req.user.email,
        filename: 'new-contribution',
        subject: 'Thanks!'
    });
    const settings = await Preference.findOne({ _id: "6629c125c630f6b78354b44f" });
    var reviewersReceiving = [];
    var reviewersReceivingEmails = [];
    if(settings.pref5 == true){
        var addReviewers = await Reviewer.find({ status: 2 });
        reviewersReceiving.push.apply(reviewersReceiving, addReviewers); 
    } 
    if(settings.pref6 == true){
        var addReviewers = await Reviewer.find({ status: 3 });
        reviewersReceiving.push.apply(reviewersReceiving, addReviewers); 
    } 
    if(settings.pref7 == true){
        var addReviewers = await Reviewer.find({ status: 4 });
        reviewersReceiving.push.apply(reviewersReceiving, addReviewers);  
    }
    for(let i = 0; i < reviewersReceiving.length; i++){
        reviewersReceivingEmails.push(reviewersReceiving[i].email);
    }
    console.log(reviewersReceivingEmails);
    mail.sendAnon({
        user: reviewersReceivingEmails,
        filename: 'reviewer-new-article',
        subject: 'New to Review'
    });
    res.render('thanku');
};

exports.getArticle = async (req, res) => {
    console.log(req.params.id);
    const article = await Article.findOne({ _id: req.params.id });
    res.render('article', { article });
}

exports.reviewers = async (req, res) => {
    const levelsToFind = [1, 2, 3, 4]; // Specify the levels you want to find
    const reviewers = await Reviewer.find({ status: { $in: levelsToFind } });
    res.render('reviewers', { reviewers });
}

exports.viewers = async (req, res) => {
    const reviewers = await Reviewer.find({ status: 0 });
    res.render('reviewers', { reviewers });
}

exports.contact = async(req, res) => {
    if(req.user){
        console.log(req.user);
    }
    res.render('contact');
}

exports.sendinquiry = async(req, res) => {
    let maillist = [];
    var level4s = await Reviewer.find({ status: 4 });
    for (let i = 0; i < level4s.length; i++){
        maillist.push(level4s[i].email);
    }
    if(maillist.length != 0){
        mail.sendInquiry({
            from: req.body.email,
            user: maillist,
            filename: 'user-inquiry',
            subject: req.body.subject,
            message: req.body.message
        });
    }
    res.redirect('/');
}

exports.toreview = async(req, res) => {
    const articles = await Article.find({ reviewStat: "In Review", reviewer: "" });
    res.render('articles', { articles });
}

exports.minetoreview = async(req, res) => {
    const articles = await Article.find({ reviewStat: "In Review", reviewer: req.user.email });
    res.render('articles', { articles });
}

exports.reviewed = async(req, res) => {
    const articles = await Article.find({ reviewStat: "Reviewed" });
    res.render('articles', { articles });
}

exports.reviewArticle = async(req, res) => {
    const article = await Article.findOne({ _id: req.params.id });
    const levelsToFind = [2, 3, 4]; // Specify the levels you want to find
    const reviewers = await Reviewer.find({ status: { $in: levelsToFind } });
    res.render('reviewing', { article });
}

exports.submitReview = async(req, res) => {
  var toSplit = req.body.tags;
  var arrayWTags = toSplit.split(", ");
  if(req.body.edit && req.body.reviewStat!="Reviewed"){
    var editStatus = "true";  
  }
  else{
    var editStatus = "false";
  }
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
    reviewer: req.user.email,
    reviewStat: req.body.reviewStat,
    reviewerNotes: req.body.reviewerNotes, 
    edit: editStatus
  };
  var message = updates.reviewerNotes;
  var status = updates.reviewStat;
  const reviewer = await Article.findOneAndUpdate(
    { _id: req.params.id },
    { $set: updates },
    { new: true, runValidators: true, context: 'query' }
  );
  const settings = await Preference.findOne({ _id: "6629c125c630f6b78354b44f" });
  if(req.body.reviewStat == "In Review"){  
      if(settings.pref2){
          mail.sendContributionUpdate({
            user: updates.email,
            filename: 'review-update',
            subject: 'UPDATE: Westridge Archive Submission',
            message,
            status
          });
      }
  }
  else if(req.body.reviewStat == "Reviewed"){
      if(settings.pref4){
          mail.sendContributionUpdate({
            user: updates.email,
            filename: 'review-update',
            subject: 'UPDATE: Westridge Archive Submission',
            message,
            status
          });
      }
  }
  
  res.redirect('/');
}

exports.editArticle = async(req, res) => {
    const article = await Article.findOne({ _id: req.params.id });
    res.render('editing', { article });
}

exports.submitEdit = async(req, res) => {
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
    edit: "false"
  };
  const article = await Article.findOneAndUpdate(
    { _id: req.params.id },
    { $set: updates },
    { new: true, runValidators: true, context: 'query' }
  );
  //console.log(article);
  const settings = await Preference.findOne({ _id: "6629c125c630f6b78354b44f" });
  if(settings.pref3){
      mail.sendEditUpdate({
        user: article.reviewer,
        filename: 'edit-update',
        subject: 'UPDATE: Contributor Edits',
        article
      });
  }
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

exports.deleteArticle = async (req, res) => {
    const article = await Article.findOneAndDelete({ _id: req.params.id });
    res.redirect('/toreview');
}

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

exports.myUnpublishedArticles = async (req, res) => {
  const reviewer = await Reviewer.findOne({ _id: req.params.id });
  const articles = await Article.find({ email: reviewer.email, reviewStat: "In Review" });
  res.render('account', { reviewer, articles });
}

exports.myPublishedArticles = async (req, res) => {
  const reviewer = await Reviewer.findOne({ _id: req.params.id });
  const articles = await Article.find({ email: reviewer.email, reviewStat: "Reviewed" });
  res.render('account', { reviewer, articles });
}

exports.generateCitation = async (req, res) => {
    const article = await Article.findOne({ _id: req.params.id });
    const citationStyle = req.body.style
    if(citationStyle == "MLA"){
        var citation = MLA(article);
    }
    if(citationStyle == "APA"){
        var citation = APA(article);
    }
    if(citationStyle == "Chicago (Bibliography)"){
        var citation = BIB(article);
    }
    if(citationStyle == "Chicago (Footnote)"){
        var citation = FOO(article);
    } 
    res.render('article', { article, citationStyle, citation });  
}

function MLA(article){
    //Author. "Title." Title of container (self contained if book), Publisher, Publication Date, URL. Date of Access (if applicable).
    //Perahya, Dan. ""resume"." Westridge Archive, 7 June 2024, wrchive.com.
    const author = `${article.lastname}, ${article.firstname}`;
    const dateObj = new Date(article.date);
    const year = dateObj.getFullYear();
    const month = dateObj.toLocaleString('default', { month: 'long' });
    const day = dateObj.getDate();
    const formattedDate = `${day} ${month} ${year}`;
    const title = `"${article.title}"`;
    const websiteName = 'Westridge Archive';
    const url = "wrchive.com";
    const accessDate = new Date().toLocaleDateString('default', { year: 'numeric', month: 'long', day: 'numeric' });

    const citation = `${author}. ${title}. ${websiteName}, ${formattedDate}, ${url}. Accessed ${accessDate}`;
    return citation;
}
function APA(article){
    //Lastname, F. M. (Year, Month Date). Title of page. Site name. URL
    const author = `${article.lastname}, ${article.firstname.charAt(0)}.`;
    const dateObj = new Date(article.date);
    const year = dateObj.getFullYear();
    const month = dateObj.toLocaleString('default', { month: 'long' });
    const day = dateObj.getDate();
    const formattedDate = `(${year}, ${month} ${day})`;
    const title = `"${article.title}"`;
    const websiteName = 'Westridge Archive';
    const url = "wrchive.com";

    const citation = `${author} ${formattedDate}. ${title}. ${websiteName}. Retrieved from ${url}`;
    return citation;
}
function BIB(article){
    //Lastname, Firstname. “Title of Web Page.” Name of Website. Publishing organization, publication or revision date if available. Access date if no other date is available. URL .
    const author = `${article.lastname}, ${article.firstname}`;
    const dateObj = new Date(article.date);
    const year = dateObj.getFullYear();
    const month = dateObj.toLocaleString('default', { month: 'long' });
    const day = dateObj.getDate();
    const formattedDate = `${day} ${month} ${year}`;
    const title = `"${article.title}."`;
    const websiteName = 'Westridge Archive';
    const url = "wrchive.com";

    const citation = `${author}. ${title} ${websiteName}. Last modified ${formattedDate}. ${url}.`;
    return citation;
}
function FOO(article){
    //1. Firstname Lastname, “Title of Web Page,” Name of Website, publication or revision date if available, access date if no other date is available, URL.
    const author = `${article.firstname} ${article.lastname}`;
    const dateObj = new Date(article.date);
    const year = dateObj.getFullYear();
    const month = dateObj.toLocaleString('default', { month: 'long' });
    const day = dateObj.getDate();
    const formattedDate = `${day} ${month} ${year}`;
    const title = `"${article.title},"`;
    const websiteName = 'Westridge Archive';
    const url = "wrchive.com";
    
    const citation = `1. ${author}, ${title} ${websiteName}, (${formattedDate}), ${url}`;
    return citation;
}