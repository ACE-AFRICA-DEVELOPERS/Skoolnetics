"use strict";

var express = require('express');

var router = express.Router();

var FileController = require('../controller/fileController');

var IndexController = require('../controller/indexController');

var AdminController = require('../controller/adminController');

var SchoolAdminController = require('../controller/schoolAdminController');

var StaffController = require('../controller/staffController');

var StudentController = require('../controller/studentController');

var SessionController = require('../controller/sessionController');

var BasicSetupController = require('../controller/basicSetupController');

var ClassController = require('../controller/classController');

var CbtController = require('../controller/cbtController');

var AttendanceController = require('../controller/attendanceController');

var TransactionController = require('../controller/transactionController');

var ParentController = require('../controller/parentController');

var RoleController = require('../controller/roleController');

var LessonNoteController = require("../controller/lessonNoteController");

var AssignmentController = require("../controller/assignmentContoller");

var TimetableController = require("../controller/timetableController");
/*--------------Home and Admin Routes--------------*/


router.get('/', IndexController.getIndex);
router.get('/202007/admin', AdminController.getAdminPage);
router.post('/202007/admin', AdminController.postAdmin);
router.get('/202007/admin/new', AdminController.getNewAdmin);
router.post('/202007/admin/new', AdminController.postNewAdmin);
router.get('/admin/dashboard', AdminController.getAdminDashboard);
router.get('/admin/new-schools', AdminController.getNewSchool);
router.get('/admin/approved-schools', AdminController.getApprovedSchool);
router.get('/admin/school/:schoolID', AdminController.getSingleSchool);
router.get('/admin/school/:schoolID/approve', AdminController.approveSchool);
router.get('/admin/logout', AdminController.getAdminLogout);
/*--------------School Admin Routes--------------*/

router.get('/school', SchoolAdminController.getSchoolLogin);
router.post('/school', SchoolAdminController.postSchoolAdminLogin);
router.get('/school/logout', SchoolAdminController.getLogout);
router.get('/school/signup', SchoolAdminController.getSchoolSignup);
router.get('/forgot-password', SchoolAdminController.getForgotPassword);
router.post('/school/signup', SchoolAdminController.postSchoolAdminSignUp);
router.get('/school/verify/:schoolID', SchoolAdminController.verifyEmail);
router.get('/school/dashboard', SchoolAdminController.getDashboard);
router.get('/school/session', SessionController.getSessionPage);
router.post('/school/session', SessionController.postSession);
router.get('/school/session/:sessionID', SessionController.getTermPage);
router.post('/school/populate-terms', SessionController.populateTerm);
router.post('/school/session/:sessionID', SessionController.postTerm);
router.get('/school/session/current/:sessionID', SessionController.makeCurrent);
router.get('/school/session/:sessionID/current/:termID', SessionController.currentTerm);
router.get('/school/logo', BasicSetupController.getLogo);
router.post('/school/logo', FileController.adminUpload.fields([{
  name: 'logo',
  maxCount: 1
}, {
  name: 'stamp',
  maxCount: 1
}]), BasicSetupController.postLogo);
router.get('/school/roles', BasicSetupController.getRoles);
router.post('/school/assign-roles', BasicSetupController.createRole);
router.get('/school/exam-settings', BasicSetupController.getExamComputations);
router.post('/school/exam-settings', BasicSetupController.postExamComputations);
router.get('/school/grade-settings', BasicSetupController.getGradeComputations);
router.post('/school/grade-settings', BasicSetupController.postGradeComputations);
router.get('/school/subjects', ClassController.getSubjects);
router.post('/school/subjects', ClassController.addASubject);
router.get('/school/subjects/:subjectname', ClassController.removeSubject);
router.get('/school/class', ClassController.getClasses);
router.post('/school/class', ClassController.postClasses);
router.get('/school/class/:classname', ClassController.getStudentClass);
router.get('/school/class/:classname/subjects', ClassController.subjectsClass);
router.post('/school/class/:classname/subjects', ClassController.addSubject);
router.get('/school/class/:classname/subjects/:subjectname/delete', ClassController.deleteSubject);
router.get('/school/class/:classname/delete', ClassController.deleteClass);
router.get('/school/staff', SchoolAdminController.getStaffs);
router.get('/school/staff/new', SchoolAdminController.getNewStaff);
router.post('/school/staff/confirm-head', SchoolAdminController.confirmHeadClass);
router.post('/school/staff/new', SchoolAdminController.postStaffs);
router.get('/school/staff/:staffID/complete', SchoolAdminController.getStaffComplete);
router.post('/school/staff/:staffID/complete', FileController.staffUpload.single('picture'), SchoolAdminController.completeStaffReg);
router.get('/school/staff/:staffID', SchoolAdminController.getSingleStaff);
router.post('/school/staff/:staffID', FileController.staffUpload.single('picture'), SchoolAdminController.updateSingleStaff);
router.get('/school/staff/:staffID/assign', SchoolAdminController.getAssignPage);
router.post('/school/staff/:staffID/assign', SchoolAdminController.postAssignPage);
router.get('/school/students', SchoolAdminController.getStudentsPage);
router.get('/school/new-student', SchoolAdminController.getNewStudent);
router.post('/school/new-student', SchoolAdminController.postStudents);
router.get('/school/new-student/:studentID/complete', SchoolAdminController.getComplete);
router.post('/school/new-student/:studentID/complete', FileController.studentUpload.single('picture'), SchoolAdminController.completeStudentReg);
router.get('/school/new-student/:studentID', SchoolAdminController.getSingleStudent);
router.post('/school/new-student/:studentID', FileController.studentUpload.single('picture'), SchoolAdminController.updateSingleStudent);
router.get("/school/parent", SchoolAdminController.getParents);
router.get('/school/parent/new', SchoolAdminController.getNewParent);
router.post('/school/parent/new', SchoolAdminController.postParents);
router.get('/school/parent/:parentID', SchoolAdminController.getSingleParent);
router.post('/school/parent/:parentID', FileController.parentUpload.single('picture'), SchoolAdminController.updateSingleParent);
/**---------------School Time Table----------------- */

