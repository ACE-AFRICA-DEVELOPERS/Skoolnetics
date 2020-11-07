
const bcrypt = require('bcryptjs')

const SchoolAdmin = require('../model/schoolAdmin')
const Staff = require("../model/staff")
const Exam = require('../model/exam')
const Course = require('../model/course')
const Question = require('../model/question')
const Result = require('../model/result')
const Student = require('../model/student')
const Attendance = require('../model/attendance')
const ClassSchool = require('../model/classchool')
const Session = require('../model/session')
const Term = require('../model/term')
const LessonNote = require('../model/lessonNote')
const ExamCompute = require('../model/exam-settings')
const StudentResult = require('../model/studentResults')
const Grade = require('../model/grade')
const BroadSheet = require('../model/broadsheet')

const FileHandler = require('./file')

class App {

    postStaffLogin = async (req , res , next) => {
        try { 
            const {code, email, password} = req.body
            let staff = await Staff.findOne({staffID : code, email : email})
            console.log(staff)
            if(staff){
                console.log(staff)
                const validStaff = await bcrypt.compare(password , staff.password)
                console.log(validStaff)
                if(validStaff){
                    req.session.staffCode = staff.staffID
                    res.redirect(303 , '/staff/dashboard')
                }else{
                    res.render('staff-page' , { error : 'Invalid Login details'})
                }
            }else{
                res.render('staff-page' , { error : 'Invalid Login details'})
            }
        }catch(errors) {
            res.render('error-page' , {error : errors})
        }
    }

