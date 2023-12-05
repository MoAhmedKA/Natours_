const express = require('express');
const tourController = require('./../controllers/tourController');
// const reviewController = require('../controllers/reviewsController');

const authController = require('../controllers/authController');
const reviewRouter = require('../routes/reviewRoutes');

const router = express.Router();

//router.param('id', tourController.checkID);
router.use('/:tourId/reviews', reviewRouter);
router
  .route('/top--5--cheap/')
  .get(tourController.aliasTopTours, tourController.getAllTours);
router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);
router.route('/tour-stats').get(tourController.getTourStats);
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo(['lead-guide', 'admin']),
    tourController.updatedTourImage,
    tourController.resizeTourImage,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo(['admin', 'lead-guide']),
    tourController.deleteTour
  );

module.exports = router;
// app.get(router+'/tour-stats').then(tourController.getTourStats)
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo(['admin', 'lead-guide', 'guides']),
    tourController.getMonthlyPlan
  );
router
  .route('/tour-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);
// router
// .route('')
// .post(
//   authController.protect,
//   authController.restrictTo(['user', 'admin']),
//   reviewController.createReview
// );
router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);
