const stripe = require('stripe')(
  process.env.STRIPE_SECRET_KEY
);
const factory = require('./handlerFactory');
const Tour = require('../models/tourModel');
const AppError = require('../appError');
const User=require('../userModel')
const catchAsync = require('../catchAsync');
const Booking = require('../models/bookingsModel');
const createBookingCheckOut = async session => {
  const tour = session.client_reference_id
  const user = (await User.findOne({ email: session.customer_email })).id
  const price=session.line_items[0].unit_amount / 100
    await Booking.create({
         tour,
    user,
         price
       });

  
}
exports.webhookCheckOut = (req, res,next) => {
  const signature = req.headers['stripe=signature']
  let event;
  try {
    event =stripe.webhooks.constructEvent(req.body,signature,process.env.STRIPE_WEBHOOK_SECERT)
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`)
  }
  if (event.type === 'checkout.session.complete') 
     createBookingCheckOut(event.data.object)
   return res.status(200).json({received:true})
  

  }
   
exports.getAllBookings = factory.getAll(Booking);
exports.getBooking = factory.getOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.getCheckOutSession = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourID);
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')} `,

    cancel_url: `${req.protocol}://${req.get('host')}/my-bookings`,
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
// exports.createBookingCheckOut = catchAsync(async (req, res, next) => {
//   //unsecure

//   const { user, tour, price } = req.query;

//   if (!user || !tour || !price) return next();
//   await Booking.create({
//     tour,
//     user,
//     price
//   });
//   res.redirect(req.originalUrl.split('?')[0]);
//   next();
// });
