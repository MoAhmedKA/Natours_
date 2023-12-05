const { model } = require('mongoose');
const AppError = require('../appError');
const catchAsync = require('../catchAsync');

exports.deleteOne = model =>
  catchAsync(async function(req, res, next) {
    const doc = await model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError(`no document    found with that ID `, 404));
    }
    res.status(204).json({
      status: 'success',
      data: null
    });
  });
exports.createOne = model =>
  catchAsync(async (req, res, next) => {
    const doc = await model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

exports.updateOne = model =>
  catchAsync(async (req, res, next) => {
    const doc = await model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!doc) {
      return next(new AppError(`no document found with that ID `, 404));
    }
    res.status(200).json({
      status: 'success',

      data: doc
    });
  });
exports.getOne = (model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    // const id = req.params.id * 1;

    let query = model.findById(req.params.id);

    if (populateOptions) query = query.populate(populateOptions);
    const doc = await query;
    if (!doc) {
      return next(new AppError(`no document found with that ID `, 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });
exports.getAll = model =>
  catchAsync(async (req, res, next) => {
    // const mongoose=require('mongoose')
    const queryObj = { ...req.query };
    const excludedfields = ['page', 'sort', 'limit', 'fields'];

    excludedfields.forEach(el => delete queryObj[el]);

    /////////////////////////////////////
    let queryStr = JSON.stringify(queryObj);

    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    //////////////////////
    let query = model.find(JSON.parse(queryStr));

    if (req.query.sort) {
      console.log(req.query);
      console.log(queryObj);
      const sortBy = req.query.sort.split(',').join(' ');

      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    if (req.query.page) {
      const page = req.query.page * 1 || 1;
      const limit = req.query.limit * 1 || 3;
      const skip = (page - 1) * limit;

      query = query.skip(skip).limit(limit);
    }

    const doc = await query;
    // const features=new APIFeatures(Tour.find(),req.query).filter()
    //     const doc = await features.query  //Tour.find().filter()

    // console.log(doc);
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        doc
      }
    });
  });
// exports.deleteTour = catchAsync(async (req, res, next) => {
//     const data = await Tour.findByIdAndDelete(req.params.id);
//     if (!data) {
//       return next(new AppError(`no tour found at  ${req.originalUrl} `, 404));
//     }
//     res.status(204).json({
//       status: 'success',
//       data
//     });
//   });
//-------------------------------------------------------------------------
//exports.createTour = catchAsync(async (req, res, next) => {
//     const newTour = await Tour.create(req.body);
//     res.status(201).json({
//       status: 'success',
//       data: {
//         tour: newTour
//       }
//     });
//   });
