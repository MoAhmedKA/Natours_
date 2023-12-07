const catchAsync = require(`.././catchAsync`);
const factory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');
const Tour = require(`../models/tourModel`);
const AppError = require('../appError');

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image. please upload only images', 400), false);
  }
};
const multerStorage = multer.memoryStorage();
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.updatedTourImage = upload.fields([
  { name: 'images', maxCount: 3 },
  { name: 'imageCover', maxCount: 1 }
]);
exports.resizeTourImage = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover} `);

  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (el, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(el.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename} `);

      req.body.images.push(filename);
    })
  );

  // (req.body.images);
  next();
});

// const AppError = require('../appError');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingAverage,price';

  next();
};

// class APIFeatures {
//   constructor(query, queryStr) {
//     this.queryStr = queryStr
//     this.query = query
//   }
//   filter() {
//     const queryObj = { ...req.query };
//     const excludedfields = ['page', 'sort', 'limit', 'fields'];

//     excludedfields.forEach(el => delete queryObj[el]);

//     /////////////////////////////////////
//     let queryStr = JSON.stringify(queryObj);

//     queryStr = queryStr.replace(
//       /\b(gte|gt|lte|lt)\b/g,
//       match => `$${match}`
//     );
//     this.query=this.query.find(queryStr)
//   return this
//   }
// }

exports.getAllTours = factory.getAll(Tour);

// (req.body);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const data = await Tour.findByIdAndDelete(req.params.id);
//   if (!data) {
//     return next(new AppError(`no tour found at  ${req.originalUrl} `, 404));
//   }
//   res.status(204).json({
//     status: 'success',
//     data
//   });
// });

//(Tour);
exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: '$name',
        totalTours: { $sum: 1 },
        totalRatings: { $sum: '$ratingsQaunity' },
        avgrating: { $avg: '$ratingsAverage' },
        avgprice: { $avg: '$price' },
        minprice: { $min: '$price' },
        maxprice: { $max: '$price' }
      }
    },

    {
      $sort: { avgprice: 1 }
    }
    // {
    //   $match: { _id: { $ne: 'The Forest Hiker' } }
    // }
  ]);
  res.status(200).json({
    status: 'success',
    stats
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res) => {
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        plansThisMonth: { $sum: 1 },
        names: {
          $push: '$name'
        }
      }
    },
    {
      $addFields: { currentMonth: '$_id' }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: { plansThisMonth: -1 }
    }
  ]);

  res.status(200).json({
    stats: 'success',
    data: {
      plan
    }
  });
});

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  if (!lat || !lng) {
    return next(AppError('please provide latitutr and longitude', 400));
  }
  const tours = await Tour.find({
    startLocation: {
      $geoWithin: { $centerSphere: [[lng * 1, lat * 1], radius] }
    }
  });
  res.status(200).json({
    status: 'success',
    data: {
      data: tours
    }
  });
});
//'/distances/:latlng/unit/:unit'
exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const Multiplier = unit === 'mi' ? 0.0000621371 : 0.001;
  // const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  if (!lat || !lng) {
    return next(AppError('please provide latitutr and longitude', 400));
  }

  const distances = await Tour.aggregate([
    //in the geospatial aggregetion pipeline the only pipe line stage that exists is $geoNear ps: has to be the first stage
    {
      $geoNear: {
        near: {
          type: 'point',
          coordinates: [lng * 1, lat * 1]
        },
        distanceField: 'distance',
        distanceMultiplier: Multiplier
      }
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      data: distances
    }
  });
});
