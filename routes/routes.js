const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const reviewerController = require('../controllers/reviewerController');
const reviewerController = require('../controllers/articleController');
const { catchErrors } = require('../handlers/errorHandlers');

router.get('/', catchErrors(articleController.home));

router.get('/contribute', catchErrors(articleController.contribute));
router.post('/contribute',
  articleController.upload,
  articleController.submit
);

router.get('/login', reviewerController.loginForm);
router.post('/login', authController.login);

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
router.get('/Computer%20Science', articleController.homeCompputerScience);
router.get('/Arts', articleController.homeArts);

router.get(`/article/:id`, articleController.getArticle);

router.get('/reviewers', articleController.reviewers)

router.get('/reviewers/edit/:id', reviewerController.editReviewer);
router.post('/reviewers/edit/:id', reviewerController.updateAccount);
router.get('/reviewers/delete/:id', reviewerController.confirmDelete);

router.get('/toreview', articleController.toreview);
router.get('/reviewed', articleController.reviewed);


//router.get('/essays', catchErrors(appController.getEssays));
//router.get('/upload', appController.contribute);
//router.post('/upload', appController.upload, appController.submit);
//
//router.get('/essays/:id/view', appController.viewEssay)
//router.get('/essays/:id/edit', appController.editEssay)

//router.get('/stores', catchErrors(storeController.getStores));
//router.get('/add', authController.isLoggedIn, storeController.addStore);
//
//router.post('/add',
//  storeController.upload,
//  catchErrors(storeController.resize),
//  catchErrors(storeController.createStore)
//);
//
//router.post('/add/:id',
//  storeController.upload,
//  catchErrors(storeController.resize),
//  catchErrors(storeController.updateStore)
//);
//
//router.get('/stores/:id/edit', catchErrors(storeController.editStore));
//router.get('/store/:slug', catchErrors(storeController.getStoreBySlug));
//
//router.get('/tags', catchErrors(storeController.getStoresByTag));
//router.get('/tags/:tag', catchErrors(storeController.getStoresByTag));
//
//router.get('/login', userController.loginForm);
//router.post('/login', authController.login);
//router.get('/register', userController.registerForm);
//
//router.get('/account', authController.isLoggedIn, userController.account);
//router.post('/account', catchErrors(userController.updateAccount));
//router.post('/account/forgot', catchErrors(authController.forgot));
//router.get('/account/reset/:token', catchErrors(authController.reset));
//router.post('/account/reset/:token',
//  authController.confirmedPasswords,
//  catchErrors(authController.update)
//);
module.exports = router;
