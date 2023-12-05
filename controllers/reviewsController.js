const Review = require('../models/reviewsModel');
const catchAsync = require('../catchAsync');
const factory = require('./handlerFactory');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  console.log(Review);
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };
  const reviews = await Review.find(filter).populate({
    path: 'user'
  });
  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews
    }
  });
});
exports.setTourUserIds = (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;
  if (!req.body.tour) req.body.tour = req.params.tourId;
  next();
};
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
