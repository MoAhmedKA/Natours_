const express = require('express');

// const router = require('./tourRoutes');
const bookingController = require('../controllers/bookingController');

const router = express.Router();
const authController = require('../controllers/authController');

router.use(authController.protect);

router.get(
  '/checkout-session/:tourID',

  bookingController.getCheckOutSession
);
router.use(authController.restrictTo(['admin', 'lead-guide']));
router.route('/').get(bookingController.getAllBookings);
router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);
module.exports = router;