router.get('/school/period', TimetableController.getPeriodPage);
router.get('/school/cbt-setup', SchoolAdminController.getExams);
router.post('/school/cbt-setup', SchoolAdminController.postExams);
router.get('/school/cbt-setup/:examID/open-exam', SchoolAdminController.openExam);
router.get('/school/cbt-setup/:examCode/questions', SchoolAdminController.getExamQuestions);
router.get('/school/cbt-setup/:examCode/questions/:courseID', SchoolAdminController.viewQuestions);
router.get('/school/cbt-setup/:examCode/questions/:courseID/release', SchoolAdminController.releaseQuestion);
router.get('/school/cbt-results', SchoolAdminController.getReports);
router.get('/school/cbt-results/:examCode', SchoolAdminController.getAllExams);
router.get('/school/cbt-results/:examCode/:className', SchoolAdminController.getFullReport);
router.get('/school/cbt-results/:examCode/:className/release', SchoolAdminController.releaseResults);
router.get('/school/cbt-results/:examCode/:className/unrelease', SchoolAdminController.unReleaseResults);
router.get('/school/broadsheet', SchoolAdminController.getBroadSheet);
router.get('/school/broadsheet/:className', SchoolAdminController.getClassBroadSheet);
router.get('/school/attendance', SchoolAdminController.getAttendanceClass);
router.get('/school/attendance/:className', SchoolAdminController.firstAttendance);
router.get('/school/attendance/:className/:week', SchoolAdminController.getEachAttendance);
router.get('/school/lesson-notes', SchoolAdminController.getNotesClass);
router.get('/school/lesson-notes/:className', SchoolAdminController.getLessonNotes);
router.get('/school/lesson-notes/:className/all', SchoolAdminController.getApprovedNotes);
router.get('/school/lesson-notes/:className/:noteID', SchoolAdminController.getSingleNote);
router.get('/school/lesson-notes/:className/:noteID/approve', SchoolAdminController.approveNote);
/*--------------Staff Routes--------------*/

