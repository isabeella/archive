const passport = require('passport');
const mongoose = require('mongoose');
const Reviewer = mongoose.model('Reviewer');

passport.use(Reviewer.createStrategy());

passport.serializeUser(Reviewer.serializeUser());
passport.deserializeUser(Reviewer.deserializeUser());
