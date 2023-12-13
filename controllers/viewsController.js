const Tour = require('../models/tourModel');
const User = require('../userModel');
const catchAsync = require('../catchAsync');
const AppError = require('../appError');
const Booking = require('../models/bookingsModel');
exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();

  res.status(200).render('overview', {
    title: 'All Tours',
    tours
  });
});
exports.getTourRender = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.tourSlug }).populate({
    path: 'reviews',
    fields: 'review rating'
  });
  if (!tour) return next(new AppError(`no tour found with that name`), 404);

  res.status(200).render('tour', {
    tour,
    title: `${tour.name} Tour`
  });
});
exports.login = (req, res) => {
  console.log(req.headers)
  res
    .status(200)
    .setHeader("content security-policy", "default-src: 'none';")
    .render('login', {
      title: 'Log into your account'
    });
};
exports.getAccount = async (req, res) => {
  res.status(200).render('user', { title: 'Your Account' });
};
exports.getMybookings = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user.id });
  const tourIDs = bookings.map(el => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours
  });
});
