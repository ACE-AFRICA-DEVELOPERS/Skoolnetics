"use strict";

var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var ParentSchema = new Schema({
  school: {
    type: Schema.Types.ObjectId,
    ref: 'SchoolAdmin'
  },
  parentID: {
    type: String
  },
  name: {
    type: String
  },
  password: {
    type: String
  },
  email: {
    type: String
  },
  number: {
    type: String
  },
  gender: {
    type: String
  },
  role: {
    type: String
  },
  ward: [{
    type: Schema.Types.ObjectId,
    ref: 'Student'
  }],
  profilePhoto: {
    type: String
  }
});
ParentSchema.virtual('parent').get(function () {
  return "".concat(this._id);
});
module.exports = mongoose.model("Parent", ParentSchema);