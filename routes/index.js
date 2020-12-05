const express = require('express');
const router = express.Router();

const FileController = require('../controller/fileController')
const IndexController = require('../controller/indexController')
const AdminController = require('../controller/adminController')
const SchoolAdminController = require('../controller/schoolAdminController')
const StaffController = require('../controller/staffController')
const StudentController = require('../controller/studentController')
const SessionController = require('../controller/sessionController')
const BasicSetupController = require('../controller/basicSetupController')
const ClassController = require('../controller/classController')
const CbtController = require('../controller/cbtController')
const AttendanceController = require('../controller/attendanceController')
const TransactionController = require('../controller/transactionController')
const ParentController = require('../controller/parentController')
const RoleController = require('../controller/roleController')
const LessonNoteController = require("../controller/lessonNoteController")
const AssignmentController = require("../controller/assignmentContoller")
const TimetableController = require("../controller/timetableController")
const DemoController = require("../controller/demoController")

/*--------------Home and Admin Routes--------------*/
router.get('/', IndexController.getIndex)
router.get('/202007/admin', AdminController.getAdminPage)
router.post('/202007/admin', AdminController.postAdmin)
router.get('/202007/admin/new', AdminController.getNewAdmin)
router.post('/202007/admin/new', AdminController.postNewAdmin)
router.get('/202007/admin/dashboard', AdminController.getAdminDashboard)
router.get('/202007/admin/new-schools', AdminController.getNewSchool)
router.get('/202007/admin/approved-schools', AdminController.getApprovedSchool)
router.get('/202007/admin/school/:schoolID', AdminController.getSingleSchool)
router.get('/202007/admin/school/:schoolID/approve', AdminController.approveSchool)
router.get('/202007/admin/new-admin', AdminController.getAllAdmins)
router.post('/202007/admin/new-admin', AdminController.createNewAdmin)
router.get('/202007/admin/new-admin/:adminID', AdminController.revokeAdmin)
router.get('/202007/admin/logout', AdminController.getAdminLogout)

// Demo Account
router.get('/get-demo', DemoController.getDemoRegister)
router.post('/get-demo', DemoController.requestDemo)
router.get('/202007/admin/new-demo-schools', DemoController.getNewDemoSchool)
router.get('/202007/admin/approved-demo-schools', DemoController.getApprovedDemoSchool)
router.get('/202007/admin/demoschool/:demoSchoolID', DemoController.getSingleDemoSchool)
router.get('/202007/admin/demoschool/:demoSchoolID/approve', DemoController.approveDemoSchool)
router.get('/202007/admin/demoschool/:demoSchoolID/delete', DemoController.deleteDemo)

/*--------------School Admin Routes--------------*/
router.get('/school', SchoolAdminController.getSchoolLogin)
router.post('/school', SchoolAdminController.postSchoolAdminLogin)
router.get('/school/logout', SchoolAdminController.getLogout)
router.get('/school/signup', SchoolAdminController.getSchoolSignup)
router.get('/forgot-password', SchoolAdminController.getForgotPassword)
router.post('/school/signup', SchoolAdminController.postSchoolAdminSignUp)
router.get('/school/verify/:schoolID', SchoolAdminController.verifyEmail)
router.get('/school/dashboard', SchoolAdminController.getDashboard)

router.get('/school/settings', SchoolAdminController.getSettings)
router.post('/change-school-password', SchoolAdminController.changePassword)
router.get('/school/profile', SchoolAdminController.getProfile)

router.get('/school/session', SessionController.getSessionPage)
router.post('/school/session', SessionController.postSession)
router.get('/school/session/:sessionID', SessionController.getTermPage)
router.post('/school/populate-terms', SessionController.populateTerm)
router.post('/school/session/:sessionID', SessionController.postTerm)
router.get('/school/session/current/:sessionID', SessionController.makeCurrent)
router.get('/school/session/end/:sessionID', SessionController.endSession)
router.get('/school/session/:sessionID/current/:termID', SessionController.currentTerm)
router.get('/school/session/:sessionID/end/:termID', SessionController.endTerm)

