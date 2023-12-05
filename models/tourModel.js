const mongoose = require('mongoose');
const slugify = require('slugify');
const validators = require('validator');

const User = require('../userModel');

const tourSchema = new mongoose.Schema(
  {
    startDates: [Date],
    slug: String,
    name: {
      type: String,
      required: [true, 'a tour must have a name'],
      unique: true,
      maxlength: [40, 'a tour name must be less than 40 letters'],
      minlength: [10, ' a tour must be more than 10 letters'],
      trim: true
      // validate: {
      //   validator: validators.isAlpha,
      //   message: 'invaild name'
      // }
    },
    duration: {
      type: Number,
      required: [true, 'a tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'a tour must have a group size']
    },
    difficulty: {
      type: String,
      required: [true, 'a tour must have a diffculty'],
      enum: {
        values: ['easy', 'difficult', 'medium'],
        message: 'invaild difficulty(try:easy/difficult/medium'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'ratingAverage must be greater or equal to 1.0'],
      max: [5, 'ratngsAverage is invaild'],
      set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },

    price: {
      type: Number,
      required: [true, 'a tour must have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          //the This keyword only points at the doc when creating a new Tour only IMPORTANT!!//
          return val < this.price;
        },
        message: 'priceDiscount({VALUE}) must be greater than price'
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary']
    },
    discription: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'a tour must have a imageCover']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now()
    },

    secretTour: {
      type: Boolean,
      default: false
    },
    startLocation: {
      //GeoJSON

      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],

    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ]
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

tourSchema.pre('save', function(next) {
  //works when using .save(), .create()
  try {
    this.slug = slugify(this.name, { lower: true });
    console.log('seeeesha', this);
    next();
  } catch (err) {
    console.log(err);
  }
});
// tourSchema.pre('save', async function(next) {
//   const guidesPromises = this.guides.map(async el => await User.findById(el));

//   this.guides = await Promise.all(guidesPromises);
// });
tourSchema.index({ startLocation: '2dsphere' });
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordDateChange'
  });
  next();
});
tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });
  this.start = new Date();
  next();
});
tourSchema.post(/^find/, function(docs, next) {
  console.log(`${new Date() - this.start}MS`);
  next();
});
// tourSchema.pre('aggregate', function(next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
