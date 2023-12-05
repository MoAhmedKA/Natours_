const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const catchAsync = require('../catchAsync');
const User = require('../userModel');
const AppError = require('../appError');
const Email = require('../email');

const sign = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};
const cookieOptions = {
  expires: new Date(
    Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
  ),
  secure: true,
  httpOnly: true
};
const createSendToken = function(user, statusCode, res) {
  const token = sign(user._id);
  console.log(user._id);
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  res.status(statusCode).json({
    status: 'success',
    token
  });
};
exports.signup = catchAsync(async (req, res, next) => {
  const url = `${req.protocol}://${req.get('host')}/me`;
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordDateChange: req.body.passwordDateChange,

    role: req.body.role,
    resetToken: req.body.resetToken
  });
  await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('please enter a vaild email and password', 400));
  }
  const user = await User.findOne({ email }).select('+password');
  // console.log(user.correctPassword);
  // console.log(user);
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(
      new AppError('this user doesnt exist, or invaild email/password', 401)
    );
  }

  // if (user)
  createSendToken(user, 201, res);
});
exports.logout = (req, res) => {
  res.cookie('jwt', '', {
    expires: new Date(Date.now() + 5000),
    httpOnly: true
  });

  res.status(200).json({
    status: 'success'
  });
  res.cookie('jwt', 'logout', {
    expires: new Date(Date.now() + 5000),
    httpOnly: true
  });
};

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
    console.log(
      req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer ')
    );
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in. please login and try again', 401)
    );
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const freshUser = await User.findById(decoded.id);

  if (!freshUser) {
    return next(
      new AppError('The user belonging to this token no longer exist!', 401)
    );
  }

  if (await freshUser.changedPassword(decoded.iat)) {
    return next(new AppError('The password was changed!', 401));
  }

  res.locals.user = freshUser;
  req.user = freshUser;

  return next();
});
exports.isLoggedIn = catchAsync(async (req, res, next) => {
  try {
    if (req.cookies.jwt) {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      const freshUser = await User.findById(decoded.id);

      if (!freshUser) {
        return next();
      }

      if (await freshUser.changedPassword(decoded.iat)) {
        return next();
      }
      res.locals.user = freshUser;
    }
  } catch (err) {
    return next();
  }
  next();
});
exports.restrictTo = ([...roles]) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      next(new AppError('access denined!(Unauthorizaited user)', 403));
    }
    next();
  };
};
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email }).select(
    '+password'
  );

  if (!user) {
    return next(new AppError('this user does not exist!', 404));
  }

  try {
    const resetToken = user.ResetToken();
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/users/v1/passwordreset/${resetToken}`;
    await user.save({ validateBeforeSave: false });
    // await sendEmail({
    //   email: user.email,
    //   subject: `your password reset token(vaild for 10 min)`,
    //   message
    // });
    await new Email(user, resetURL).sendPasswordReset();
    res.status(200).json({
      status: 'sucess',
      message: 'token sent to email'
    });
  } catch (err) {
    user.restTokenExpires = undefined;
    user.passwordResetToken = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('there was a an error sending the email'), 500);
  }
});

exports.resetPassword = async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    restTokenExpires: { $gt: Date.now() }
  });
  if (!user) {
    return next(new AppError('Token is invaild or expired'), 400);
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.restTokenExpires = undefined;
  user.passwordResetToken = undefined;
  await user.save();
  createSendToken(user, 201, res);
};
exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError('no user found', 404));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  createSendToken(user, 201, res);
});