router.get('/school/logo', BasicSetupController.getLogo)
router.post('/school/logo', FileController.adminUpload.fields([{name : 'logo', maxCount : 1}, {name : 'stamp', maxCount : 1}]), 
            BasicSetupController.postLogo)
router.get('/school/roles', BasicSetupController.getRoles)
router.post('/school/assign-roles', BasicSetupController.createRole)

router.get('/school/exam-settings', BasicSetupController.getExamComputations)
router.post('/school/exam-settings', BasicSetupController.postExamComputations)
router.get("/school/exam-settings/:examComputeId/delete", BasicSetupController.delExamComputations)
router.get('/school/exam-settings/use-prev', BasicSetupController.usePreviousTermExam)
router.get('/school/grade-settings', BasicSetupController.getGradeComputations)
router.post('/school/grade-settings', BasicSetupController.postGradeComputations)
router.get("/school/grade-settings/:gradeId/delete", BasicSetupController.deleteGrade)
router.get("/school/grade-settings/:gradeId/update", BasicSetupController.getUpdateGrade)

router.get('/school/subjects', ClassController.getSubjects) 
router.post('/school/subjects', ClassController.addASubject)
router.get('/school/subjects/:subjectname', ClassController.removeSubject)
router.get('/school/class', ClassController.getClasses)
router.post('/school/class', ClassController.postClasses)
router.get('/school/class/:classname', ClassController.getStudentClass)
router.get('/school/class/:classname/subjects', ClassController.subjectsClass)
router.post('/school/class/:classname/subjects', ClassController.addSubject)
router.get('/school/class/:classname/subjects/:subjectname/delete', ClassController.deleteSubject)
router.get('/school/class/:classname/delete', ClassController.deleteClass)

router.get('/school/staff', SchoolAdminController.getStaffs)
router.get('/school/staff/new', SchoolAdminController.getNewStaff)
router.post('/school/staff/confirm-head', SchoolAdminController.confirmHeadClass)
router.post('/school/staff/new', SchoolAdminController.postStaffs)
router.get('/school/staff/:staffID/complete', SchoolAdminController.getStaffComplete)
router.post('/school/staff/:staffID/complete', FileController.staffUpload.single('picture'), SchoolAdminController.completeStaffReg)
router.get('/school/staff/:staffID', SchoolAdminController.getSingleStaff)
router.post('/school/staff/:staffID',  FileController.staffUpload.single('picture'), SchoolAdminController.updateSingleStaff)
router.get('/school/staff/:staffID/assign', SchoolAdminController.getAssignPage)
router.post('/school/staff/:staffID/assign', SchoolAdminController.postAssignPage)

router.get('/school/students', SchoolAdminController.getStudentsPage)
router.get('/school/students/all', SchoolAdminController.getAllStudents)
router.get('/school/students/suspended', SchoolAdminController.getSuspendedStudents)
router.get('/school/students/revoked', SchoolAdminController.getRevokedStudents)

router.get('/school/students/graduate', SchoolAdminController.getGraduatedStudents)
router.get('/school/students/graduate/:classID', SchoolAdminController.graduateEachClass)
router.post('/school/students/graduate/:classID', SchoolAdminController.postGraduate)
router.get('/school/students/all-graduates' , SchoolAdminController.getAllGraduates)

router.get('/school/students/promote', SchoolAdminController.getPromotedStudents)
router.get('/school/students/promote/:classID', SchoolAdminController.promoteEachClass)
router.post('/school/students/promote/:classID', SchoolAdminController.postPromote)
router.post('/school/get-students', SchoolAdminController.fetchClassStudents)
router.get('/school/new-student', SchoolAdminController.getNewStudent)
router.post('/school/new-student', SchoolAdminController.postStudents)
router.get('/school/new-student/:studentID/complete', SchoolAdminController.getComplete)
router.post('/school/new-student/:studentID/complete', FileController.studentUpload.single('picture'), SchoolAdminController.completeStudentReg)
router.get('/school/new-student/:studentID', SchoolAdminController.getSingleStudent)
router.post('/school/new-student/:studentID', FileController.studentUpload.single('picture'), SchoolAdminController.updateSingleStudent)

