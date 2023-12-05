// const mongoose=require('mongoose')
// const queryObj = { ...req.query };
// const excludedfields = ['page', 'sort', 'limit', 'fields'];

// excludedfields.forEach(el => delete queryObj[el]);

// /////////////////////////////////////
// let queryStr = JSON.stringify(queryObj);
// const check=/\b(\lt|lte|gte|gt)\b/ig
// if (check.test(queryStr)) {

// queryStr = queryStr.replace(
//   /\b(gte|gt|lte|lt)\b/g,
//   match => `$${match}`
// );
// console.log(req.query)
// console.log(queryObj)
// console.log(queryStr)
// }
// //////////////////////
// let query = Tour.find(JSON.parse(queryStr));

//  if (req.query.sort) {
//    const sortBy = queryStr.sort.split(',').join(' ');
//    query = query.sort(sortBy);

//  } else {
//    query = query.sort('-createdAt');
//  }

//  if (req.query.fields) {
//    const fields = req.query.fields.split(',').join(' ');
//    query = query.select(fields);
//  } else {
//    query = query.select('-__v');
//  }

//  if (req.query.page) {
//     const page = queryStr.page * 1 || 1;
//  const limit =queryStr.limit * 1 || 100;
//  const skip = (page - 1) * limit;

//  query = query.skip(skip).limit(limit);

// }
//  module.exports=query
