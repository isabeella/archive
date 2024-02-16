const mongoose = require('mongoose');
const Reviewer = mongoose.model('Reviewer');
const Article = mongoose.model('Article');
const express = require("express")
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');
const promisify = require('es6-promisify');

exports.home = async (req, res) => {
  const articles = await Article.find({ reviewStat: "Reviewed" });
  res.render('main', {articles});  
  //console.log(articles);
};

exports.loginForm = (req, res) => {
  res.render('login', { title: 'Login'});
};

exports.registerForm = (req, res) => {
  res.render('register', { title: 'Register' });
};

exports.getArticle = async (req, res) => {
    const article = await Article.findOne({ _id: req.params.id });
    res.render('article', { article });
}

exports.validateRegister = (req, res, next) => {
  console.log(req.body);
  req.sanitizeBody('name');
  req.checkBody('name', 'You must supply a name!').notEmpty();
  req.checkBody('email', 'That Email is not valid!').isEmail();
  req.sanitizeBody('email').normalizeEmail({
    gmail_remove_dots: false,
    remove_extension: false,
    gmail_remove_subaddress: false
  });
  req.checkBody('password', 'Password Cannot be Blank!').notEmpty();
  req.checkBody('password-confirm', 'Confirmed Password cannot be blank!').notEmpty();
  req.checkBody('password-confirm', 'Oops! Your passwords do not match').equals(req.body.password);

  const errors = req.validationErrors();
  if (errors) {
    console.log(errors.map(err => err.msg));
    req.flash('error', errors.map(err => err.msg));
    res.render('register', { title: 'Register', body: req.body, flashes: req.flash() });
    return; // stop the fn from running
  }
  next(); // there were no errors!
};

exports.register = async (req, res, next) => {
  const reviewer = new Reviewer({ email: req.body.email, 
                                 name: req.body.name });
  if(req.body.reviewer == "Yes"){ reviewer.status=1 }
  const register = promisify(Reviewer.register, Reviewer);
  await register(reviewer, req.body.password);
  next(); // pass to authController.login
};

exports.account = (req, res) => {
  res.render('account', { title: 'Edit Your Account' });
};

exports.confirmDelete = async (req, res) => {
  console.log("deleting reviewer:");
  const reviewer = await Reviewer.findOneAndDelete({ _id: req.params.id });
  res.redirect('/reviewers');
};

exports.editReviewer = async (req, res) => {
  console.log("edit reviewer:");
  // 1. Find the pattern given the ID
  const reviewer = await Reviewer.findOne({ _id: req.params.id });
  // 3. Render out the edit form so the user can update their pattern
  res.render('editReviewer', { reviewer });
};

//exports.confirmDelete = async (req, res, next) => {
//  const updates = {
//    status: 0
//  };
//  const reviewer = await Reviewer.findOneAndUpdate(
//    { _id: req.params.id },
//    { $set: updates },
//    { new: true, runValidators: true, context: 'query' });
//  res.redirect('/reviewers');
//};

exports.updateAccount = async (req, res) => {
  const updates = {
    status: req.body.status
  };
  const reviewer = await Reviewer.findOneAndUpdate(
    { _id: req.params.id },
    { $set: updates },
    { new: true, runValidators: true, context: 'query' }
  );
  res.redirect('/reviewers');
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/")
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname)
  },
})

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPDF = file.mimetype === 'application/pdf';
    if (isPDF) {
      next(null, true);
    } else {
      next({ message: 'Only PDF files are allowed!' }, false);
    }
  }
};

exports.upload = multer(multerOptions).single('file');

exports.createArticle = async (req, res) => {
  //req.body.author = res.user._id;
  const article = await (new Article(req.body)).save();
  //console.log(article);
  req.flash('success', `Successfully Created ${article.title}`);
  res.redirect(`/`);
};

exports.contact = (req, res) => {
    res.render('contact');
}

exports.science = async (req, res) => {
  const articles = await Article.find({Subject:"Science"});
  res.render('main', {articles});  
  console.log(articles)
};
exports.math = async (req, res) => {
  const articles = await Article.find({Subject:"Mathematics"});
  res.render('main', {articles});  
  console.log(articles)
};
exports.socialsciences = async (req, res) => {
  const articles = await Article.find({Subject:`Social Sciences`});
  res.render('main', {articles});  
  console.log(articles)
};
exports.other = async (req, res) => {
  const articles = await Article.find({Subject:"Other"});
  res.render('main', {articles});  
  console.log(articles)
};
exports.english = async (req, res) => {
  const articles = await Article.find({Subject:"English"});
  res.render('main', {articles});  
  console.log(articles)
};
exports.engineering = async (req, res) => {
  const articles = await Article.find({Subject:"Engineering"});
  res.render('main', {articles});  
  console.log(articles)
};
exports.compsci = async (req, res) => {
  const articles = await Article.find({Subject:"Computer Science"});
  res.render('main', {articles});  
  console.log(articles)
};
exports.art = async (req, res) => {
  const articles = await Article.find({Subject:"Arts"});
  res.render('main', {articles});  
  console.log(articles)
};

exports.reviewers = async (req, res) => {
    const reviewers = await Reviewer.find();
    res.render('reviewers', {reviewers})
}



//added from article controller
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



//const searchBar = document.getElementById('searchButton');
//const searchResults = document.getElementById('searchResults');
// 
//function searchMongo(event) {
//  searchResults.innerHTML = "";
//  fetch(`/api/search?q=${event.target.value}`)
//  .then(response => response.json())
//  .then(data => {
//    // Do something with the data...
//    let r = `<ul class="list-group">`
//    for (let i = 0; i < data.length; i++) {
//      r += `<li class="list-group-item"><a href="/student/${data[i]._id}">${data[i].name} - ${data[i].grade} (${data[i].advisor})</a></li>`
//    }
//    r += '</ul>'
//    searchResults.innerHTML = r;
//    //console.log(data[0].name);
//    return;
//  })
//  .catch(error => {
//    console.error('Error:', error);
//  });
//}







////exports.upload = (req, res, err) => {
//    if (err) {
//      res.status(400).json({ error: err.message });
//      return;
//    }
//
//    // Now, req.file contains the PDF file data
//    res.json({ success: true });
//};
   


//exports.createStore = async (req, res) => {
//  req.body.author = req.user._id;
//  const article = await (new Article(req.body)).save();
//  req.flash('success', `Successfully Created ${article.title}`);
//  res.redirect(`/`);
//};
//
//const multerOptions = {
//  storage: multer.memoryStorage(),
//  fileFilter(req, file, next) {
//    const ispdf = file.mimetype.startsWith('pdf/');
//    if(ispdf) {
//      next(null, true);
//    } else {
//      next({ message: 'That filetype isn\'t allowed!' }, false);
//    }
//  }
//};
//
//exports.upload = multer(multerOptions).single('pdf');
