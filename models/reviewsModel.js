const mongoose = require('mongoose');

const Tour = require('./tourModel');
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'a review cant be empty']
    },
    rating: {
      type: Number,
      max: 5,
      min: 1,

      required: [true, 'a review must have a  ratting']
    },
    createdAt: {
      type: Date,
      default: Date.now()
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, ' review must belong to a user']
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [(true, 'review must belong to a tour')]
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);
reviewSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: ' photo name'
  });
  next();
});
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });
reviewSchema.statics.calcAverageRating = async function(tourID) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourID }
    },
    {
      $group: {
        _id: '$tour',

        nRating: { $sum: 1 },
        avgratings: { $avg: '$rating' }
      }
    }
  ]);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourID, {
      ratingsAverage: stats[0].avgratings,
      ratingsQuantity: stats[0].nRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourID, {
      ratingsAverage: 4.5,
      ratingsQuantity: 0
    });
  }
};

reviewSchema.post('save', function() {
  this.constructor.calcAverageRating(this.tour);
});
// reviewSchema.pre(/findOneAnd/, async function(next) {
//   this.r = await this.findOne();
//   next();
// });
reviewSchema.post(/findOneAnd/, async function(doc) {
  doc.constructor.calcAverageRating(doc.tour);
});
const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
