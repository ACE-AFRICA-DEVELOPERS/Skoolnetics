"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SchoolAdmin = require('../model/schoolAdmin');

var Period = require('../model/period');

var ClassTimetable = require('../model/classTimetable');

var ClassSchool = require('../model/classchool');

var Session = require('../model/session');

var Subject = require('../model/subject');

var Term = require('../model/term');

var Day = require('../model/day');

var ExamTimetable = require('../model/examTimetable');

var ExamDay = require('../model/examDay');

var Staff = require('../model/staff');

var Student = require('../model/student');

var App = function App() {
  _classCallCheck(this, App);
};

var returnApp = new App();
module.exports = returnApp;