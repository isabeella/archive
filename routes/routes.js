const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const reviewerController = require('../controllers/reviewerController');
const articleController = require('../controllers/articleController');
const { catchErrors } = require('../handlers/errorHandlers');

router.get('/', catchErrors(articleController.home));

router.get('/contribute', catchErrors(authController.contribute));
router.post('/contribute',
  articleController.upload,
  articleController.submit
);

router.get('/login', reviewerController.loginForm);
router.post('/login', authController.login);

//router.post('/account/forgot', authController.forgot);

router.get('/register', reviewerController.registerForm);
// 1. Validate the registration data
// 2. register the user
// 3. we need to log them in
router.post('/register',
  reviewerController.validateRegister,
  reviewerController.register,
  authController.login
);

router.get('/logout', authController.logout);

router.get('/contact', catchErrors(articleController.contact));

router.get('/Sciences', articleController.homeSciences);
router.get('/Mathematics', articleController.homeMathematics);
router.get('/Social%20Sciences', articleController.homeSocialSciences);
router.get('/Other', articleController.homeOther);
router.get('/English', articleController.homeEnglish);
router.get('/Engineering', articleController.homeEngineering);
router.get('/Computer%20Science', articleController.homeComputerScience);
router.get('/Arts', articleController.homeArts);

router.get(`/article/:id`, articleController.getArticle);

router.get('/reviewers', articleController.reviewers)

router.get('/reviewers/edit/:id', reviewerController.editReviewer);
router.post('/reviewers/edit/:id', reviewerController.updateAccount);
router.get('/reviewers/delete/:id', reviewerController.confirmDelete);

router.get('/toreview', articleController.toreview);
router.get('/reviewed', articleController.reviewed);
router.get('/review/:id', articleController.reviewArticle);
router.post('/review/:id', articleController.submitReview);

router.post('/search', articleController.searchArticles);

router.get('/account', reviewerController.account);

module.exports = router;