router.get('/staff', IndexController.getStaffPage);
router.post('/staff', StaffController.postStaffLogin);
router.get('/staff/dashboard', StaffController.getDashboard);
router.get('/staff/logout', StaffController.getLogout);
router.get('/staff/upload-result', StaffController.getUploadResult);
router.get('/staff/upload-result/:subject/:className', StaffController.getUploadClass);
router.get('/staff/upload-result/:subject/:className/sheet', StaffController.getStudentsUploads);
router.post('/staff/upload-result/:subject/:className/sheet', StaffController.uploadBroadSheet);
router.get('/staff/upload-result/:subject/:className/:studentID', StaffController.getOneStudentUpload);
router.post('/staff/upload-result/:subject/:className/:studentID', StaffController.postStudentResults);
router.post('/fetch-total-score', StaffController.fetchTotalExamScore);
router.get('/staff/cbt/quick-one', CbtController.getQuickPage);
router.get('/staff/cbt/quick-one/:subject/:className', CbtController.getQuickSettings);
router.post('/staff/cbt/quick-one/:subject/:className', CbtController.postQuickCBT);
router.get('/staff/cbt/quick-one/:subject/:className/:examCode', CbtController.startQuickQuestions);
router.post('/staff/cbt/quick-one/:subject/:className/:examCode', CbtController.postQuestionSetup);
router.get('/staff/cbt/quick-one/:subject/:className/:examCode/questions', CbtController.getQuestions);
router.get('/staff/cbt/quick-one/:subject/:className/:examCode/questions/new', CbtController.setQuestions);
router.post('/staff/cbt/quick-one/:subject/:className/:examCode/questions/new', FileController.questionUpload.single('picture'), CbtController.postQuestions);
router.get('/staff/cbt/quick-one/:subject/:className/:examCode/questions/delete/:questionID', CbtController.deleteQuestion);
router.get('/staff/cbt/quick-one/:subject/:className/:examCode/preview', CbtController.previewQuestions);
router.get('/staff/cbt/quick-one/:subject/:className/:examCode/passwords', CbtController.generatePassView);
router.post('/staff/cbt/quick-one/:subject/:className/:examCode/passwords', CbtController.generatePassword);
router.get('/staff/cbt/quick-one/:subject/:className/:examCode/publish', CbtController.publishQuestions);
router.get('/staff/cbt/quick-one/:subject/:className/:examCode/open-exam', CbtController.openExam);
router.get('/staff/cbt/school', CbtController.getSchoolCBT);
router.get('/staff/cbt/school/:examCode', CbtController.getStaffCourses);
router.get('/staff/cbt/school/:examCode/:subject/:className', CbtController.startSchoolQuestions);
router.post('/staff/cbt/school/:examCode/:subject/:className', CbtController.postInstructions);
router.get('/staff/cbt/school/:examCode/:subject/:className/questions', CbtController.getSchoolQuestions);
router.get('/staff/cbt/school/:examCode/:subject/:className/questions/new', CbtController.setSchoolQuestions);
router.post('/staff/cbt/school/:examCode/:subject/:className/questions/new', FileController.questionUpload.single('picture'), CbtController.postSchoolQuestions);
router.get('/staff/cbt/school/:examCode/:subject/:className/questions/delete/:questionID', CbtController.deleteSchoolQuestion);
router.get('/staff/cbt/school/:examCode/:subject/:className/preview', CbtController.previewSchoolQuestions);
router.get('/staff/cbt/school/:examCode/:subject/:className/passwords', CbtController.generatePassView);
router.post('/staff/cbt/school/:examCode/:subject/:className/passwords', CbtController.generatePassword);
router.get('/staff/cbt/school/:examCode/:subject/:className/publish', CbtController.publishSchoolQuestions);
router.get('/staff/cbt/cbt-results', CbtController.getCBTResults);
router.get('/staff/cbt/cbt-results/:examCode', CbtController.getResultCourses);
router.get('/staff/cbt/cbt-results/:examCode/:subject/:className', CbtController.displayResults);
router.get('/staff/cbt/cbt-results/:examCode/:subject/:className/release', CbtController.releaseResult);
router.get('/staff/attendance', AttendanceController.attendanceSessionTerm);
router.get('/staff/attendance/:className', AttendanceController.attendancePage);
router.get('/staff/attendance/:className/:week', AttendanceController.getAttendance);
router.get('/staff/mark-attendance/:className', AttendanceController.getMarkAttendance);
router.post('/staff/mark-attendance/:className', AttendanceController.postMarkAttendance);
router.get('/staff/lesson-notes', LessonNoteController.getLessonNotePage);
router.get('/staff/lesson-note/create', LessonNoteController.makeLessonNote);
router.post('/staff/lesson-note/create', LessonNoteController.postLessonNote);
router.get('/staff/lesson-note/upload', LessonNoteController.getUploadNote);
router.post('/staff/lesson-note/upload', FileController.staffUpload.single("picture"), LessonNoteController.postUploadNote);
router.get('/staff/lesson-note/all', LessonNoteController.getAllLessonNote);
router.get('/staff/lesson-note/:lessonNote', LessonNoteController.getSingleLessonNote);
router.get('/staff/assignment', AssignmentController.getAssignmentPage);
router.get('/staff/assignment/create', AssignmentController.makeAssignment);
router.post('/staff/assignment/create', AssignmentController.postAssignment);
router.get('/staff/assignment/upload', AssignmentController.uploadAssignment);
router.post('/staff/assignment/upload', FileController.staffUpload.single("picture"), AssignmentController.postUploadAssignment);
router.get('/staff/assignment/all', AssignmentController.getAllAssignment);
router.get('/staff/assignment/:assignment', AssignmentController.getSingleAssignment);
router.get('/staff/broadsheet', StaffController.getBroadSheetClass);
router.get('/staff/broadsheet/:className', StaffController.getBroadSheet);
router.post('/staff/transfer-report/:className', StaffController.transferReport);
router.get('/staff/broadsheet/:className/:cardID', StaffController.getStudentReport);
router.post('/staff/broadsheet/:className/:cardID', StaffController.writeRemarks);
/**---------------Finance Routes--------------------- */

