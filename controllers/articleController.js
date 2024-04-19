const mongoose = require('mongoose');
const Article = mongoose.model('Article');
const Reviewer = mongoose.model('Reviewer');
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
    res.render('main', {articles});
};

exports.submit = async (req, res) => {
    console.log("in submit 1" + req.body.filename);
    console.log(req.body.file);
    try {
        req.body.email = req.user.email;
        req.body.firstname = req.user.firstname;
        req.body.lastname = req.user.lastname;
        req.body.file = req.file.originalname;
        const article = await (new Article(req.body)).save();
        console.log("in submit try");// + article);
        
        // 1. See if a user with that email exists
        const user = await Reviewer.findOne({ email: req.body.email });
        if (!user) {
            req.flash('error', 'No account with that email exists.');
            return res.redirect('/login');
        }
        res.render('thanku');
    }
    catch (error) {
        req.flash('fail', 'Please make sure to fill out all fields and upload a PDF')
        const prefill = req.body
        res.render('contribute', {prefill});
    }
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
    reviewStat: req.body.reviewStat,
    reviewerNotes: req.body.reviewerNotes
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