router.get("/school/parent", SchoolAdminController.getParents)
router.get('/school/parent/new', SchoolAdminController.getNewParent)
router.post('/school/parent/new', SchoolAdminController.postParents)
router.get('/school/parent/:parentID', SchoolAdminController.getSingleParent)
router.post('/school/parent/:parentID',  FileController.parentUpload.single('picture'), SchoolAdminController.updateSingleParent)


/**---------------School Time Table----------------- */
router.get('/school/period' , TimetableController.getPeriodPage)
router.post('/school/period' , TimetableController.postPeriodPage)
router.get('/school/period/:day', TimetableController.removePeriod)
router.get('/school/day' , TimetableController.getDayPage)
router.post('/school/day' , TimetableController.postDayPage)
router.get('/school/day/:dayID/delete', TimetableController.deleteDay)
router.get('/school/timetable', TimetableController.getTimetablePage)
router.get('/school/timetable/class/:classID/class-timetable', TimetableController.getAllTimetables)
router.get('/school/timetable/class/:classID/class-timetable/set', TimetableController.getClassTimetablePage)
router.get('/school/timetable/class/:classID/class-timetable/day/:dayID/subject', TimetableController.getDaySubjectPage)
router.post('/school/timetable/class/:classID/class-timetable/day/:dayID/subject', TimetableController.postTimetablePage)
router.get('/school/timetable/class/:classID/class-timetable/day/:dayID/subject/:subjectID', TimetableController.removeDaySubject)
router.get('/school/exam-timetable', TimetableController.getExamTimetablePage)
router.get('/school/exam-day' , TimetableController.getExamDayPage)
router.post('/school/exam-day' , TimetableController.postExamDayPage)
router.get('/school/exam-day/:examDayID/delete', TimetableController.deleteExamDay)
router.get('/school/exam-timetable/class/:classID' , TimetableController.getAllExamTimetables)
router.get('/school/exam-timetable/class/:classID/set' , TimetableController.getClassExamTimetablePage)
router.get('/school/exam-timetable/class/:classID/day/:examDayID/subject' , TimetableController.getExamDaySubjectPage)
router.post('/school/exam-timetable/class/:classID/day/:examDayID/subject' , TimetableController.postExamTimetablePage)
router.get('/school/exam-timetable/class/:classID/day/:examDayID/subject/:subjectID', TimetableController.removeExamDaySubject)
router.get('/school/exam-timetable/class/:classID/show-timetable', TimetableController.getAllExamTimetables)

router.get('/staff/timetable' , TimetableController.getStaffTime)
router.get('/staff/timetable/class/:classID/show-timetable' , TimetableController.getStaffAllTimetables)
router.get('/staff/exam-timetable' , TimetableController.getStaffExamTime)
router.get('/staff/exam-timetable/class/:classID/show-timetable' , TimetableController.getStaffAllExamTimetables)
router.get('/student/timetable' , TimetableController.getStudentTimetable)
router.get('/student/timetable/class/:classID/show-timetable' , TimetableController.getStudentAllTimetables)
router.get('/student/exam-timetable' , TimetableController.getStudentExamTimetable)
router.get('/student/exam-timetable/class/:classID/show-timetable' , TimetableController.getStudentAllExamTimetables)

router.get('/school/cbt-setup', SchoolAdminController.getExams)
router.post('/school/cbt-setup', SchoolAdminController.postExams)
router.get('/school/cbt-setup/:examID/open-exam', SchoolAdminController.openExam)
router.get('/school/cbt-setup/:examCode/questions', SchoolAdminController.getExamQuestions)
router.get('/school/cbt-setup/:examCode/questions/:courseID', SchoolAdminController.viewQuestions)
router.get('/school/cbt-setup/:examCode/questions/:courseID/release', SchoolAdminController.releaseQuestion)
router.get('/school/cbt-setup/:examCode/questions/:courseID/unpublish', SchoolAdminController.unpublishSetQuestions)

