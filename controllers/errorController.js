const AppError = require('../appError');
//error isOperational approve//
const handelExpiredTokenError = () => new AppError(`jwt expired `, 401);
const handelJsonWebTokenError = () => new AppError(`Invaild input data.`, 401);

const handleCastError = err => {
  const message = `Invaild ${err.path}:${err.value}. `;
  return new AppError(message, 400);
};
const handleValidationError = err => {
  const errors = Object.values(err.errors).map(error => error.message);

  const message = `Invaild input data. ${errors.join('. ')} `;

  return new AppError(message, 400);
};

// const handleDeplicateFieldsError = err => {
//    ('sus');
//   const value = err.errmsg.match(/((?:'|").* (?:'|"))/);
//   const message = `Invaild deplicate field (${value})please use another value.`;
//   return new AppError(message, 400);
// };

const sendErrProduct = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOpperational) {
      // eslint-disable-next-line no-console
      //  (err);
      //  (err.message);
      //  (err.isOpperational);

      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    }

    console.error(err.message);
    //  (process.env.NODE_ENV);
    //  (err.isOpperational);
    // console.error('ERROR!', err);
    return res.status(500).json({
      status: 'error',
      message: 'Somthing Went Wrong...'
    });
  }

  //  (process.env.NODE_ENV);
  //  (err.isOpperational);
  // console.error('ERROR!', err);
  if (err.isOpperational) {
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message
    });
  }
};

const sendErrDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err
    });
  }
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  //  (err.name);
  //  (err.path);
  if (process.env.NODE_ENV === 'development') {
    sendErrDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = Object.create(err);
    // console.log(error);

    //error indenitifier //
    if (err.name === 'CastError') error = handleCastError(error);
    // console.log(error.statusCode);
    // if (err.code === 11000) error = handleDeplicateFieldsError(error);
    // console.log(error);
    if (err.name === 'ValidationError') error = handleValidationError(error);
    if (err.name === 'JsonWebTokenError') error = handelJsonWebTokenError();
    if (err.name === 'TokenExpiredError') error = handelExpiredTokenError();
    sendErrProduct(error, req, res);
  }
};
