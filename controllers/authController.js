const passport = require('passport');
const crypto = require('crypto');
const mongoose = require('mongoose');
const Article = mongoose.model('Article');
const Reviewer = mongoose.model('Reviewer');
const promisify = require('es6-promisify');
const mail = require('../handlers/mail');
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');

exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Failed Login!',
  successRedirect: '/',
  successFlash: 'You are now logged in!'
});

exports.contribute = (req, res) => {
  if(req.isAuthenticated()){  
    res.render('contribute');
  }
  else{
    res.render('login', { title: 'Login'});
  }
};

exports.submit = async (req, res) => {
    console.log(req.file);
    console.log(req.body);
    req.body.file = req.file.originalname;
    const article = await (new Article(req.body)).save();
    console.log(article)
    res.render('thanku');
};

//exports.logout = (req, res) => {
//  req.logout();
//  //req.flash('success', 'You are now logged out! 👋');
//  res.redirect('/');
//};

exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      // Handle the error, maybe log it or show an error page
      return res.status(500).send('Error during logout');
    }
    //req.flash('success', 'You are now logged out! 👋');
    res.redirect('/');
  });
};

exports.isLoggedIn = (req, res, next) => {
  // first check if the user is authenticated
  if (req.isAuthenticated()) {
    next(); // carry on! They are logged in!
    return;
  }
  req.flash('error', 'Oops you must be logged in to do that!');
  res.redirect('/login');
};

exports.forgot = async (req, res) => {
  // 1. See if a user with that email exists
  const user = await Reviewer.findOne({ email: req.body.email });
  if (!user) {
    req.flash('error', 'No account with that email exists.');
    return res.redirect('/login');
  }
  // 2. Set reset tokens and expiry on their account
  user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now
  await user.save();
  // 3. Send them an email with the token
  const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
  await mail.send({
    user,
    filename: 'password-reset',
    subject: 'Password Reset',
    resetURL
  });
  req.flash('success', `You have been emailed a password reset link.`);
  // 4. redirect to login page
  res.redirect('/login');
};

exports.reset = async (req, res) => {
  const user = await Reviewer.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  });
  if (!user) {
    req.flash('error', 'Password reset is invalid or has expired');
    return res.redirect('/login');
  }
  // if there is a user, show the rest password form
  res.render('reset', { title: 'Reset your Password' });
};

exports.confirmedPasswords = (req, res, next) => {
  if (req.body.password === req.body['password-confirm']) {
    next(); // keepit going!
    return;
  }
  req.flash('error', 'Passwords do not match!');
  res.redirect('back');
};

exports.update = async (req, res) => {
  const user = await Reviewer.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    req.flash('error', 'Password reset is invalid or has expired');
    return res.redirect('/login');
  }

  const setPassword = promisify(user.setPassword, user);
  await setPassword(req.body.password);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  const updatedUser = await user.save();
  await req.login(updatedUser);
  req.flash('success', '💃 Nice! Your password has been reset! You are now logged in!');
  res.redirect('/');
};

exports.account = async(req, res) => {
    console.log("line 103 params: " + req.params.id);
    const user = await Reviewer.findOne({ _id: req.params.id });
    console.log(user);
    const articles = await Article.find({ email: user.email });
    console.log(articles);
    res.render('account', { title: 'Account', articles });
};


exports.updateInfo = async(req, res) => {
    const updates = {
        email: req.body.email,
        name: req.body.name,
    };
    console.log(updates);
    const user = await Reviewer.findOneAndUpdate(
        { _id: req.params.id },
        { $set: updates },
        { new: true, runValidators: true, context: 'query' });
    next();
};

exports.confirmation = async (req, res, next) => {
  const user = await Reviewer.findOne({ email: req.body.email });
  await mail.send({
    user,
    filename: 'confirmation-email',
    subject: 'Thank you for your contribution!'
  });
  console.log(user);
  next();
};

/*
exports.forgot = async (req, res) => {
  // 1. See if a user with that email exists
  const user = await Reviewer.findOne({ email: req.body.email });
  if (!user) {
    req.flash('error', 'No account with that email exists.');
    return res.redirect('/login');
  }
  // 2. Set reset tokens and expiry on their account
  user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now
  await user.save();
  // 3. Send them an email with the token
  const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
  await mail.send({
    user,
    filename: 'password-reset',
    subject: 'Password Reset',
    resetURL
  });
  req.flash('success', `You have been emailed a password reset link.`);
  // 4. redirect to login page
  res.redirect('/login');
};
*/