const stripe = require('stripe')(
  'sk_test_51OIAWQFIeC3jKQHFC3DlTBFUa4pmOuSRu4WweI1bXfLbf8IclvRAReOXxhSXbiwBb55PbUYzwFSK7vc2En3vkxvW00WBRZBgIK'
);
const factory = require('./handlerFactory');
const Tour = require('../models/tourModel');
const AppError = require('../appError');

const catchAsync = require('../catchAsync');
const Booking = require('../models/bookingsModel');
exports.getAllBookings = factory.getAll(Booking);
exports.getBooking = factory.getOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.getCheckOutSession = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourID);
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourID
    }&user=${req.user.id}&price=${tour.price}`,

    cancel_url: `${req.protocol}://${req.get('host')}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourID,
    line_items: [
      {
        quantity: 1,
        price_data: {
          unit_amount: tour.price * 100,
          currency: 'usd',
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`]
          }
        }
      }
    ]
  });

  res.status(200).json({
    status: 'success',
    session
  });
});
exports.createBookingCheckOut = catchAsync(async (req, res, next) => {
  //unsecure

  const { user, tour, price } = req.query;

  if (!user || !tour || !price) return next();
  await Booking.create({
    tour,
    user,
    price
  });
  res.redirect(req.originalUrl.split('?')[0]);
  next();
});
