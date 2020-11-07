"use strict";

// File management Module 
var fs = require("fs");

var multer = require("multer");

var path = require("path");

var currentPath = __dirname;
var directoryName = path.dirname(currentPath); // Handling Upload for admin 

var adminStorage = multer.diskStorage({
  destination: function destination(req, file, cb) {
    cb(null, path.join(directoryName, '/public/uploads/profile/'));
  },
  filename: function filename(req, file, cb) {
    var fileName = "".concat(req.session.schoolCode, "-").concat(file.originalname);
    cb(null, fileName);
  }
});
var staffStorage = multer.diskStorage({
  destination: function destination(req, file, cb) {
    cb(null, path.join(directoryName, '/public/uploads/profile/'));
  },
  filename: function filename(req, file, cb) {
    var fileName = req.params.staffID + "-" + file.originalname;
    cb(null, fileName);
  }
});
var studentStorage = multer.diskStorage({
  destination: function destination(req, file, cb) {
    cb(null, path.join(directoryName, '/public/uploads/profile/'));
  },
  filename: function filename(req, file, cb) {
    var date = new Date().getDate();
    var fileName = req.params.studentID + "-" + file.originalname;
    cb(null, fileName);
  }
});
var parentStorage = multer.diskStorage({
  destination: function destination(req, file, cb) {
    cb(null, path.join(directoryName, '/public/uploads/profile/'));
  },
  filename: function filename(req, file, cb) {
    var date = new Date().getDate();
    var fileName = req.params.studentID + "-" + file.originalname;
    cb(null, fileName);
  }
});
var questionStorage = multer.diskStorage({
  destination: function destination(req, file, cb) {
    cb(null, path.join(directoryName, '/public/uploads/profile/'));
  },
  filename: function filename(req, file, cb) {
    var date = new Date().getDate();
    var fileName = Date.now() + "-" + file.originalname;
    cb(null, fileName);
  }
});
exports.adminUpload = multer({
  storage: adminStorage
});
exports.staffUpload = multer({
  storage: staffStorage
});
exports.studentUpload = multer({
  storage: studentStorage
});
exports.parentUpload = multer({
  storage: parentStorage
});
exports.questionUpload = multer({
  storage: questionStorage
});