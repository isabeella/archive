const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const reviewerController = require('../controllers/reviewerController');
const { catchErrors } = require('../handlers/errorHandlers');

router.get('/', catchErrors(reviewerController.home));

router.get('/contribute', catchErrors(authController.contribute));
router.post('/contribute',
  reviewerController.upload,
  reviewerController.createArticle
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

router.get('/contact', catchErrors(reviewerController.contact));

router.get('/Sciences', reviewerController.science);
router.get('/Mathematics', reviewerController.math);
router.get('/Social%20Sciences', reviewerController.socialsciences);
router.get('/Other', reviewerController.other);
router.get('/English', reviewerController.english);
router.get('/Engineering', reviewerController.engineering);
router.get('/Computer%20Science', reviewerController.compsci);
router.get('/Arts', reviewerController.art);

router.get(`/article/:id`, reviewerController.getArticle);

router.get('/reviewers', reviewerController.reviewers)

router.get('/reviewers/edit/:id', reviewerController.editReviewer);
router.post('/reviewers/edit/:id', reviewerController.updateAccount);
router.get('/reviewers/delete/:id', reviewerController.confirmDelete);

router.get('/toreview', reviewerController.toreview);
router.get('/reviewed', reviewerController.reviewed);


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