router.get('/school/cbt-results', SchoolAdminController.getReports)
router.get('/school/cbt-results/:examCode', SchoolAdminController.getAllExams)
router.get('/school/cbt-results/:examCode/:className', SchoolAdminController.getFullReport)
router.get('/school/cbt-results/:examCode/:className/release', SchoolAdminController.releaseResults)
router.get('/school/cbt-results/:examCode/:className/unrelease', SchoolAdminController.unReleaseResults)

router.get('/school/broadsheet', SchoolAdminController.getBroadSheet)
router.get('/school/broadsheet/:className', SchoolAdminController.getClassBroadSheet)
router.get('/school/broadsheet/:className/third-term', SchoolAdminController.getClassBroadSheetThird)
router.get('/school/broadsheet/:className/release', SchoolAdminController.releaseReportCard)
router.get('/school/broadsheet/:className/unrelease', SchoolAdminController.unReleaseReportCard)
router.get('/school/broadsheet/:className/:cardID', SchoolAdminController.getReportCard)

router.get('/school/attendance', SchoolAdminController.getAttendanceClass)
router.get('/school/attendance/:className', SchoolAdminController.firstAttendance)
router.get('/school/attendance/:className/:week', SchoolAdminController.getEachAttendance)

router.get('/school/lesson-notes', SchoolAdminController.getNotesClass)
router.get('/school/lesson-notes/:className', SchoolAdminController.getLessonNotes)
router.get('/school/lesson-notes/:className/all', SchoolAdminController.getApprovedNotes)
router.get('/school/lesson-notes/:className/:noteID', SchoolAdminController.getSingleNote)
router.get('/school/lesson-notes/:className/:noteID/approve', SchoolAdminController.approveNote)

/**---------------Finance Routes--------------------- */
router.get('/school/fees/payment-type' , TransactionController.createPaymentType)
router.post('/school/fees/payment-type' , TransactionController.postPaymentType)
router.get('/school/fees/all-classes' , TransactionController.getAllClass)
router.get('/school/fees/all-classes/:classID' , TransactionController.getSingleClass)
router.post('/school/fees/all-classes/:classID' , TransactionController.postSingleClass)
router.get('/school/fees/all-classes/:classID/generate-invoice', TransactionController.generateInvoice)
router.post('/school/fees/all-classes/:classID/generate-invoice', TransactionController.createInvoice)
router.get('/school/fees/all-classes/:classID/bill' , TransactionController.getClassBill)
router.get('/school/fees/all-classes/:classID/:feeID/delete', TransactionController.deleteSinglePayment)
router.get('/school/fees/transactions/upload', TransactionController.getTransactionUpload)
router.post('/get-proof-details', TransactionController.getProofDetails)
router.post('/school/fees/transactions/upload', TransactionController.uploadSingleTransaction)
router.get('/school/fees/transactions/upload/proofs', TransactionController.getPaymentProof)
router.get('/school/fees/transactions/upload/proofs/record/:proofID', TransactionController.makeRecorded)
router.get('/school/fees/transactions/logs', TransactionController.getTransactionLogs)
router.get('/school/fees/transactions/logs/today', TransactionController.getTodayLogs)
router.get('/school/fees/transactions/logs/today/:startDate/:endDate', TransactionController.getDailyLogs)
router.get('/school/fees/transactions/logs/class/:className', TransactionController.getClassLogs)

router.get('/school/manage-sessions', SessionController.getManageSessions)
router.get('/school/manage-sessions/:sessionID', SessionController.getManageTerm)
router.get('/school/manage-sessions/:sessionID/:termName', SessionController.getTermActivities)
router.get('/school/manage-sessions/:sessionID/:termName/results', SessionController.getTermResultsClasses)
router.get('/school/manage-sessions/:sessionID/:termName/results/:className', SessionController.getTermResults)
router.get('/school/manage-sessions/:sessionID/:termName/results/:className/third', SessionController.getTermResultsThird)
router.get('/school/manage-sessions/:sessionID/:termName/results/:className/:cardID', SessionController.getReportCard)
router.get('/school/manage-sessions/:sessionID/:termName/results/:className/third/:cardID', SessionController.getReportCardThird)

