"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var bcrypt = require('bcryptjs');

var SchoolAdmin = require('../model/schoolAdmin');

var Staff = require("../model/staff");

var Exam = require('../model/exam');

var Course = require('../model/course');

var Question = require('../model/question');

var Result = require('../model/result');

var Student = require('../model/student');

var Parent = require("../model/parent");

var Attendance = require('../model/attendance');

var ClassSchool = require('../model/classchool');

var Session = require('../model/session');

var Term = require('../model/term');

var LessonNote = require('../model/lessonNote');

var Subject = require("../model/subject");

var Assignment = require("../model/assignment");

var Payment = require('../model/payment');

var PaymentType = require('../model/paymentType');

var FileHandler = require('./file');

var App = function App() {
  _classCallCheck(this, App);
};