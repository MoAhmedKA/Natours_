const express = require('express');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const viewsController = require('../controllers/viewsController');

const router = express.Router();

router.get(
  '/',
  // bookingController.createBookingCheckOut,
  authController.isLoggedIn,
  viewsController.getOverview
);
router.get(
  '/tour/:tourSlug',
  authController.isLoggedIn,
  viewsController.getTourRender
);
router.get(
  '/my-bookings',
  authController.protect,
  viewsController.getMybookings
);
// router.post(
//   '/submit-user-data',
//   authController.protect,
//   viewsController.updateUserInfo
// );
router.get('/login', authController.isLoggedIn, viewsController.login);
router.get('/me', authController.protect, viewsController.getAccount);
router.get('/signup', viewsController.signup)
module.exports = router;

