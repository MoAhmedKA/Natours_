const mongoose = require('mongoose');
const validators = require('validator');
const bcypt = require('bcryptjs');
const crypto = require('crypto');

const userShecma = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'name is required!'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'email is required!'],
    unique: [true, 'this email is already signed in !'],
    validate: [validators.isEmail, 'Invaild email ! ']
  },
  photo: {
    type: String,
    default: 'default.jpg'
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'guide', 'lead-guide'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'password is required!'],
    trim: true,
    minlength: 8,
    select: false
  },

  passwordConfirm: {
    type: String,
    required: [true, 'passwordConfirm is required!'],
    trim: true,
    validate: {
      validator: function(pass) {
        return pass === this.password;
      },
      message: 'no match'
    },
    minlength: 8
  },
  passwordDateChange: Date,
  passwordResetToken: String,
  restTokenExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});
userShecma.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  next();
});
userShecma.pre('save', async function(next) {
  this.password = await bcypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});
userShecma.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordDateChange = Date.now() - 1000;
  next();
});
userShecma.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcypt.compare(candidatePassword, userPassword);
};
userShecma.methods.changedPassword = async function(JWTTimeStamp) {
  if (this.passwordDateChange) {
    const passwordChangeTimeStamp = parseInt(
      this.passwordDateChange.getTime() / 1000,
      10
    );

    return JWTTimeStamp < passwordChangeTimeStamp;
  }
  return false;
};
userShecma.methods.ResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.restTokenExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};
const User = mongoose.model('User', userShecma);
module.exports = User;