router.get('/school/fees/payment-type', TransactionController.createPaymentType);
router.post('/school/fees/payment-type', TransactionController.postPaymentType);
router.get('/school/fees/all-classes', TransactionController.getAllClass);
router.get('/school/fees/all-classes/:classID', TransactionController.getSingleClass);
router.post('/school/fees/all-classes/:classID', TransactionController.postSingleClass);
router.get('/school/fees/all-classes/:classID/:feeID/delete', TransactionController.deleteSinglePayment);
router.get('/school/fees/payment-invoice', TransactionController.getInvoicePage);
router.get('/school/fees/payment-invoice/:classID', TransactionController.getSingleClassInvoice);
/**---------------Parent Routes------------------ */

router.get('/parent', IndexController.getParentPage);
router.post('/parent', ParentController.postParentLogin);
router.get('/parent/dashboard', ParentController.getDashboard);
router.get("/parent/student", ParentController.getChildren);
router.get('/parent/student/:studentID', ParentController.getSingleChild);
router.get('/parent/student/:studentID/finance-page', ParentController.getFinancePage);
router.get('/parent/student/:studentID/finance-page/child-fees', ParentController.getFinancialRecords);
router.get('/parent/student/:studentID/finance-page/pay-online', ParentController.getPayOnline);
/*--------------Student Routes--------------*/

router.get('/student', IndexController.getStudentPage);
router.post('/student', StudentController.postStudentLogin);
router.get('/student/dashboard', StudentController.getDashboard);
router.get('/student/cbt', StudentController.getExams);
router.get('/student/cbt/:examCode', StudentController.getExamCourses);
router.get('/student/cbt/:examCode/:courseName/verify', StudentController.getVerifyCBT);
router.post('/student/cbt/:examCode/:courseName/verify', StudentController.postVerifyCBT);
router.get('/student/cbt/:examCode/:courseName/start', StudentController.readyExam);
router.get('/student/cbt/:examCode/:courseName/running', StudentController.examRunning);
router.post('/student/cbt/:examCode/:courseName/running', StudentController.markExam);
router.get('/student/exam/congrats', StudentController.getCompletePage);
router.get('/student/cbt-result', StudentController.getResults);
router.get('/student/lesson-notes', LessonNoteController.getLessonNotes);
router.get('/student/lesson-notes/:lessonNoteID', LessonNoteController.getSingleNote);
router.get('/student/assignment', AssignmentController.getAssignments);
router.get('/student/assignment/:assignmentId', AssignmentController.getChildAssignment);
router.get('/student/cbt-result/:resultID', StudentController.displayResults);
router.get('/student/logout', StudentController.getLogout);
module.exports = router;