router.get('/school/manage-sessions/:sessionID/:termName/cbt', SessionController.getCBTExams)
router.get('/school/manage-sessions/:sessionID/:termName/cbt/:examID/questions', SessionController.getCBTQuestions)
router.get('/school/manage-sessions/:sessionID/:termName/cbt/:examID/questions/:courseID', SessionController.getMainQuestion)
router.get('/school/manage-sessions/:sessionID/:termName/cbt/:examID/results', SessionController.getCBTResults)
router.get('/school/manage-sessions/:sessionID/:termName/cbt/:examID/results/:className', SessionController.getMainResults)

router.get('/school/manage-sessions/:sessionID/:termName/attendance', SessionController.getAttendanceClasses)
router.get('/school/manage-sessions/:sessionID/:termName/attendance/:className', SessionController.redirectToAttendance)
router.get('/school/manage-sessions/:sessionID/:termName/attendance/:className/:week', SessionController.getEachAttendance)

/*--------------Staff Routes--------------*/
router.get('/staff', IndexController.getStaffPage)
router.post('/staff', StaffController.postStaffLogin)
router.get('/staff/dashboard', StaffController.getDashboard)
router.get('/staff/logout', StaffController.getLogout)

router.get('/staff/upload-result', StaffController.getUploadResult)
router.get('/staff/upload-result/:subject/:className', StaffController.getUploadClass)
router.get('/staff/upload-result/:subject/:className/sheet', StaffController.getStudentsUploads)
router.post('/staff/upload-result/:subject/:className/sheet', StaffController.uploadBroadSheet)
router.get('/staff/upload-result/:subject/:className/sheet/recall-result', StaffController.recallResult)
router.get('/staff/upload-result/:subject/:className/sheet/third-term', StaffController.getStudentsThirdTerm)
router.post('/staff/upload-result/:subject/:className/sheet/third-term', StaffController.uploadBroadSheetThird)
router.post('/fetch-grade', StaffController.fetchGrade)
router.get('/staff/upload-result/:subject/:className/:studentID', StaffController.getOneStudentUpload)
router.post('/staff/upload-result/:subject/:className/:studentID', StaffController.postStudentResults)
router.get('/staff/upload-result/:subject/:className/:studentID/:examType/delete', StaffController.deleteStudentResult)
router.get('/staff/upload-result/:subject/:className/:studentID/:examType/:score', StaffController.postFirstorSecond)
router.post('/fetch-total-score', StaffController.fetchTotalExamScore)

router.get('/staff/cbt/quick-one', CbtController.getQuickPage)
router.get('/staff/cbt/quick-one/:subject/:className', CbtController.getQuickSettings)
router.post('/staff/cbt/quick-one/:subject/:className', CbtController.postQuickCBT)
router.get('/staff/cbt/quick-one/:subject/:className/:examId/delete', CbtController.deleteQuickCBT)
router.get('/staff/cbt/quick-one/:subject/:className/:examCode', CbtController.startQuickQuestions)
router.post('/staff/cbt/quick-one/:subject/:className/:examCode', CbtController.postQuestionSetup)
router.get('/staff/cbt/quick-one/:subject/:className/:examCode/replicate/:classT', CbtController.addCBTtoClass)
router.get('/staff/cbt/quick-one/:subject/:className/:examCode/questions', CbtController.getQuestions)
router.get('/staff/cbt/quick-one/:subject/:className/:examCode/questions/new', CbtController.setQuestions)
router.post('/staff/cbt/quick-one/:subject/:className/:examCode/questions/new', FileController.questionUpload.single('picture'), CbtController.postQuestions)
router.get('/staff/cbt/quick-one/:subject/:className/:examCode/questions/delete/:questionID', CbtController.deleteQuestion)
router.get('/staff/cbt/quick-one/:subject/:className/:examCode/preview', CbtController.previewQuestions)
router.get('/staff/cbt/quick-one/:subject/:className/:examCode/passwords', CbtController.generatePassView)
router.post('/staff/cbt/quick-one/:subject/:className/:examCode/passwords', CbtController.generatePassword)
router.get('/staff/cbt/quick-one/:subject/:className/:examCode/publish', CbtController.publishQuestions)
router.get('/staff/cbt/quick-one/:subject/:className/:examCode/unpublish', CbtController.unpublishQuestions)
router.get('/staff/cbt/quick-one/:subject/:className/:examCode/open-exam', CbtController.openExam)
router.get('/staff/cbt/quick-one/:subject/:className/:examCode/release-course', CbtController.releaseCourse)
router.get('/staff/cbt/quick-one/:subject/:className/:examCode/unrelease-course', CbtController.unreleaseCourse)

