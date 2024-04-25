const passport = require('passport');
const crypto = require('crypto');
const mongoose = require('mongoose');
const Reviewer = mongoose.model('Reviewer');
const Preference = mongoose.model('Preference');
const promisify = require('es6-promisify');
const mail = require('../handlers/mail');

exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Failed Login!',
  successRedirect: '/',
  successFlash: 'You are now logged in!'
});

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

exports.contribute = (req, res) => {
  if(req.isAuthenticated()){  
    res.render('contribute');
  }
  else{
    res.render('login', { title: 'Login'});
  }
};

exports.settings = async(req, res) => {
    const preferences = await Preference.findOne({ _id: "6629c125c630f6b78354b44f"});
    res.render('settings', {preferences});
}

exports.setEmailPrefs = async(req, res, next) => {
    if(req.body.pref2 == "on"){
        var twoPref = true;
    }
    else{
        var twoPref = false;
    }

    if(req.body.pref3 == "on"){
        var threePref = true;
    }
    else{
        var threePref = false;
    }

    if(req.body.pref4 == "on"){
        var fourPref = true;
    }
    else{
        var fourPref = false;
    }
    
    if(req.body.pref5 == "on"){
        var fivePref = true;
    }
    else{
        var fivePref = false;
    }
    
    if(req.body.pref6 == "on"){
        var sixPref = true;
    }
    else{
        var sixPref = false;
    }
    
    if(req.body.pref7 == "on"){
        var sevenPref = true;
    }
    else{
        var sevenPref = false;
    }
    
    var updates = {
        pref2: twoPref,
        pref3: threePref,
        pref4: fourPref,
        pref5: fivePref,
        pref6: sixPref,
        pref7: sevenPref
    }
            
    const settings = await Preference.findOneAndUpdate(
    { _id: "6629c125c630f6b78354b44f" },
    { $set: updates },
    { new: true, runValidators: true, context: 'query' }
  );
  const preferences = await Preference.findOne({ _id: "6629c125c630f6b78354b44f"});
  next();
}

exports.sendEmailBlast = async(req, res, next) => {
    var maillist = [];
    if(req.body.group4){
        var group4 = await Reviewer.find({ status: 4 });
        for (let i = 0; i < group4.length; i++){
            maillist.push(group4[i].email);
        }
    } 
    if(req.body.group3){
        var group3 = await Reviewer.find({ status: 3 });
        for (let i = 0; i < group3.length; i++){
            maillist.push(group3[i].email);
        }
    } 
    if(req.body.group2){
        var group2 = await Reviewer.find({ status: 2 });
        for (let i = 0; i < group2.length; i++){
            maillist.push(group2[i].email);
        }
    } 
    if(req.body.group1){
        var group1 = await Reviewer.find({ status: 1 });
        for (let i = 0; i < group1.length; i++){
            maillist.push(group1[i].email);
        }
    } 
    if(req.body.group0){
        var group0 = await Reviewer.find({ status: 0 });
        for (let i = 0; i < group0.length; i++){
            maillist.push(group0[i].email);
        }
    } 
    console.log(maillist);
    
    if(maillist.length != 0){
        mail.sendBlast({
            user: maillist,
            filename: 'email-blast',
            subject: req.body.subject,
            message: req.body.message
        });
    }
    
    next();
}