const express = require('express');

const userController = require('./../controllers/userController');
const authController = require('../controllers/authController');
// const factory = require('../controllers/handlerFactory');
// const User = require('../userModel');
const router = express.Router();

router.route('/forgotPassword').post(authController.forgotPassword);
router.route('/passwordReset/:resetToken').patch(authController.resetPassword);
router.route('/login').post(authController.login);
router.get('/logout', authController.logout);
router.route('/signup').post(authController.signup);
router.use(authController.protect);

router.route('/updatePassword').patch(authController.updatePassword);

router
  .route('/updateMe')
  .patch(
    userController.uploadUserPhoto,
    userController.resizeUserPhoto,
    userController.updateMe
  );
router.route('/deleteMe').delete(userController.deleteMe);
router.route('/getMe').get(userController.getMe, userController.getUser);

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router.use(authController.restrictTo('admin'));
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
