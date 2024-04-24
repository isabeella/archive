const mongoose = require('mongoose');
const Reviewer = mongoose.model('Reviewer');
const Article = mongoose.model('Article');
const promisify = require('es6-promisify');
const mail = require('../handlers/mail');

exports.loginForm = (req, res) => {
  res.render('login', { title: 'Login' });
};

exports.registerForm = (req, res) => {
  res.render('register', { title: 'Register' });
};

exports.validateRegister = (req, res, next) => {
  req.sanitizeBody('firstname');
  req.checkBody('firstname', 'You must supply a firstname!').notEmpty();
  req.sanitizeBody('lastname');
  req.checkBody('lastname', 'You must supply a lastname!').notEmpty();
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
  const reviewer = new Reviewer({ email: req.body.email, firstname: req.body.firstname, lastname: req.body.lastname, status: req.body.status });
  const register = promisify(Reviewer.register, Reviewer);
  await register(reviewer, req.body.password);
  mail.send({
        user: reviewer.email,
        filename: 'new-member',
        subject: 'welcome!'
    });
  next(); // pass to authController.login
};

exports.account = async (req, res) => {
  const reviewer = await Reviewer.findOne({ _id: req.params.id });
  const articles = await Article.find({ email: reviewer.email });
  res.render('account', { reviewer, articles });
};

exports.editReviewer = async (req, res) => {
  // 1. Find the pattern given the ID
  const reviewer = await Reviewer.findOne({ _id: req.params.id });
  // 3. Render out the edit form so the user can update their pattern
  res.render('editReviewer', { reviewer });
};

exports.confirmDelete = async (req, res, next) => {
  const reviewer = await Reviewer.findOneAndDelete({ _id: req.params.id });
  res.redirect('/reviewers');
};

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

exports.updateOwnAccount = async (req, res) => {
  const updates = {
    name: req.body.name,
    email: req.body.email,
    status: req.body.status
  };
  console.log(updates);
  console.log(req.body);
  const reviewer = await Reviewer.findOneAndUpdate(
    { _id: req.params.id },
    { $set: updates },
    { new: true, runValidators: true, context: 'query' }
  );
  res.redirect('/');
};