router.get('/staff/cbt/school', CbtController.getSchoolCBT)
router.get('/staff/cbt/school/:examCode', CbtController.getStaffCourses)
router.get('/staff/cbt/school/:examCode/:subject/:className', CbtController.startSchoolQuestions)
router.post('/staff/cbt/school/:examCode/:subject/:className', CbtController.postInstructions)
router.get('/staff/cbt/school/:examCode/:subject/:className/replicate/:classT', CbtController.addCBTtoClassSchool)
router.get('/staff/cbt/school/:examCode/:subject/:className/questions', CbtController.getSchoolQuestions)
router.get('/staff/cbt/school/:examCode/:subject/:className/questions/new', CbtController.setSchoolQuestions)
router.post('/staff/cbt/school/:examCode/:subject/:className/questions/new', FileController.questionUpload.single('picture'), CbtController.postSchoolQuestions)
router.get('/staff/cbt/school/:examCode/:subject/:className/questions/delete/:questionID', CbtController.deleteSchoolQuestion)
router.get('/staff/cbt/school/:examCode/:subject/:className/preview', CbtController.previewSchoolQuestions)
router.get('/staff/cbt/school/:examCode/:subject/:className/passwords', CbtController.generatePassView)
router.post('/staff/cbt/school/:examCode/:subject/:className/passwords', CbtController.generatePassword)
router.get('/staff/cbt/school/:examCode/:subject/:className/publish', CbtController.publishSchoolQuestions)

router.get('/staff/cbt/cbt-results', CbtController.getCBTResults)
router.get('/staff/cbt/cbt-results/:examCode', CbtController.getResultCourses)
router.get('/staff/cbt/cbt-results/:examCode/:subject/:className', CbtController.displayResults)
router.get('/staff/cbt/cbt-results/:examCode/:subject/:className/release', CbtController.releaseResult)

router.get('/staff/attendance', AttendanceController.attendanceSessionTerm)
router.get('/staff/attendance/:className', AttendanceController.attendancePage)
router.get('/staff/attendance/:className/:week', AttendanceController.getAttendance)
router.get('/staff/attendance/:className/:week/:date', AttendanceController.removeMarkedAttendance)
router.get('/staff/mark-attendance/:className', AttendanceController.getMarkAttendance) 
router.post('/staff/mark-attendance/:className', AttendanceController.postMarkAttendance)

router.get('/staff/lesson-notes', LessonNoteController.getLessonNotePage)
router.get('/staff/lesson-note/create', LessonNoteController.makeLessonNote)
router.post('/staff/lesson-note/create', LessonNoteController.postLessonNote)
router.get('/staff/lesson-note/upload', LessonNoteController.getUploadNote)
router.post('/staff/lesson-note/upload', FileController.staffUpload.single("picture"), LessonNoteController.postUploadNote)
router.get('/staff/lesson-note/all', LessonNoteController.getAllLessonNote)
router.get('/staff/lesson-note/:lessonNote', LessonNoteController.getSingleLessonNote)

router.get('/staff/assignment', AssignmentController.getAssignmentPage)
router.get('/staff/assignment/create', AssignmentController.makeAssignment)
router.post('/staff/assignment/create', AssignmentController.postAssignment)
router.get('/staff/assignment/upload', AssignmentController.uploadAssignment)
router.post('/staff/assignment/upload', FileController.staffUpload.single("picture"), AssignmentController.postUploadAssignment)
router.get('/staff/assignment/all', AssignmentController.getAllAssignment)
router.get('/staff/assignment/:assignment', AssignmentController.getSingleAssignment)

