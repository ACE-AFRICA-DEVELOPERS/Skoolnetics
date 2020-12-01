const bcrypt = require("bcryptjs")

const Student = require('../model/student')
const Exam = require('../model/exam')
const Course = require('../model/course')
const Question = require('../model/question')
const Result = require('../model/result')
const ClassSchool = require('../model/classchool')
const SchoolAdmin = require('../model/schoolAdmin')
const Session = require('../model/session')
const Term = require('../model/term')
const ExamPass = require('../model/generate-pass')
const Broadsheet = require('../model/broadsheet')

class App {

    postStudentLogin = async (req , res , next) => {
        try { 
            const {regNumber, password} = req.body
            let student = await Student.findOne({studentID : regNumber})
            console.log(student)
            if (student){
                console.log(student)
                let validUser = await bcrypt.compare(password , student.password) 
                console.log(validUser) 
                if (validUser) {
                    req.session.regNumber = student.studentID
                    res.redirect(303 , '/student/dashboard')
                }else {
                    res.render('student-page' , { error : 'Invalid Login details'})
                }
            }else {
                res.render('student-page' , { error : 'Invalid Login details'})
            }
        }catch(errors) {
            res.render('student-page' , {error : errors})
        }
    }

    getDashboard = async (req , res , next) => {
        try{ 
            if(req.session.regNumber){
                const student = await Student.findOne({studentID : req.session.regNumber})
                const school = await SchoolAdmin.findOne({_id : student.school})
                const className = await ClassSchool.findOne({_id : student.className})
                const session = await Session.findOne({school : school._id, current : true})
                const term = await Term.findOne({session: session._id, current: true})
                let sessionS, termS
                if(session){
                    sessionS = session.name
                }else{
                    sessionS = "Session not set."
                }
                if(term){
                    termS = term.name
                }else{
                    termS = "Term not set."
                }
                if(student){
                    res.render('student-dashboard' , { title  : "Dashboard", 
                    student : student, code : school, className : className,
                    dash_active : "active", schoolT: school, termS: termS, sessS: sessionS })
                }else{
                    throw{
                        message : "No Student"
                    }
                }
            }else{
                res.redirect(303, '/student')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    getExams = async (req, res, next) => {
        try{ 
            if(req.session.regNumber){
                const student = await Student.findOne({studentID : req.session.regNumber})
                const school = await SchoolAdmin.findOne({_id : student.school})
                const className = await ClassSchool.findOne({_id : student.className})
                const session = await Session.findOne({school: school._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const exam = await Exam.find({school : student.school, available: true,
                session: session._id, term: term._id})
            
                res.render('student-exam', {exams : exam, student : student,
                code : school, className : className, title: 'CBT',
                exam_active : "active", sessS: session.name, termS: term.name})
                
            }else{
                res.redirect(303, '/student')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    getExamCourses = async(req, res, next) => {
        try{ 
            if(req.session.regNumber){
                const student = await Student.findOne({studentID : req.session.regNumber})
                const school = await SchoolAdmin.findOne({_id : student.school})
                const session = await Session.findOne({school: school._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const exam = await Exam.findOne({
                    school : student.school, available: true, 
                    examCode: req.params.examCode, session: session._id, term: term._id
                })
                if(exam){
                    let studentCourses = student.className
                    const classchool = await ClassSchool.findOne({_id : studentCourses})
                    const courses = await Course.find({
                        school : student.school, className : classchool.name,
                        release : true, exam: exam._id
                    })
                    res.render('student-courses', {courses : courses, exam : exam, 
                    student : student, code : school, sessS: session.name, termS: term.name,
                    className : classchool, exam_active : "active", title: 'Subjects'})
                }else{
                    throw{
                        message : "No Exam found"
                    }
                }
            }else{
                res.redirect(303, '/student')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    getVerifyCBT = async (req, res, next) => {
        try{ 
            if(req.session.regNumber){
                const student = await Student.findOne({studentID : req.session.regNumber})
                const school = await SchoolAdmin.findOne({_id : student.school})
                const className = await ClassSchool.findOne({_id : student.className})
                const session = await Session.findOne({school: school._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const exam = await Exam.findOne({
                    school : student.school, available: true, 
                    examCode: req.params.examCode, session: session._id, term: term._id
                })
                const course = await Course.findOne({
                    exam: exam._id, className: className.name, 
                    release: true, courseName: req.params.courseName
                })
                const examPass = await ExamPass.findOne({
                    course: course._id, exam: exam._id, 
                    student: student._id
                })
            
                res.render('verify-cbt', {exams : exam, student : student,
                code : school, className : className, title: 'Verification',
                exam_active : "active", course: course, examPass: examPass,
                sessS: session.name, termS: term.name})
                
            }else{
                res.redirect(303, '/student')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    postVerifyCBT = async (req, res, next) => {
        try{ 
            if(req.session.regNumber){
                const student = await Student.findOne({studentID : req.session.regNumber})
                const school = await SchoolAdmin.findOne({_id : student.school})
                const className = await ClassSchool.findOne({_id : student.className})
                const session = await Session.findOne({school: school._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const exam = await Exam.findOne({
                    school : student.school, available: true, 
                    examCode: req.params.examCode, session: session._id, term: term._id
                })
                const course = await Course.findOne({
                    exam: exam._id, className: className.name, 
                    release: true, courseName: req.params.courseName})
                const examPass = await ExamPass.findOne({
                    course: course._id, exam: exam._id, 
                    student: student._id})

                let studentPass = req.body.pass
                let studentID = req.body.student
                if(examPass.password == studentPass && student.studentID == studentID){
                    ExamPass.findByIdAndUpdate(examPass._id, {
                        status : true,
                    }, {new : true, useAndModify : false}, (err , item) => {
                        if(err){
                            res.status(500)
                            return
                        }else {
                            let redirectUrl = '/student/cbt/' + req.params.examCode + '/' + req.params.courseName + '/start'
                            res.redirect(303, redirectUrl)
                        }
                    })
                }else{
                    res.render('verify-cbt', {exams : exam, student : student,
                    code : school, className : className, title: 'Verification',
                    exam_active : "active", course: course, examPass: examPass,
                    message: 'Access Denied!', sessS: session.name, termS: term.name})
                }
            }else{
                res.redirect(303, '/student')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    readyExam = async (req, res, next) => {
        try{ 
            if(req.session.regNumber){
                const student = await Student.findOne({studentID : req.session.regNumber})
                const school = await SchoolAdmin.findOne({_id : student.school})
                const className = await ClassSchool.findOne({_id : student.className})
                const session = await Session.findOne({school: school._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const exam = await Exam.findOne({
                    school : student.school, available: true, 
                    examCode: req.params.examCode, session: session._id,
                    term: term._id
                })
                const course = await Course.findOne({
                    exam: exam._id, className: className.name, 
                    release: true, courseName: req.params.courseName})
                const examPass = await ExamPass.findOne({course: course._id, exam: exam._id, student: student._id})
                if(examPass){
                    if(examPass.status){
                        let result = await Result.findOne({student : student._id, exam: exam._id})
                        
                        let mainResult
                        if(result){
                            mainResult = result.result.find(item => item.courseName === req.params.courseName)
                        }else{
                            mainResult = null
                        }
                        
                        res.render('start-exam', {exam : exam, student : student,
                        code : school, className : className, title: 'Subjects',
                        exam_active : "active", examQuestions: course, examPass: examPass,
                        mainResult: mainResult, sessS: session.name, termS: term.name})
                    }else{
                        let redirectUrl = '/student/cbt/' + req.params.examCode + '/' + req.params.courseName + '/verify'
                        res.redirect(303, redirectUrl)
                    }
                }else{
                    res.redirect(303, '/student/dashboard')
                }
            }else{
                res.redirect(303, '/student')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    countToExam = async (req, res, next) => {
        try{
            if(req.session.regNumber){
                const student = await Student.findOne({studentID : req.session.regNumber})
                const school = await SchoolAdmin.findOne({_id : student.school})
                const className = await ClassSchool.findOne({_id : student.className})
                const session = await Session.findOne({school: school._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const exam = await Exam.findOne({
                    school : student.school, available: true, 
                    examCode: req.params.examCode, session: session._id,
                    term: term._id
                })
                const course = await Course.findOne({
                    exam: exam._id, className: className.name, 
                    release: true, courseName: req.params.courseName
                })
                const examPass = await ExamPass.findOne({course: course._id, exam: exam._id, student: student._id})
                if(examPass){
                    if(examPass.status){
                        let timeStarted = new Date()  
                        timeStarted.setMinutes(timeStarted.getMinutes() + course.duration)
                        req.session.endTime = timeStarted.toLocaleString().split(",")[1].trim()

                        let redirectUrl = '/student/cbt/' + req.params.examCode + '/' + req.params.courseName + '/running'
                        res.redirect(303, redirectUrl)
                    }else{
                        let redirectUrl = '/student/cbt/' + req.params.examCode + '/' + req.params.courseName + '/verify'
                        res.redirect(303, redirectUrl)
                    }
                }else{
                    res.redirect(303, '/student/dashboard')
                }
            }else{
                res.redirect(303, '/student')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    examRunning =  async (req , res , next ) => {
        try{ 
		    if(req.session.regNumber){
                const student = await Student.findOne({studentID : req.session.regNumber})
                const school = await SchoolAdmin.findOne({_id : student.school})
                const session = await Session.findOne({school: school._id, current: true})
                const term = await Term.findOne({current: true, session: session._id})
                const exam = await Exam.findOne({
                    school : student.school, available: true, 
                    examCode: req.params.examCode, term: term._id,
                    session: session._id
                })
                
                let studentClass = await ClassSchool.findOne({_id : student.className})
				let course = req.params.courseName
                const courseDB = await Course.findOne({
                    exam: exam._id, className: studentClass.name, 
                    release: true, courseName: course
                })
				if ( courseDB ) { 
                    const examPass = await ExamPass.findOne({
                        course: courseDB._id, exam: exam._id, 
                        student: student._id
                    })
                    if(examPass){
                        if(examPass.status){
                            let currentQuestion 
                            if (req.query.question){
                                currentQuestion = Number(req.query.question)
                            }else {
                                currentQuestion = 1
                            }
                            let question = await Question.findOne({course : courseDB._id })
                            if(question){

                                let currentTime = new Date()
                                res.render("exam-mode" , { 
                                    student : student,
                                    exam : exam , 
                                    questions : question,
                                    course : courseDB ,  
                                    currentQuestion : question.question[currentQuestion - 1] ,
                                    currentTime :currentTime.toLocaleString().split(",")[1].trim(),
                                    endTime : req.session.endTime,
                                    code : school.schoolCode,
                                    className : studentClass,
                                    code : school
                                })
                            }else{
                                res.render("exam-mode", {student : student, 
                                    noQuestion : "No questions has been set for this exam yet.",
                                    code : school.schoolCode, className : studentClass})
                            }
                        }else{
                            let redirectUrl = '/student/cbt/' + req.params.examCode + '/' + req.params.courseName + '/verify'
                            res.redirect(303, redirectUrl)
                        }
                    }else{
                        res.redirect(303, '/student/dashboard')
                    }
                }else {
					throw {
						message : "This course is not found"
					}
				}
            }else{
                res.redirect(303, '/student')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
	}

    markExam = async(req , res , next) => { 
        try{ 
            if(req.session.regNumber){
                const {response , courseName, className} = req.body 
                const validStudent = await Student.findOne({studentID: req.session.regNumber})
                const exam = await Exam.findOne({
                    school : validStudent.school, available: true, 
                    examCode: req.params.examCode
                })
                const writtenCourse = await Course.findOne({
                    className : className, courseName : courseName, exam: exam._id,
                    school : validStudent.school, release: true
                })  
                let questions = await Question.findOne({course : writtenCourse._id }) 
                let mainQuestion = questions.question
                const total = mainQuestion.reduce((a, b) => a + b.mark, 0)
                
                function markExam(question , response) {
                    try {
                        if (!(Array.isArray(question) && Array.isArray(response))) {
                            throw {
                                message : "Your exam is having issues submitting to the server"
                            }
                        } 
                        let score = 0 
                        let current
                        question.map((q , index)=> {
                            current = response.find(option => option.id === String(q._id) ) 
                            if (current){
                                let markOption = q.correctOption === current.value ? q.mark : 0
                                score += markOption
                            }	
                        })
                        return score 
                    }catch(error) {
                        let msg = error.message
                        return msg
                    }
                } 
                let studentScore = markExam(mainQuestion , response)
                let percentage = Math.round((studentScore / total) * 100)

                let studentResult = await Result.findOne({student : validStudent._id, exam: exam._id})
                if(studentResult){
                    let fromBody = {
                        courseName : courseName,
                        score : studentScore,
                        option : response,
                        total: total,
                        percentage: percentage
                    }
                    Result.findOneAndUpdate({studentNo : validStudent.regNumber}, {
                        $addToSet : {
                            result : [fromBody] }
                    }, {new : true, useAndModify : false}, (err , item) => {
                        if(err){
                            res.status(500)
                            return
                        }else {
                            res.json({message : "Redirecting..."})
                        }
                    })	
                }else{
                    const result = await new Result({
                        student : validStudent._id,
                        school : validStudent.school,
                        className : className,
                        exam : exam._id,
                        result : [{
                            courseName : courseName,
                            score : studentScore,
                            option : response,
                            total: total,
                            percentage: percentage
                        }]
                    })
                    let saveExamination = await result.save()
                    if (saveExamination){
                        res.json({message : "Redirecting..."})
                    }else {
                        throw new Error("Problem with database query")
                    }
                }
            }
        }catch(err){
            res.render("error-page", {error: err})
        }	
    }

    getCompletePage = async (req, res, next) => {
        try{ 
            if(req.session.regNumber){
                let student = await Student.findOne({studentID : req.session.regNumber})
                delete req.session.regNumber
                res.render('complete-exam', {student : student})
            }else{
                res.redirect(303, '/student')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    getResults = async(req, res, next) => {
        try{ 
            if(req.session.regNumber){
                let student = await Student.findOne({studentID: req.session.regNumber})
                const school = await SchoolAdmin.findOne({_id : student.school})
                const className = await ClassSchool.findOne({_id : student.className})
                const results = await Result.find({student : student._id, released : true})
                const session = await Session.findOne({school: school._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const exams = await Exam.find({school: school._id, session: session._id, term: term._id})
                
                let examName = {}
                exams.map(e => {
                    examName[e._id] = e.name
                })

                res.render('select-result', {student : student, results : results, examName: examName,
                code : school, className : className, result_active : "active",
                cbtR_active: 'active', openresult_active: "pcoded-trigger", title: 'CBT Results',
                sessS: session.name, termS: term.name})
                
            }else{
                res.redirect(303, '/student')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    displayResults = async(req, res, next) => {
        try{ 
            if(req.session.regNumber){
                const student = await Student.findOne({studentID: req.session.regNumber})
                const school = await SchoolAdmin.findOne({_id : student.school})
                const className = await ClassSchool.findOne({_id : student.className})
                const results = await Result.findOne({_id: req.params.resultID})
                const session = await Session.findOne({school: school._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})

                res.render('student-result', {student : student, results : results,
                code : school, className : className, result_active : "active",
                cbtR_active: 'active', openresult_active: "pcoded-trigger", title: 'CBT Results',
                sessS: session.name, termS: term.name})
                
            }else{
                res.redirect(303, '/student')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    getReportCard = async (req, res, next) => {
        try{
            if(req.session.regNumber){
                const student = await Student.findOne({studentID : req.session.regNumber})
                const school = await SchoolAdmin.findOne({_id : student.school})
                const session = await Session.findOne({school: school._id, current: true})
                const term = await Term.findOne({current: true, session: session._id})
                const className = await ClassSchool.findOne({_id: student.className})
                const broadsheet = await Broadsheet.findOne({
                    session: session._id, term: term._id,
                    school: school._id, student: student._id,
                    released: true
                })

                res.render('student-report-card', {student : student, broadsheet: broadsheet,
                code : school, result_active : "active", schoolT: school,
                card_active: 'active', openresult_active: "pcoded-trigger", title: 'Report Card',
                sessS: session.name, termS: term.name, className: className})

            }else{
                res.redirect(303, '/student')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    settingsPage = async(req, res, next) => {
        try{
            if(req.session.regNumber){
                const student = await Student.findOne({studentID : req.session.regNumber})
                const school = await SchoolAdmin.findOne({_id : student.school})
                const className = await ClassSchool.findOne({_id : student.className})
                res.render('student-settings', {title : "Settings",
                    student : student, success : req.flash('success'),
                    code : school.schoolCode, className : className})
            }else{
                res.redirect(303, '/student-page')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    postSettings = async(req, res, next) => {
        try{
            if(req.session.regNumber){
                const {oldPassword, newPassword} = req.body
                const student = await Student.findOne({studentID : req.session.regNumber})
                let validPassword = await bcrypt.compare(oldPassword , student.password)
                if(validPassword){
                    let harshedPassword = await bcrypt.hash(newPassword , 10)
                    Student.findByIdAndUpdate(student._id, {
                        password : harshedPassword
                    }, {new : true, useFindAndModify : false}, (err, item) => {
                        if(err) {
                            console.log(err)
                        }else {
                            req.flash('success', 'Password changed successfully.')
                            res.redirect(303, "/student/settings")
                            return
                        }
                    })
                }else{
                    res.render("student-settings", {error : "Old Password is wrong!", title : "Settings",
                    student : student, success : req.flash('success')})
                }
            }else{
                res.redirect(303, '/student')
            }
        }catch(err) {
            res.render("error", {error: err})
        }
    }

    getLogout = (req , res , next ) => {
        try {
            if (req.session.regNumber) {
                delete req.session.regNumber
                res.redirect(303 , '/student')
            }else {
                throw new Error("Problem signing out. We will handle this shortly")
            }
        }catch(err) {
            res.render("error-page", {error: err})
        }
    }
}

const returnApp = new App()

module.exports = returnApp 