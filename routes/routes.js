const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const reviewerController = require('../controllers/reviewerController');
const articleController = require('../controllers/articleController');
const { catchErrors } = require('../handlers/errorHandlers');

router.get('/', catchErrors(articleController.home));

router.get('/contribute', authController.contribute);
router.post('/contribute',
  articleController.upload,
  articleController.submit
);

router.get('/settings', authController.settings);
router.post('/settings/emailprefs', 
            authController.setEmailPrefs,
            authController.settings);
router.post('/settings/emailblast', 
            authController.sendEmailBlast,
            authController.settings);

router.get(`/favorites/:id`, reviewerController.favorites);


router.get('/login', reviewerController.loginForm);
router.post('/login', authController.login);

router.post('/account/forgot', authController.forgot);
router.get(`/account/reset/:token`, authController.reset);
router.post(`/account/reset/:token`, authController.update);

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
router.post('/contact/sendinquiry', catchErrors(articleController.sendinquiry));

router.get('/Sciences', articleController.homeSciences);
router.get('/Mathematics', articleController.homeMathematics);
router.get('/Social%20Sciences', articleController.homeSocialSciences);
router.get('/Other', articleController.homeOther);
router.get('/English', articleController.homeEnglish);
router.get('/Engineering', articleController.homeEngineering);
router.get('/Computer%20Science', articleController.homeComputerScience);
router.get('/Arts', articleController.homeArts);

router.get(`/article/:id`, articleController.getArticle);

router.get('/reviewers', articleController.reviewers);

router.get('/viewers', articleController.viewers);

router.get('/reviewers/edit/:id', reviewerController.editReviewer);
router.post('/reviewers/edit/:id', reviewerController.updateAccount);
router.get('/reviewers/delete/:id', reviewerController.confirmDelete);

router.get('/toreview', articleController.toreview);
router.get('/minetoreview', articleController.minetoreview);
router.get('/reviewed', articleController.reviewed);
router.get(`/delete/:id`, articleController.deleteArticle);

router.get('/review/:id', articleController.reviewArticle);
router.post('/review/:id', articleController.submitReview);

router.get('/edit/:id', articleController.editArticle);
router.post('/edit/:id', articleController.submitEdit);

router.post('/search', articleController.searchArticles);
router.get('/search/tag/:tag', articleController.searchArticlesByTag);

router.get('/account/:id', reviewerController.account);
router.post('/account/:id', reviewerController.updateOwnAccount);
router.post('/account/delete/:id', reviewerController.deleteOwnAccount);

router.post('/article/:id/citation', articleController.generateCitation);
router.post('/article/:id/contact-contributor', reviewerController.contactContributor)

router.get('/unpublished/:id', articleController.myUnpublishedArticles);
router.get('/published/:id', articleController.myPublishedArticles);

router.post('/article/:id/save', reviewerController.saveArticle);
router.post('/article/:id/unsave', reviewerController.unsaveArticle);

module.exports = router;