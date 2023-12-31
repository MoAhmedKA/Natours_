const globalErrorHandler = require(`./controllers/errorController.js`);
const express = require('express');
const path = require('path');
const cors = require('cors');

const cookieParser = require('cookie-parser');

const AppError = require(`./appError`);
const morgan = require('morgan');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const hpp = require('hpp');
const viewsRouter = require('./routes/viewRoutes.js');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingController=require('./controllers/bookingController.js')
const bookingRouter = require('./routes/bookingRoutes.js');
const { syncBuiltinESMExports } = require('module');
const compression = require('compression');


//Start Express App

const app = express();
 app.enable('trust proxy',100)
app.use(cors())
app.use(compression());
app.options('*',  cors())
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
// 1) Global MIDDLEWARES
app.use(express.static(path.join(__dirname, 'public')));
//Set Sucurity HTTP Header //
 app.use(
   helmet({
     contentSecurityPolicy: false
    
   })
 );



const limiter = rateLimit({
  max: 200,
  windowMs: 60 * 60 * 1000,
  message: 'too many requests from this IP . please try again in 1 hour'
});

//Development Logging//
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
//limit requestes from same IP //
app.use('/api', limiter);
app.post('/webhook-checkout', express.raw({
  type: 'application/json'
  
}),bookingController.webhookCheckOut)
//body parser,reading data from body into req.body//
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
//Serving static files//

//test middleware

app.use(mongoSanitize());
app.use(xss());
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);
// 3) ROUTES
app.use('/', viewsRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Cannot Reach ${req.originalUrl}`
  // });

  // err.status = 'fail';
  // err.statusCode = 404;
  next(new AppError(`Cannot Reach ${req.originalUrl}`, 404));
});
app.use(globalErrorHandler);
module.exports = app;