router.get('/staff/broadsheet', StaffController.getBroadSheetClass)
router.get('/staff/broadsheet/:className', StaffController.getBroadSheet)
router.get('/staff/broadsheet/:className/third-term', StaffController.getBroadSheetThird)
router.post('/staff/transfer-report/:className', StaffController.transferReport)
router.get('/staff/broadsheet/:className/:cardID', StaffController.getStudentReport)
router.post('/staff/broadsheet/:className/:cardID', StaffController.writeRemarks)

router.get('/staff/manage-sessions', SessionController.getManageSessionsStaff)
router.get('/staff/manage-sessions/:sessionID', SessionController.getManageTermStaff)
router.get('/staff/manage-sessions/:sessionID/:termName', SessionController.getTermActivitiesStaff)

/**--------------- Secretary Special Routes --------------- */
router.get('/staff/finance/payment-type' , RoleController.createPaymentType)
router.post('/staff/finance/payment-type' , RoleController.postPaymentType)
router.get("/school/fees/payment-type/:paymentTypeId/delete" , RoleController.deletePaymentType )
router.get('/staff/finance/all-classes' , RoleController.getAllClass)
router.get('/staff/finance/all-classes/:classID' , RoleController.getSingleClass)
router.post('/staff/finance/all-classes/:classID' , RoleController.postSingleClass)
router.get('/staff/finance/all-classes/:classID/replicate/:cls' , RoleController.replicatePayment)
router.get('/staff/finance/all-classes/:classID/:feeID/delete', RoleController.deleteSinglePayment)
router.get('/staff/finance/all-classes/:classID/generate-invoice', RoleController.generateInvoice)
router.post('/staff/finance/all-classes/:classID/generate-invoice', RoleController.createInvoice)
router.get('/staff/finance/all-classes/:classID/bill' , RoleController.getClassBill)
router.get('/staff/finance/transactions/upload',RoleController.getTransactionUpload)
router.post('/get-proof-details', RoleController.getProofDetails)
router.get('/staff/finance/transactions/upload/proofs', RoleController.getPaymentProof)
router.get('/staff/finance/transactions/upload/proofs/true', RoleController.getRecordedPayment)
router.get('/staff/finance/transactions/upload/proofs/:paymentProofId', RoleController.getPaymentProofUpdate)
router.post('/staff/finance/transactions/upload', RoleController.uploadSingleTransaction)
router.get('/staff/finance/transactions/upload/proofs/record/:proofID', RoleController.makeRecorded)
router.get('/staff/finance/transactions/logs', RoleController.getTransactionLogs)
router.get('/staff/finance/transactions/logs/today', RoleController.getTodayLogs)
router.get('/staff/finance/transactions/logs/today/:startDate/:endDate', RoleController.getDailyLogs)
router.get('/staff/finance/transactions/logs/class/:className', RoleController.getClassLogs)

/**-------------Principal Special Routes-------------------- */
router.get('/staff/school-staffs', RoleController.getPrincipalStaffs)
router.get('/staff/school-staffs/:staffId', RoleController.getSinglePrincipalStaff)
router.get('/staff/students', RoleController.getStudentsPage)
router.get('/staff/students/all', RoleController.getAllStudents)
router.get('/staff/new-student/:studentID', RoleController.getSingleStudent)
router.post('/staff/new-student/:studentID', FileController.studentUpload.single('picture'), RoleController.updateSingleStudent)
router.get('/staff/students/suspended', RoleController.getSuspendedStudents)
router.get('/staff/students/revoked', RoleController.getRevokedStudents)
//router.get('/staff/students/all-graduates' , RoleController.getAllGraduates)
router.get('/staff/students/graduate', RoleController.getGraduatedStudents)
router.get('/staff/students/graduate/:classID', RoleController.graduateEachClass)
router.get('/staff/principal/broadsheet', RoleController.getPrincipalBroadSheet)
router.get('/staff/principal/broadsheet/:className', RoleController.getPrincipalClassBroadSheet)
router.get('/staff/principal/broadsheet/:className/:cardID', RoleController.getPrincipalStudentReport)
router.post('/staff/principal/broadsheet/:className/:cardID', RoleController.PrincipalRemarks)