    getDashboard = async (req , res , next) => {
        try{ 
            if(req.session.staffCode){
                let staff = await Staff.findOne({staffID : req.session.staffCode})
                let school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({school : staff.school, current : true})
                const term = await Term.findOne({session: session._id, current: true})
                const exams = await Exam.find({quick: true, school: school._id, examiner: staff._id})
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
                if(staff){
                    res.render('staff-dashboard' , { title  : "Dashboard", staff : staff, 
                    code : school.schoolCode, dash_active : "active", schoolT: school,
                    termS: termS, sessS: sessionS, exams: exams.length, term : term })
                }else{
                    throw{
                        message : "No Staff"
                    }
                }
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    getExams = async (req, res, next) => {
        try{ 
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const exam = await Exam.find({school : school._id})
                const session = await Session.find({school : staff.school})
                const term = await Term.find({school : staff.school})

                let sessionName = {}
                session.map(sess => sessionName[sess._id] = sess.name)

                let termName = {}
                term.map(sess => termName[sess._id] = sess.name)

                if(exam.length != 0){
                    res.render('staff-exam', {exams : exam, staff : staff, 
                        code : school.schoolCode, exam_active : "active", 
                        termName : termName, sessionName : sessionName})
                }else{
                    res.render('staff-exam', {noExam : "No Exam has been created yet.", 
                    code : school.schoolCode, staff : staff, exam_active : "active"})
                }
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    getCourses = async(req, res, next) => {
        try{ 
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const exam = await Exam.findOne({examCode : req.params.examname, school : school._id})
                if(exam){
                    let staffCourses = staff.class.subject
                    res.render('check-courses', {courses : staffCourses, exam : exam, 
                        staff: staff, exam_active : "active",
                        code : school.schoolCode})
                }else{
                    throw{
                        message : "No Exam found"
                    }
                }
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    getCourseClass = async(req, res, next) => {
        try{ 
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const exam = await Exam.findOne({examCode : req.params.examname, school : school._id})
                if(exam){
                    let staffClasses = staff.class.className
                    let course = req.params.coursename
                    res.render('check-classes', {classes : staffClasses, exam : exam, 
                        course : course, staff : staff, code : school.schoolCode, exam_active : "active"})
                }else{
                    throw{
                        message : "No Exam found"
                    }
                }
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    startCourseQuestions = async(req, res, next) => {
        try{ 
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const exam = await Exam.findOne({examCode : req.params.examname, school : school._id})
                if(exam){
    
                    let course = req.params.coursename
                    let className = req.params.classname
                    const courseDB = await Course.findOne({examiner : staff._id, 
                        courseName : course, className : className, school : school._id})
                    res.render('start-question', {staff : staff, exam : exam, 
                        examQuestions : courseDB, code : school.schoolCode, 
                        exam_active : "active", courseName : course, className : className })
                }else{
                    throw{
                        message : "No Exam found"
                    }
                }
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    postCourseQuestion = async(req, res, next) => {
        try{ 
            if(req.session.staffCode){
                const examiner = await Staff.findOne({staffID : req.session.staffCode})
                const school = await SchoolAdmin.findOne({_id : examiner.school})
                const exam = await Exam.findOne({examCode : req.params.examname, school : school._id})
                const className = req.params.classname
                const courseName = req.params.coursename
                const {instructions, duration} = req.body
                const course = await new Course({
                    exam : exam._id,  
                    examiner : examiner._id , 
                    instruction : instructions,
                    duration : duration, 
                    className : className, 
                    courseName : courseName,
                    school : school._id
                })
                const saveCourse = await course.save()
                if ( saveCourse ) { 
                    let redirectUrl = '/staff/exam/' + req.params.examname + '/courses/' + courseName + '/' + className
                    res.redirect(redirectUrl)
                    return 
                }else {
                    throw {
                        message : "Unable to save this Course"
                    }
                    return 
                }
            }else {
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    setQuestions = async (req, res, next) => {
        try{ 
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const exam = await Exam.findOne({examCode : req.params.examname, school : school._id})
                
                const course = await Course.findOne({courseName : req.params.coursename, 
                    className : req.params.classname, examiner : staff._id})
                res.render('set-questions', {course : course, exam : exam, staff : staff,
                code : school.schoolCode, exam_active : "active"})
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    postSetQuestions =  async ( req , res , next ) => {
        try{ 
		    if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const exam = await Exam.findOne({examCode : req.params.examname, school : staff.school})
                const course = await Course.findOne({courseName : req.params.coursename, 
                    className : req.params.classname, examiner : staff._id})
                const availableQuestion = await Question.findOne({course : course._id, school : staff.school})
                const {question, optionA , optionB , optionC , optionD , correctOption , 
                    mark} = req.body 
                
                FileHandler.createDirectory("./public/uploads/schools/" + school.schoolCode + "/exam-" + exam.examCode + "/" + req.params.coursename + "-" + req.params.classname)
                
                if(availableQuestion){
                    if(req.file){
                        let originalName = req.file.filename
                        let bodywithImage = {
                            mainQuestion : question,
                            options : {
                                optionA : optionA , 
                                optionB : optionB , 
                                optionC : optionC , 
                                optionD : optionD 
                            } , 
                            image : originalName,
                            correctOption : correctOption , 
                            mark : mark ,
                            questionNumber : availableQuestion.question.length + 1
                        }
                        Question.findByIdAndUpdate(availableQuestion._id, {
                            $addToSet : {
                                question : [bodywithImage] }
                        }, {new : true, useAndModify : false}, (err , item) => {
                            if(err){
                                res.status(500)
                                return
                            }else {
                                FileHandler.moveFile(originalName , "./public/uploads/profile" , "./public/uploads/schools/" + school.schoolCode + "/exam-" + exam.examCode + "/" + req.params.coursename + "-" + req.params.classname + "/") 
                                req.flash('success', `Question has been saved successfully`)
                                let redirectUrl = '/staff/exam/' + req.params.examname + '/courses/' + req.params.coursename + '/' + req.params.classname + '/questions'
                                res.redirect(redirectUrl)
                            }
                        })
                    }else {
                        let bodywithoutImage = {
                            mainQuestion : question,
                            options : {
                                optionA : optionA , 
                                optionB : optionB , 
                                optionC : optionC , 
                                optionD : optionD 
                            } , 
                            correctOption : correctOption , 
                            mark : mark ,
                            questionNumber : availableQuestion.question.length + 1
                        }
                        Question.findByIdAndUpdate(availableQuestion._id, {
                            $addToSet : {
                                question : [bodywithoutImage] }
                        }, {new : true, useAndModify : false}, (err , item) => {
                            if(err){
                                res.status(500)
                                return
                            }else {
                                req.flash('success', `Question has been saved successfully`)
                                let redirectUrl = '/staff/exam/' + req.params.examname + '/courses/' + req.params.coursename + '/' + req.params.classname + '/questions'
                                res.redirect(redirectUrl)
                            }
                        })
                    }
                }else{
                    if(req.file){
                        let originalName = req.file.filename 
                        const que = await new Question({
                            school : school._id,
                            course : course._id, 
                            question : [{
                                mainQuestion : question,
                                options : {
                                    optionA : optionA , 
                                    optionB : optionB , 
                                    optionC : optionC , 
                                    optionD : optionD 
                                },
                                image : originalName,
                                correctOption : correctOption , 
                                mark : mark ,
                                questionNumber : 1
                            }] 
                        })
                        const saveQuestion = await que.save() 
                        if (saveQuestion) {
                            FileHandler.moveFile(originalName , "./public/uploads/profile" , "./public/uploads/schools/" + school.schoolCode + "/exam-" + exam.examCode + "/" + req.params.coursename + "-" + req.params.classname + "/") 
                            req.flash('success', `Question has been saved successfully`)
                            let redirectUrl = '/staff/exam/' + req.params.examname + '/courses/' + req.params.coursename + '/' + req.params.classname + '/questions'
                                res.redirect(redirectUrl)
                        }else {
                            throw {
                                message : "Unable to save the student"
                            }
                        }
                    }else {
                        const que = await new Question({
                            school : school._id,
                            course : course._id, 
                            question : [{
                                mainQuestion : question,
                                options : {
                                    optionA : optionA , 
                                    optionB : optionB , 
                                    optionC : optionC , 
                                    optionD : optionD 
                                },
                                correctOption : correctOption , 
                                mark : mark ,
                                questionNumber : 1
                            }] 
                        })
                        const saveQuestion = await que.save() 
                        if (saveQuestion) {
                            req.flash('success', `Question has been saved successfully`)
                            let redirectUrl = '/staff/exam/' + req.params.examname + '/courses/' + req.params.coursename + '/' + req.params.classname + '/questions'
                            res.redirect(redirectUrl)
                        }else {
                            throw {
                                message : "Unable to save the student"
                            }
                        }
                    }
                }
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }
    
    checkQuestions = async (req, res, next) => {
        try{ 
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const exam = await Exam.findOne({examCode : req.params.examname, school : school._id})
                
                const course = await Course.findOne({courseName : req.params.coursename, 
                    className : req.params.classname, examiner : staff._id})
                if(course){
                    const question = await Question.findOne({course : course._id, school : school._id})
                    if(question){
                        res.render('questions', {questions : question, staff : staff, exam : exam,
                            course : course, success : req.flash('success'), 
                            code : school.schoolCode, exam_active : "active"})
                    }else{
                        res.render('questions', {noQue : `You haven't set your questions`, staff : staff,
                        exam : exam, course : course, success : req.flash('success'), 
                        code : school.schoolCode, exam_active : "active"})
                    }
                }else{
                    throw {
                        message : "No Course found"
                    }
                }
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render("error-page", {error: err})
        } 
    }

    deleteQuestion = async (req, res, next) => {
        try{ 
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const course = await Course.findOne({courseName : req.params.coursename, 
                    className : req.params.classname, examiner : staff._id})
                const mainQuestion = await Question.findOne({course : course._id})
				if(mainQuestion){
                    let question = mainQuestion.question
                    let mapIt = question.find( elem => elem._id == req.params.questionID)
                    Question.findByIdAndUpdate(mainQuestion._id, {
                        $pull : {
                            question : mapIt }
                    }, {new : true, useAndModify : false}, (err , item) => {
                        if(err){
                            res.status(500)
                            return
                        }else {
                            req.flash('success', `Question deleted successfully`)
                            let redirectUrl = '/staff/exam/' + req.params.examname + '/courses/' + req.params.coursename + '/' + req.params.classname + '/questions'
                            res.redirect(303, redirectUrl)
                        }
                    })
                }else{
                    throw{
                        message : "Error in deleting."
                    }
                }	
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    publishQuestions = async (req, res, next) => {
        try{ 
            if(req.session.staffCode){
                let staff = await Staff.findOne({staffID : req.session.staffCode})
                let course = await Course.findOne({examiner : staff._id, 
                    courseName : req.params.coursename, className : req.params.classname})
                if(course){
                    let courseID = course._id
                    Course.findByIdAndUpdate(courseID, {
                        publish : true,
                    }, {new : true, useAndModify : false}, (err , item) => {
                        if(err){
                            res.status(500)
                            return
                        }else {
                            let redirectUrl = '/staff/exam/' + req.params.examname + '/courses/' + req.params.coursename + '/' + req.params.classname
                            res.redirect(redirectUrl)
                        }
                    })	
                }
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    previewQuestions = async (req, res, next) => {
        try{ 
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const exam = await Exam.findOne({examCode : req.params.examname, school : staff.school})
                const courseDB = await Course.findOne({className : req.params.classname, 
                    courseName : req.params.coursename, school : staff.school, exam : exam._id})
                const question = await Question.findOne({course : courseDB._id })
                if(question){
                    if(question.question.length > 5){
                        let currentQuestion 
                        if (req.query.question){
                            currentQuestion = Number(req.query.question)
                        }else {
                            currentQuestion = 1
                        }
                        res.render('preview', {title : "Preview", staff : staff,
                        code : school.schoolCode, exam : exam , questions : question,
                        course : courseDB , currentQuestion : question.question[currentQuestion - 1],
                        code : school.schoolCode, className : req.params.classname})
                    }else{
                        res.render('preview', {title : 'Preview', staff : staff, code : school.schoolCode,
                        noQuestion : "You need to have up to 5 questions to preview.", exam : exam,
                        course : courseDB, className : req.params.classname})
                    }
                }else{
                    res.render('preview', {title : 'Preview', staff : staff, code : school.schoolCode,
                    noQuestion : "No questions has been set yet.", exam : exam,
                    course : courseDB, className : req.params.classname})
                }
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    checkStudentsResults = async (req, res, next) => {
        try{ 
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                let courseName = req.params.coursename
                let className = req.params.classname
                let result = await Result.find({className : className, school : staff.school})
                const students = await Student.find()

                let studentName = {}
                let studentID = {}
                students.map(student => {
                    studentName[student._id] = student.firstName + " " + student.lastName
                    studentID[student._id] = student.studentID
                })
                
                if(result.length != 0){
                    res.render("check-results", {staff : staff, results : result, 
                        courseName : courseName, code : school.schoolCode, 
                        studentName : studentName, studentID : studentID, exam_active : "active"})
                }else{
                    res.render("check-results", {staff : staff, code : school.schoolCode,
                        noResult : "No student have written the exam yet.", exam_active : "active"})
                }
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    getLessonNoteTerm = async(req, res, next) => {
        try{ 
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({school : school._id, current : true})
                const term = await Term.find({session : session._id})
                
                res.render('lesson_note_term', {staff: staff, code : school.schoolCode, session: session,
                    term: term, notes_active : "active"})
                
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    getLessonNotePage = async(req, res, next) => {
        try{ 
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({school : school._id, current : true})
                const term = await Term.findOne({session : session._id, name : req.params.term})

                res.render('lessonNote', {staff: staff, code : school.schoolCode, session: session,
                    term: term, notes_active : "active"})
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    makeLessonNote = async (req, res, next) => {
        try{ 
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({school : school._id, current : true})
                const term = await Term.findOne({session : session._id, name : req.params.term})

                res.render('make-lesson-note', {staff: staff, code : school.schoolCode, session: session,
                    term: term, notes_active : "active"})
                
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    postLessonNote = async(req, res, next) =>{
        try{ 
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({school : school._id, current : true})
                const term = await Term.findOne({session : session._id, name : req.params.term})
                if(staff){
                    const{subject,week, className, date, topic, materials, contentTopic, 
                        contentDetail, presentation,evaluation,conclusion} = req.body
                    let lessonNote =await new LessonNote({
                        school: school._id,
                        staff: staff._id,
                        subject: subject,
                        session : session._id,
                        term: term._id,
                        className: className,
                        date: date,
                        week: week,
                        topic: topic,
                        materials: materials,
                        content : {
                            contentTopic: contentTopic,
                            contentDetail: contentDetail
                        },
                        presentation : presentation,
                        evaluation : evaluation,
                        conclusion : conclusion
                    })
                    let ret = await lessonNote.save()
                    if(ret){
                        let redirectUrl = '/staff/lesson-note/' + req.params.term + '/all'
                        res.redirect(303, redirectUrl)
                    }else{
                        throw{
                            message : "Error in saving."
                        }
                    }
                }else{
                    throw{
                        message : "Cannot add Lesson Note"
                    }
                }
            }
        }catch(err){
            res.json(err.message)
        }
    }

    getAllLessonNote = async (req, res, next) => {
        try{ 
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({school : school._id, current : true})
                const term = await Term.findOne({session : session._id, name : req.params.term})
                const lessonNote = await LessonNote.find({school : staff.school, staff: staff._id,
                    session : session._id, term : term._id})
                if(lessonNote.length > 0){
                    res.render("view-lesson-note", {staff: staff, code : school.schoolCode, lessonNotes : lessonNote,
                    notes_active : "active", session: session, term : term})
                }else{
                    res.render("view-lesson-note", {staff: staff, code : school.schoolCode, noNote: "No note has been created.",
                        notes_active : "active", session: session, term : term})
                }
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    getSingleLessonNote = async (req, res, next) => {
        try{ 
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({school : school._id, current : true})
                const term = await Term.findOne({session : session._id, name : req.params.term})
                const singleLessonNote = await LessonNote.findOne({_id : req.params.lessonNote})
                if(singleLessonNote){
                    res.render("view-single-lesson-note", {staff: staff, code : school.schoolCode, term: term,
                        singleLessonNote : singleLessonNote, notes_active: "active" })
                }else{
                    throw{
                        message : "Note not found."
                    }
                }
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    getUploadResult = async (req, res, next) => {
        try{ 
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({school: school._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                res.render("upload-result", {staff: staff, code : school.schoolCode,
                upload_active: 'active', title: 'Upload Results', sessS: session.name,
                termS: term.name})
                
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render("error-page", {error: err.message})
        }
    }

    getUploadClass = async (req, res, next) => {
        try{ 
            if(req.session.staffCode){
                let title = req.params.subject + ", " + req.params.className
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const classSchool = await ClassSchool.findOne({school: school._id, name: req.params.className})
                const students = await Student.find({school: school._id, className: classSchool._id})
                const session = await Session.findOne({school: school._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})

                res.render("upload-result-class", {staff: staff, code : school.schoolCode,
                pSubject: req.params.subject, upload_active: 'active', title: title, students: students,
                pClass: req.params.className, sessS: session.name, termS: term.name})
                
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render("error-page", {error: err.message})
        }
    }

    getStudentsUploads = async (req, res, next) => {
        try{ 
            if(req.session.staffCode){
                let title = req.params.subject + ", " + req.params.className
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const classSchool = await ClassSchool.findOne({school: school._id, name: req.params.className})
                const students = await Student.find({school: school._id, className: classSchool._id})
                const session = await Session.findOne({current: true, school: school._id})
                const term = await Term.findOne({current: true, school: school._id})
                const examCompute = await ExamCompute.find({school: school._id, session: session._id, term: term._id})
                const studentResults = await StudentResult.find({school: school._id})

                const broadsheet = await BroadSheet.findOne({
                    session: session._id, className: req.params.className,
                    term: term._id
                }) 
                
                let courseSheet
                if(broadsheet){
                    courseSheet = broadsheet.result.filter(b => {
                        return b.courseName == req.params.subject
                    })
                }else{
                    courseSheet = null
                }
                console.log(courseSheet)
                
                let studentName = {}
                students.map(sess => studentName[sess._id] = sess.firstName + " " + sess.lastName)

                let regNo = {}
                students.map(ses => regNo[ses._id] = ses.studentID)

                const courseResults = studentResults.map(exam => {
                    exam.results = exam.results.filter(e => {
                        return e.subject == req.params.subject
                    })
                    return exam
                })

                async function getGrade(n){
                    const grade = await Grade.findOne({rangeLowest : {$lte: n}, rangeHighest: {$gte: n}})
                    return grade.grade
                }
                
                const resultArray = courseResults.map(item => {
                    item.results = item.results.sort((a,b) => (a.examType > b.examType) ? 1 : -1)
                    return item
                })
                const firstCourseResult = resultArray[0]

                let sumTotal = await Promise.all(resultArray.map(async sum => {
                    let sumT = sum.results.reduce((a, b) => a + Number(b.score), 0)
                    let grade = await getGrade(sumT)
                    return { total: sumT, grades: grade, id: sum.student}
                }))
               
                res.render("staff-student-results", {staff: staff, code : school.schoolCode,
                pSubject: req.params.subject, upload_active: 'active', title: title, students: students,
                pClass: req.params.className, examCompute: examCompute, studentResults: resultArray,
                regNo: regNo, studentName: studentName, firstCourseResult: firstCourseResult,
                sumTotal: sumTotal, courseSheet: courseSheet, sessS: session.name, termS: term.name})
                
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render("error-page", {error: err.message})
        }
    }

    uploadBroadSheet = async (req, res, next) => {
        try{
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const session = await Session.findOne({school : staff.school, current : true})
                const term = await Term.findOne({session : session._id, current: true})
                const {target} = req.body 
                 
                let count = target.length 
                while(count > 0){ 
                    for (let student of target){ 
                        const broadsheet = await BroadSheet.findOne({
                            student : student.name, session: session._id,
                            term: term._id
                        }) 
                        if(!broadsheet){
                            const newSheet = await new BroadSheet({
                                student : student.name,
                                session : session._id,
                                term : term._id,
                                className : req.params.className,
                                school : staff.school,
                                result : [
                                    {
                                        courseName : req.params.subject,
                                        ca : Number(student.ca),
                                        exam: Number(student.exam),
                                        total : Number(student.total),
                                        grade : student.grade
                                    }
                                ]
                            })
                            await newSheet.save()  
                            console.log("Saved successfully")
                        }else {
                            await BroadSheet.findByIdAndUpdate(broadsheet._id, {
                                $addToSet : {
                                    result : [
                                        {
                                            courseName : req.params.subject,
                                            ca : Number(student.ca),
                                            exam: Number(student.exam),
                                            total : Number(student.total),
                                            grade : student.grade
                                        }
                                    ]}
                                }, {
                                    new : true, 
                                    useFindAndModify : false
                                }
                            ) 
                            console.log("Updated successfully")
                        }
                        count -= 1 
                    }
                }
                res.json({message : "Sent!"})
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render('error-page', {error: err.message})
        }
    }

    getOneStudentUpload = async (req, res, next) => {
        try{ 
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const student = await Student.findOne({_id: req.params.studentID})
                let title = student.firstName + " " + student.lastName
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({current: true, school: school._id})
                const term = await Term.findOne({current: true, school: school._id})
                const examCompute = await ExamCompute.find({school: school._id, session: session._id, term: term._id})
                const studentResult = await StudentResult.findOne({school: school._id, student: req.params.studentID})
                
                let courseUploaded
                if(studentResult){
                    courseUploaded = studentResult.results.filter(e => {
                        return e.subject == req.params.subject
                    })
                }
                
                res.render("one-student-upload", {staff: staff, code : school.schoolCode,
                pSubject: req.params.subject, upload_active: 'active', title: title, studentDB: student,
                pClass: req.params.className, examCompute: examCompute, success: req.flash('success'),
                courseUploaded: courseUploaded, sessS: session.name, termS: term.name})
                
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render("error-page", {error: err.message})
        }
    }

    fetchTotalExamScore = async (req, res, next) => {
        try{ 
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({current: true, school: school._id})
                const term = await Term.findOne({current: true, school: school._id})
                const examCompute = await ExamCompute.findOne({school: school._id, session: session._id, 
                    term: term._id, name: req.body.examType})
                
                    res.json({
                        message: examCompute.total
                    })
                
            }else{
                throw 'Invalid Credentials'
            }
        }catch(err){
            res.json({error: err.message})
        }
    }

    postStudentResults = async (req, res, next) => {
        try{ 
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const student = await Student.findOne({_id: req.params.studentID})
                const studentResult = await StudentResult.findOne({student: req.params.studentID})
                const {examType, total, score} = req.body
                if(!studentResult){
                    const firstDetails = await new StudentResult({
                        student : req.params.studentID,
                        classSchool : student.className,
                        school : school._id,
                        results: [
                            {
                                examType: examType,
                                total: total,
                                score: score,
                                subject: req.params.subject
                            }
                        ]
                    })
                    const saveDetails = await firstDetails.save()
                    if(saveDetails){
                        req.flash('success', 'Result saved successfully')
                        let redirectUrl = '/staff/upload-result/' + req.params.subject + '/' + req.params.className + '/' + req.params.studentID
                        res.redirect(303, redirectUrl)
                        return
                    }else{
                        throw 'Unable to save this record.'
                    }
                }else{
                    let fromBody = {
                        examType: examType,
                        total: total,
                        score: score,
                        subject: req.params.subject
                    }
                    StudentResult.findByIdAndUpdate(studentResult._id, {
                        $addToSet : {
                            results : [fromBody] }
                    }, {new : true, useAndModify : false}, (err , item) => {
                        if(err){
                            res.status(500)
                            return
                        }else {
                            req.flash('success', 'Result saved successfully')
                            let redirectUrl = '/staff/upload-result/' + req.params.subject + '/' + req.params.className + '/' + req.params.studentID
                            res.redirect(303, redirectUrl)
                        }
                    })	
                }
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.json({error: err.message})
        }
    }

    getBroadSheetClass = async (req, res, next) => {
        try{
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const classHead = await Staff.findOne({_id: staff._id, classHead: {$exists : true}})
                const allClass = await ClassSchool.find({school: school._id})
                const session = await Session.findOne({school: school._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})

                let className = {}
                allClass.map(s => className[s._id] = s.name)

                res.render('staff-broadsheet-class', {staff: staff, code : school.schoolCode,
                    broadsheet_active : "active", title: 'Broadsheet', sessS: session.name,
                    classHead: classHead, className: className, termS: term.name
                })

            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    getBroadSheet = async (req, res, next) => {
        try{
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const school = await SchoolAdmin.findOne({_id: staff.school})
                const session = await Session.findOne({school : school._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const broadsheet = await BroadSheet.find({
                    className: req.params.className, session: session._id,
                    term: term._id, school: school._id
                })
                let title = 'Broadsheet for ' + req.params.className
                const students = await Student.find({school: school._id})

                let studentName = {}
                let studentID = {}
                students.map(student => {
                    studentName[student._id] = student.firstName + " " + student.lastName
                    studentID[student._id] = student.studentID
                })

                const resultArray = broadsheet.map(item => {
                    item.result = item.result.sort((a,b) => (a.courseName > b.courseName) ? 1 : -1)
                    return item
                })

                const firstResult = resultArray[0]

                res.render('staff-broadsheet', {title : title, staff: staff, code : school.schoolCode,
                pClass : req.params.className, broadsheet_active: "active", broadsheet: resultArray,
                firstResult: firstResult, studentName: studentName, studentID: studentID,
                sessS: session.name, termS: term.name})
                
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    settingsPage = async(req, res, next) => {
        try{
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                res.render('staff-settings', {title : "Settings",
                    staff : staff, success : req.flash('success')})
            }else{
                res.redirect(303, '/staff-page')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    postSettings = async(req, res, next) => {
        try{
            if(req.session.staffCode){
                const {oldPassword, newPassword} = req.body
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                let validPassword = await bcrypt.compare(oldPassword , staff.password)
                if(validPassword){
                    let harshedPassword = await bcrypt.hash(newPassword , 10)
                    Staff.findByIdAndUpdate(staff._id, {
                        password : harshedPassword
                    }, {new : true, useFindAndModify : false}, (err, item) => {
                        if(err) {
                            console.log(err)
                        }else {
                            req.flash('success', 'Password changed successfully.')
                            res.redirect(303, "/staff/settings")
                            return
                        }
                    })
                }else{
                    res.render("staff-settings", {error : "Old Password is wrong!", title : "Settings",
                    staff : staff, success : req.flash('success')})
                }
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err) {
            res.render("error-page", {error: err})
        }
    }

    getLogout = (req , res , next ) => {
        try {
            if (req.session.staffCode) {
                delete req.session.staffCode
                res.redirect(303 , '/staff')
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