router.get('/staff/principal/transactions/logs', RoleController.getPrincipalTransactionLogs)
router.get('/staff/principal/transactions/logs/today', RoleController.getPrincipalTodayLogs)
router.get('/staff/principal/transactions/logs/today/:startDate/:endDate', RoleController.getPrincipalDailyLogs)
router.get('/staff/principal/transactions/logs/class/:className', RoleController.getPrincipalClassLogs)

router.get('/staff/principal/lesson-notes', RoleController.getPendingNotes)
router.get('/staff/principal/lesson-notes/all', RoleController.getApprovedNotes)
router.get('/staff/principal/lesson-notes/:noteID', RoleController.getSingleNote)
router.get('/staff/principal/lesson-notes/:noteID/approve', RoleController.approveNote)

/**---------------Parent Routes------------------ */
router.get('/parent', IndexController.getParentPage)
router.post('/parent', ParentController.postParentLogin)
router.get('/parent/dashboard', ParentController.getDashboard)
router.get("/parent/student", ParentController.getChildren)
router.get('/parent/student/:studentID', ParentController.getSingleChild)
router.get('/parent/student/:studentID/finance-page' , ParentController.getFinancePage)
router.get('/parent/student/:studentID/finance-page/child-fees', ParentController.getFinancialRecords)
router.get('/parent/student/:studentID/finance-page/pay-online' , ParentController.getPayOnline)
router.get('/parent/student/:studentID/finance-page/upload-payment' , ParentController.getUploadPayment)
router.post('/parent/student/:studentID/finance-page/upload-payment', FileController.questionUpload.single('picture'), ParentController.postTransactionProof)
router.get('/parent/student/:studentID/finance-page/histories', ParentController.getFinancialHistory)
router.get('/parent/student/:studentID/attendance' , ParentController.getAttendance)
router.get('/parent/student/:studentID/attendance/:week' , ParentController.getEachAttendance)
router.get('/parent/student/:studentID/report-card', ParentController.getReportCard)
router.get('/parent/student/:studentID/report-card/third-term', ParentController.getReportCardThird)
router.get('/parent/student/:studentID/assignment', ParentController.getAssignment)
router.get('/parent/student/:studentID/assignment/:assID', ParentController.getSingleAssignment)
router.get('/parent/logout', ParentController.getLogout)


/*--------------Student Routes--------------*/
router.get('/student', IndexController.getStudentPage)
router.post('/student', StudentController.postStudentLogin)
router.get('/student/dashboard', StudentController.getDashboard)
router.get('/student/cbt', StudentController.getExams)
router.get('/student/cbt/:examCode', StudentController.getExamCourses)
router.get('/student/cbt/:examCode/:courseName/verify', StudentController.getVerifyCBT)
router.post('/student/cbt/:examCode/:courseName/verify', StudentController.postVerifyCBT)
router.get('/student/cbt/:examCode/:courseName/start', StudentController.readyExam)
router.get('/student/cbt/:examCode/:courseName/count', StudentController.countToExam)
router.get('/student/cbt/:examCode/:courseName/running', StudentController.examRunning)
router.post('/student/cbt/:examCode/:courseName/running', StudentController.markExam)
router.get('/student/exam/congrats', StudentController.getCompletePage)
router.get('/student/cbt-result', StudentController.getResults)
router.get('/student/report-card', StudentController.getReportCard)

router.get('/student/lesson-notes', LessonNoteController.getLessonNotes)
router.get('/student/lesson-notes/:lessonNoteID', LessonNoteController.getSingleNote)

router.get('/student/assignment', AssignmentController.getAssignments)
router.get('/student/assignment/:assignmentId', AssignmentController.getChildAssignment)

router.get('/student/cbt-result/:resultID', StudentController.displayResults)
router.get('/student/logout', StudentController.getLogout)

router.get('/student/manage-sessions', SessionController.getManageSessionsStudent)
router.get('/student/manage-sessions/:sessionID', SessionController.getManageTermStudent)
router.get('/student/manage-sessions/:sessionID/:termName', SessionController.getTermActivitiesStudent)

module.exports = router;
