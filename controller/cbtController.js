
const FileHandler = require('./file')
const GenerateAccount = require('./accountGenerator')
const Staff = require('../model/staff')
const Exam = require('../model/exam')
const SchoolAdmin = require('../model/schoolAdmin')
const Session = require('../model/session')
const Term = require('../model/term')
const Course = require('../model/course')
const Question = require('../model/question')
const Student = require('../model/student')
const ClassSchool = require('../model/classchool')
const ExamPass = require('../model/generate-pass')
const Random = require('./random')
const Result = require('../model/result')

class App{

    getQuickPage = async (req, res, next) => {
        try{
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const session = await Session.findOne({school: staff.school, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const school = await SchoolAdmin.findOne({_id: staff.school})

                res.render('quick-cbt', {title: 'Quick CBT', staff: staff, 
                quick_active : "active", cbt_active: 'active', code: school,
                opencbt_active: "pcoded-trigger", sessS: session.name, termS: term.name})
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err) {
            res.render("error-page", {error: err})
        } 
    }

    getQuickSettings = async (req, res, next) => {
        try{
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const schoolAdmin = await SchoolAdmin.findOne({_id: staff.school})
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const allExam = await Exam.find({
                    school : schoolAdmin._id, quick: true, 
                    quickOwner: staff._id, session: session._id,
                    term: term._id
                })
                const school = await SchoolAdmin.findOne({_id: staff.school})
                
                res.render('quick-cbt-settings', {title: 'Quick CBT', staff: staff,
                quick_active : "active", cbt_active: 'active', code: school,
                opencbt_active: "pcoded-trigger", success: req.flash('success'), error : req.flash('error'),
                allExam: allExam, pClass: req.params.className, pSubject: req.params.subject,
                sessS: session.name, termS: term.name})
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err) {
            res.render("error-page", {error: err})
        } 
    }

    postQuickCBT = async (req , res , next) => {
        try{
            if(req.session.staffCode){ 
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const schoolAdmin = await SchoolAdmin.findOne({_id: staff.school})
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                let allExam = await Exam.find({school : schoolAdmin._id, session: session._id})
                let code = GenerateAccount(allExam, "01", "examCode", 1, 2)

                const {name, startDate, endDate} = req.body
            
                const exam = await new Exam({
                    name : name,
                    session : session._id,
                    term : term._id,
                    startDate : startDate,
                    endDate : endDate,
                    school : schoolAdmin._id,
                    examCode : code,
                    quick: true,
                    quickOwner: staff.id
                })
                const saveExam = await exam.save()
                if ( saveExam ) { 
                    
                    FileHandler.createDirectory("./public/uploads/schools/" + schoolAdmin.schoolCode + "/exam-" + saveExam.examCode)
                    req.flash('success', 'Successfully saved.')
                    let redirectUrl = '/staff/cbt/quick-one/' + req.params.subject + '/' + req.params.className
                    res.redirect(303, redirectUrl)
                    return 
                }else {
                    throw {
                        message : "Unable to save the exam"
                    }
                }
            }else {
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    deleteQuickCBT = async (req, res, next) => {
        try{
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({school: school._id, current: true})
                const term = await Term.findOne({school: school._id, session: session._id, current: true})
                const course = await Course.find({ exam : req.params.examId})
                if(course.length > 0){
                    req.flash('error', 'This Exam already contains Instructions.')
                    let redirectUrl = '/staff/cbt/quick-one/' + req.params.subject + '/' + req.params.className
                    res.redirect(303, redirectUrl)
                }else {
                    let delExam = await Exam.findByIdAndDelete(req.params.examId)
                    if(delExam){
                        req.flash('success', 'Successfully Deleted.')
                        let redirectUrl = '/staff/cbt/quick-one/' + req.params.subject + '/' + req.params.className
                        res.redirect(303, redirectUrl)
                    }else{
                        req.flash('error', 'Unable to delete this Exam.')
                        let redirectUrl = '/staff/cbt/quick-one/' + req.params.subject + '/' + req.params.className
                        res.redirect(303, redirectUrl)
                    }
                }
            }else {
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    startQuickQuestions = async(req, res, next) => {
        try{ 
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const exam = await Exam.findOne({examCode : req.params.examCode, school : school._id})
                const session = await Session.findOne({school: staff.school, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                if(exam){
                    const courseDB = await Course.findOne({examiner : staff._id, exam: exam._id,
                    school : school._id, className: req.params.className,
                    courseName: req.params.subject})

                    const availableCourse = await Course.find({examiner : staff._id, exam: exam._id,
                    school : school._id, courseName: req.params.subject})

                    res.render('start-question', {staff : staff, exam : exam, 
                    examQuestions : courseDB, code : school, availableCourse,
                    exam_active : "active", pClass: req.params.className, pSubject: req.params.subject,
                    quick_active : "active", cbt_active: 'active', sessS: session.name, termS: term.name,
                    opencbt_active: "pcoded-trigger", success: req.flash('success'), error: req.flash('error')})

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

    postQuestionSetup = async(req, res, next) => {
        try{ 
            if(req.session.staffCode){
                const examiner = await Staff.findOne({staffID : req.session.staffCode})
                const school = await SchoolAdmin.findOne({_id : examiner.school})
                const exam = await Exam.findOne({examCode : req.params.examCode, school : school._id})
                const className = req.params.className
                const courseName = req.params.subject
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
                    let redirectUrl = '/staff/cbt/quick-one/' + courseName + '/' + className + '/' + req.params.examCode 
                    req.flash('success', 'Saved Successfully')
                    res.redirect(redirectUrl)
                    return 
                }else {
                    throw {
                        message : "Unable to save this Course"
                    }
                }
            }else {
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    addCBTtoClass = async (req, res, next) => {
        try{
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({school: school._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const exam = await Exam.findOne({
                    examCode : req.params.examCode, school : school._id,
                    session: session._id, term: term._id
                })
                const availableCourse = await Course.findOne({examiner : staff._id, exam: exam._id,
                school : school._id, courseName: req.params.subject, className: req.params.classT})
                
                const availableQuestion = await Question.findOne({course : availableCourse._id, school : school._id})
                if(availableQuestion){
                    const newCourse = await new Course({
                        exam : exam._id,  
                        examiner : staff._id , 
                        instruction : availableCourse.instruction,
                        duration : availableCourse.duration, 
                        className : req.params.className, 
                        courseName : req.params.subject,
                        school : school._id,
                        publish : availableCourse.publish,
                        release: availableCourse.release
                    })
                    await newCourse.save()
    
                    const newQue = await new Question({
                        school : school._id,
                        course : newCourse._id, 
                        question : availableQuestion.question
                    })
                    await newQue.save()

                    req.flash('success', 'Questions imported successfully.')
                    let redirectUrl = '/staff/cbt/quick-one/' + req.params.subject + '/' + req.params.className + '/' + req.params.examCode
                    res.redirect(303, redirectUrl)
                }else{
                    req.flash('error', 'No questions found.')
                    let redirectUrl = '/staff/cbt/quick-one/' + req.params.subject + '/' + req.params.className + '/' + req.params.examCode
                    res.redirect(303, redirectUrl)
                }

            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    getQuestions = async (req, res, next) => {
        try{ 
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({school: school._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})

                const exam = await Exam.findOne({
                    examCode : req.params.examCode, school : school._id,
                    session: session._id, term: term._id
                })
                
                const course = await Course.findOne({
                    exam: exam._id, examiner : staff._id,
                    courseName: req.params.subject, className: req.params.className
                })
                const question = await Question.findOne({course : course._id, school : school._id})
                let marks
                if(question){
                    marks = question.question.reduce((a, b) => a + Number(b.mark), 0)
                }
            
                res.render('questions', {course : course, exam : exam, staff : staff,
                code : school, exam_active : "active", sessS: session.name, title: 'Questions',
                quick_active : "active", cbt_active: 'active', termS: term.name,
                opencbt_active: "pcoded-trigger", success: req.flash('success'),
                pSubject: req.params.subject, pClass: req.params.className,
                questions: question, marks})

            }else{
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
                const session = await Session.findOne({school: school._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const exam = await Exam.findOne({
                    examCode : req.params.examCode, school : school._id,
                    session: session._id, term: term._id
                })
                
                const course = await Course.findOne({
                    exam: exam._id, examiner : staff._id,
                    courseName: req.params.subject, className: req.params.className
                })
                
                res.render('set-questions', {course : course, exam : exam, staff : staff,
                code : school, exam_active : "active", sessS: session.name,
                quick_active : "active", cbt_active: 'active', termS: term.name,
                opencbt_active: "pcoded-trigger", success: req.flash('success'),
                pSubject: req.params.subject, pClass: req.params.className})
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    postQuestions =  async ( req , res , next ) => {
        try{ 
		    if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const exam = await Exam.findOne({examCode : req.params.examCode, school : staff.school})
                const course = await Course.findOne({exam: exam._id, examiner : staff._id})
                const availableQuestion = await Question.findOne({course : course._id, school : staff.school})
                const {question, optionA , optionB , optionC , optionD , correctOption , 
                    mark} = req.body
                let answer
                if(correctOption == 'A'){
                    answer = optionA
                }else if(correctOption == 'B'){
                    answer = optionB
                }else if(correctOption == 'C'){
                    answer = optionC
                }else if(correctOption == 'D'){
                    answer = optionD
                } 
                
                if(availableQuestion){
                    let imageFile
                    if(req.file){
                        imageFile = req.file.filename
                    }else{
                        imageFile = null
                    }

                    let bodywithImage = {
                        mainQuestion : question,
                        options : {
                            optionA : optionA , 
                            optionB : optionB , 
                            optionC : optionC , 
                            optionD : optionD 
                        } , 
                        image : imageFile,
                        correctOption : answer , 
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
                            FileHandler.moveFile(imageFile , "./public/uploads/profile" , "./public/uploads/schools/" + school.schoolCode + "/exam-" + exam.examCode) 
                            req.flash('success', `Question has been saved successfully`)
                            let redirectUrl = '/staff/cbt/quick-one/' + req.params.subject + '/' + req.params.className + '/' + req.params.examCode + '/questions'
                            res.redirect(redirectUrl)
                        }
                    })
                }else{
                    let imageFile
                    if(req.file){
                        imageFile = req.file.filename
                    }else{
                        imageFile = null
                    }
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
                            image : imageFile,
                            correctOption : answer , 
                            mark : mark ,
                            questionNumber : 1
                        }] 
                    })
                    const saveQuestion = await que.save() 
                    if (saveQuestion) {
                        FileHandler.moveFile(imageFile , "./public/uploads/profile" , "./public/uploads/schools/" + school.schoolCode + "/exam-" + exam.examCode) 
                        req.flash('success', `Question has been saved successfully`)
                        let redirectUrl = '/staff/cbt/quick-one/' + req.params.subject + '/' + req.params.className + '/' + req.params.examCode + '/questions'
                        res.redirect(redirectUrl)
                    }else {
                        throw {
                            message : "Unable to save the student"
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

    deleteQuestion = async (req, res, next) => {
        try{ 
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const session = await Session.findOne({school: staff.school, current: true})
                const term = await Term.findOne({current: true, session: session._id})
                const exam = await Exam.findOne({
                    examCode : req.params.examCode, school : staff.school,
                    session: session._id, term: term._id
                })
                const course = await Course.findOne({
                    exam: exam._id, examiner : staff._id, 
                    className: req.params.className, courseName: req.params.subject})
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
                            let redirectUrl = '/staff/cbt/quick-one/' + req.params.subject + '/' + req.params.className + '/' + req.params.examCode + '/questions'
                            res.redirect(redirectUrl)
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

    previewQuestions = async (req, res, next) => {
        try{ 
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({school: staff.school, current: true})
                const term = await Term.findOne({current: true, session: session._id})
                const exam = await Exam.findOne({
                    examCode : req.params.examCode, school : staff.school,
                    session: session._id, term: term._id
                })
                const courseDB = await Course.findOne({
                    exam: exam._id, examiner : staff._id, 
                    className: req.params.className, courseName: req.params.subject})
                const question = await Question.findOne({course : courseDB._id })
                
                if(question){
                    if(question.question.length >= 5){
                        let currentQuestion 
                        if (req.query.question){
                            currentQuestion = Number(req.query.question)
                        }else {
                            currentQuestion = 1
                        }
                        res.render('preview', {title : "Preview", staff : staff,
                        code : school.schoolCode, exam : exam , questions : question,
                        course : courseDB , currentQuestion : question.question[currentQuestion - 1],
                        code : school.schoolCode, className : req.params.className})
                    }else{
                        res.render('preview', {title : 'Preview', staff : staff, code : school.schoolCode,
                        noQuestion : "You need to have up to 5 questions to preview.", exam : exam,
                        course : courseDB, className : req.params.className})
                    }
                }else{
                    res.render('preview', {title : 'Preview', staff : staff, code : school.schoolCode,
                    noQuestion : "No questions has been set yet.", exam : exam,
                    course : courseDB, className : req.params.className})
                }
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    generatePassView = async (req, res, next) => {
        try{ 
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({school: staff.school, current: true})
                const term = await Term.findOne({current: true, session: session._id})
                const exam = await Exam.findOne({
                    examCode : req.params.examCode, school : staff.school,
                    session: session._id, term: term._id
                })
                const courseDB = await Course.findOne({
                    exam: exam._id, examiner : staff._id, 
                    className: req.params.className, courseName: req.params.subject})
                const classSchool = await ClassSchool.findOne({school: school._id, name: req.params.className})
                const students = await Student.find({className: classSchool._id})
                const examPass = await ExamPass.find({school: school._id, exam: exam._id, 
                    courseName: req.params.subject, className: req.params.className})
                
                let studentName = {}
                students.map(name => studentName[name._id] = name.firstName + " " + name.lastName + " " + name.otherName)
                let studentReg = {}
                students.map(reg => studentReg[reg._id] = reg.studentID)

                res.render('generate-pass', {title : "Generate Password", staff : staff,
                code : school, exam : exam , students: students,
                course : courseDB, quick_active : "active", cbt_active: 'active', 
                opencbt_active: "pcoded-trigger", examPass: examPass, studentName: studentName,
                studentReg: studentReg, sessS: session.name, termS: term.name})
                
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    generatePassword = async(req, res, next) => {
        try{
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const session = await Session.findOne({school: staff.school, current: true})
                const term = await Term.findOne({current: true, session: session._id})
                const exam = await Exam.findOne({
                    examCode : req.params.examCode, school : staff.school,
                    session: session._id, term: term._id
                })
                const courseDB = await Course.findOne({
                    exam: exam._id, examiner : staff._id, 
                    className: req.params.className, courseName: req.params.subject})
                const {targetStudents} = req.body 
                let count = targetStudents.length 
                while(count > 0){ 
                    for (let student of targetStudents){ 
                        const examPass = await new ExamPass({
                            student : student.id,
                            exam: exam._id,
                            course : courseDB._id,
                            school : staff.school,
                            courseName : req.params.subject,
                            className : req.params.className,
                            staff : staff._id,
                            password : Random(8)
                        })
    
                        await examPass.save()  
                        count -= 1 
                    }
                }
                res.json({message : "Passwords has been generated."})
            }
        }catch(err){
            res.render("error-page", {error: err})
        }     
    }

    publishQuestions = async (req, res, next) => {
        try{ 
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const session = await Session.findOne({school: staff.school, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const exam = await Exam.findOne({
                    examCode : req.params.examCode, school : staff.school,
                    session: session._id, term: term._id
                })
                const course = await Course.findOne({
                    exam: exam._id, examiner : staff._id,
                    className: req.params.className, courseName: req.params.subject
                })
                if(course){
                    let courseID = course._id
                    Course.findByIdAndUpdate(courseID, {
                        publish : true,
                    }, {new : true, useAndModify : false}, (err , item) => {
                        if(err){
                            res.status(500)
                            return
                        }else {
                            let redirectUrl = '/staff/cbt/quick-one/' + req.params.subject + '/' + req.params.className + '/' + req.params.examCode
                            res.redirect(303, redirectUrl)
                        }
                    })	
                }else{
                    throw 'Not found.'
                }
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    unpublishQuestions = async (req, res, next) => {
        try{ 
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const session = await Session.findOne({school: staff.school, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const exam = await Exam.findOne({
                    examCode : req.params.examCode, school : staff.school,
                    session: session._id, term: term._id
                })
                const course = await Course.findOne({
                    exam: exam._id, examiner : staff._id,
                    className: req.params.className, courseName: req.params.subject
                })
                if(course){
                    let courseID = course._id
                    Course.findByIdAndUpdate(courseID, {
                        publish : false,
                    }, {new : true, useAndModify : false}, (err , item) => {
                        if(err){
                            res.status(500)
                            return
                        }else {
                            let redirectUrl = '/staff/cbt/quick-one/' + req.params.subject + '/' + req.params.className + '/' + req.params.examCode
                            res.redirect(303, redirectUrl)
                        }
                    })	
                }else{
                    throw 'Not found.'
                }
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    openExam = async (req, res, next) => {
        try{ 
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const session = await Session.findOne({school: staff.school, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const exam = await Exam.findOne({
                    examCode : req.params.examCode, school : staff.school,
                    session: session._id, term: term._id
                })
                const course = await Course.findOne({
                    exam: exam._id, examiner : staff._id,
                    className: req.params.className, courseName: req.params.subject
                })
                Exam.findByIdAndUpdate(exam._id, {
                    available : true,
                }, {new : true, useAndModify : false}, (err , item) => {
                    if(err){
                        res.status(500)
                        return
                    }else {
                        let redirectUrl = '/staff/cbt/quick-one/' + req.params.subject + '/' + req.params.className
                        res.redirect(303, redirectUrl)
                    }
                })	
                
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    releaseCourse = async (req, res, next) => {
        try{ 
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const session = await Session.findOne({school: staff.school, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const exam = await Exam.findOne({
                    examCode : req.params.examCode, school : staff.school,
                    session: session._id, term: term._id
                })
                const course = await Course.findOne({
                    exam: exam._id, examiner : staff._id,
                    className: req.params.className, courseName: req.params.subject
                })
                Course.findByIdAndUpdate(course._id, {
                    release : true,
                }, {new : true, useAndModify : false}, (err , item) => {
                    if(err){
                        res.status(500)
                        return
                    }else {
                        let redirectUrl = '/staff/cbt/quick-one/' + req.params.subject + '/' + req.params.className
                        res.redirect(303, redirectUrl)
                    }
                })	
                
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    unreleaseCourse = async (req, res, next) => {
        try{ 
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const session = await Session.findOne({school: staff.school, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const exam = await Exam.findOne({
                    examCode : req.params.examCode, school : staff.school,
                    session: session._id, term: term._id
                })
                const course = await Course.findOne({
                    exam: exam._id, examiner : staff._id,
                    className: req.params.className, courseName: req.params.subject
                })
                Course.findByIdAndUpdate(course._id, {
                    release : false,
                }, {new : true, useAndModify : false}, (err , item) => {
                    if(err){
                        res.status(500)
                        return
                    }else {
                        let redirectUrl = '/staff/cbt/quick-one/' + req.params.subject + '/' + req.params.className
                        res.redirect(303, redirectUrl)
                    }
                })	
                
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    getCBTResults = async (req, res, next) => {
        try{
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const schoolAdmin = await SchoolAdmin.findOne({_id: staff.school})
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const allExam = await Exam.find({
                    school : schoolAdmin._id, 
                    session: session._id, 
                    term: term._id,
                    available: true
                })
                const allStaff = await Staff.find({school: schoolAdmin._id})
                let staffName = {}
                allStaff.map(s => staffName[s._id] = s.firstName + ' ' + s.lastName)

                res.render('staff-cbt-results', {title: 'CBT Results', staff: staff, code: schoolAdmin,
                ca_active : "active", cbt_active: 'active', staffName: staffName,
                opencbt_active: "pcoded-trigger", success: req.flash('success'),
                allExam: allExam, pClass: req.params.className, pSubject: req.params.subject,
                sessS: session.name, termS: term.name})
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err) {
            res.render("error-page", {error: err})
        } 
    }

    getResultCourses = async (req, res, next) => {
        try{
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const schoolAdmin = await SchoolAdmin.findOne({_id: staff.school})
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const exam = await Exam.findOne({
                    school: schoolAdmin._id, examCode: req.params.examCode,
                    session: session._id, term: term._id
                })
                const courses = await Course.find({
                    exam: exam._id, examiner: staff._id,
                    release: true
                })

                res.render('courses-result', {title: 'CBT Results', staff: staff,
                ca_active : "active", cbt_active: 'active', courses: courses,
                opencbt_active: "pcoded-trigger", success: req.flash('success'),
                exam: exam, pClass: req.params.className, code: schoolAdmin,
                pSubject: req.params.subject, sessS: session.name, termS: term.name})

            }else{
                res.redirect(303, '/staff')
            }
        }catch(err) {
            res.render("error-page", {error: err})
        } 
    }

    displayResults = async (req, res, next) => {
        try{
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const schoolAdmin = await SchoolAdmin.findOne({_id: staff.school})
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const exam = await Exam.findOne({
                    school: schoolAdmin._id, examCode: req.params.examCode,
                    session: session._id, term: term._id
                })
                
                const results = await Result.find({
                    className: req.params.className, exam: exam._id,
                    school: staff.school, session: session._id,
                    term: term._id
                })
                
                const firstResult = results[0]
                const students = await Student.find({school: schoolAdmin._id})
                let studentName = {}
                let studentID = {}
                students.map(student => {
                    studentName[student._id] = student.firstName + " " + student.lastName
                    studentID[student._id] = student.studentID
                })

                res.render('staff-display-scores', {title: 'CBT Results', staff: staff,
                ca_active : "active", cbt_active: 'active', results: results,
                opencbt_active: "pcoded-trigger", success: req.flash('success'),
                exam: exam, pClass: req.params.className, studentName: studentName,
                pSubject: req.params.subject, studentID: studentID, firstResult: firstResult,
                sessS: session.name, termS: term.name, code: schoolAdmin})

            }else{
                res.redirect(303, '/staff')
            }
        }catch(err) {
            res.render("error-page", {error: err})
        } 
    }

    releaseResult = async (req, res, next) => {
        try{
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const schoolAdmin = await SchoolAdmin.findOne({_id: staff.school})
                const exam = await Exam.findOne({school: schoolAdmin._id, examCode: req.params.examCode})
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})

                
                Result.updateMany({className: req.params.className, 
                exam: exam._id, school: staff.school, session: session._id,
                term: term._id}, {
                        $set : {released : true}
                }, {new : true, useAndModify : false}, (err , item) => {
                    if(err){
                        res.status(500)
                        return
                    }else {
                        let redirectUrl = '/staff/cbt/cbt-results/' + req.params.examCode + '/' + req.params.subject + '/' + req.params.className
                        res.redirect(303, redirectUrl)
                    }
                })	
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    recallResult = async (req, res, next) => {
        try{
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const schoolAdmin = await SchoolAdmin.findOne({_id: staff.school})
                const exam = await Exam.findOne({school: schoolAdmin._id, examCode: req.params.examCode})
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})

                
                Result.updateMany({className: req.params.className, 
                exam: exam._id, school: staff.school, session: session._id,
                term: term._id}, {
                        $set : {released : false}
                }, {new : true, useAndModify : false}, (err , item) => {
                    if(err){
                        res.status(500)
                        return
                    }else {
                        let redirectUrl = '/staff/cbt/cbt-results/' + req.params.examCode + '/' + req.params.subject + '/' + req.params.className
                        res.redirect(303, redirectUrl)
                    }
                })	
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    getSchoolCBT = async (req, res, next) => {
        try{
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const school = await SchoolAdmin.findOne({_id: staff.school})
                const session = await Session.findOne({school: school._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const exams = await Exam.find({
                    school: staff.school, quickOwner: {$exists: false},
                    session: session._id, term: term._id
                })
                res.render('school-cbt', {title: 'Quick CBT', staff: staff, code: school,
                caschool_active : "active", cbt_active: 'active', exams: exams,
                opencbt_active: "pcoded-trigger", sessS: session.name, termS: term.name})
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err) {
            res.render("error-page", {error: err})
        } 
    }

    getStaffCourses = async (req, res, next) => {
        try{
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const school = await SchoolAdmin.findOne({_id: staff.school})
                const session = await Session.findOne({school: school._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const exam = await Exam.findOne({
                    school: staff.school, quickOwner: {$exists: false},
                    session: session._id, term: term._id, examCode: req.params.examCode
                })
                res.render('staff-courses', {title: 'Quick CBT', staff: staff,
                caschool_active : "active", cbt_active: 'active', exam: exam,
                opencbt_active: "pcoded-trigger", code: school, sessS: session.name,
                termS: term.name})
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err) {
            res.render("error-page", {error: err})
        } 
    }

    startSchoolQuestions = async(req, res, next) => {
        try{ 
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({school: school._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const exam = await Exam.findOne({
                    school: staff.school, quickOwner: {$exists: false},
                    session: session._id, term: term._id, examCode: req.params.examCode
                })
                if(exam){
                    const courseDB = await Course.findOne({
                        examiner : staff._id, exam: exam._id,
                        school : school._id, courseName: req.params.subject,
                        className: req.params.className
                    })
                    console.log(courseDB)

                    const availableCourse = await Course.find({examiner : staff._id, exam: exam._id,
                    school : school._id, courseName: req.params.subject})

                    res.render('start-school-question', {staff : staff, exam : exam, 
                    examQuestions : courseDB, code : school, 
                    exam_active : "active", pClass: req.params.className, pSubject: req.params.subject,
                    caschool_active : "active", cbt_active: 'active', availableCourse,
                    opencbt_active: "pcoded-trigger", success: req.flash('success'),
                    sessS: session.name, termS: term.name, error: req.flash('error')})

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

    addCBTtoClassSchool = async (req, res, next) => {
        try{
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({school: school._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const exam = await Exam.findOne({
                    school: staff.school, quickOwner: {$exists: false},
                    session: session._id, term: term._id, examCode: req.params.examCode
                })
                const availableCourse = await Course.findOne({examiner : staff._id, exam: exam._id,
                school : school._id, courseName: req.params.subject, className: req.params.classT})
                
                const availableQuestion = await Question.findOne({course : availableCourse._id, school : school._id})
                if(availableQuestion){
                    const newCourse = await new Course({
                        exam : exam._id,  
                        examiner : staff._id , 
                        instruction : availableCourse.instruction,
                        duration : availableCourse.duration, 
                        className : req.params.className, 
                        courseName : req.params.subject,
                        school : school._id,
                        publish : availableCourse.publish,
                        release: availableCourse.release
                    })
                    await newCourse.save()
    
                    const newQue = await new Question({
                        school : school._id,
                        course : newCourse._id, 
                        question : availableQuestion.question
                    })
                    await newQue.save()

                    req.flash('success', 'Questions imported successfully.')
                    let redirectUrl = '/staff/cbt/school/' + req.params.examCode + '/' + req.params.subject + '/' + req.params.className 
                    res.redirect(303, redirectUrl)
                }else{
                    req.flash('error', 'No questions found.')
                    let redirectUrl = '/staff/cbt/school/' + req.params.examCode + '/' + req.params.subject + '/' + req.params.className 
                    res.redirect(303, redirectUrl)
                }

            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    postInstructions = async(req, res, next) => {
        try{ 
            if(req.session.staffCode){
                const examiner = await Staff.findOne({staffID : req.session.staffCode})
                const school = await SchoolAdmin.findOne({_id : examiner.school})
                const session = await Session.findOne({school: school._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const exam = await Exam.findOne({
                    examCode : req.params.examCode, school : school._id,
                    session: session._id, term: term._id
                })
                const className = req.params.className
                const courseName = req.params.subject
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
                    let redirectUrl = '/staff/cbt/school/'+ req.params.examCode + '/' + courseName + '/' + className
                    req.flash('success', 'Saved Successfully')
                    res.redirect(303, redirectUrl)
                    return 
                }else {
                    throw {
                        message : "Unable to save this Course"
                    }
                }
            }else {
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    getSchoolQuestions = async (req, res, next) => {
        try{ 
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({school: school._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const exam = await Exam.findOne({
                    examCode : req.params.examCode, school : school._id,
                    session: session._id, term: term._id
                })
                
                const course = await Course.findOne({
                    exam: exam._id, examiner : staff._id,
                    courseName: req.params.subject,
                    className: req.params.className
                })
                const question = await Question.findOne({course : course._id, school : school._id})
                let marks
                if(question){
                    marks = question.question.reduce((a, b) => a + Number(b.mark), 0)
                }
                
                res.render('school-questions', {course : course, exam : exam, staff : staff,
                code : school, exam_active : "active", marks, title: 'Questions',
                caschool_active : "active", cbt_active: 'active', 
                opencbt_active: "pcoded-trigger", success: req.flash('success'),
                pSubject: req.params.subject, pClass: req.params.className,
                questions: question, sessS: session.name, termS: term.name})

            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    setSchoolQuestions = async (req, res, next) => {
        try{ 
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({school: school._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const exam = await Exam.findOne({
                    examCode : req.params.examCode, school : school._id,
                    session: session._id, term: term._id
                })
                const course = await Course.findOne({
                    exam: exam._id, examiner : staff._id,
                    courseName: req.params.subject,
                    className: req.params.className
                })
                
                res.render('set-questions', {course : course, exam : exam, staff : staff,
                    code : school, exam_active : "active",
                    caschool_active : "active", cbt_active: 'active', 
                    opencbt_active: "pcoded-trigger", success: req.flash('success'),
                    pSubject: req.params.subject, pClass: req.params.className,
                    sessS: session.name, termS: term.name})
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    postSchoolQuestions =  async ( req , res , next ) => {
        try{ 
		    if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({school: school._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const exam = await Exam.findOne({
                    examCode : req.params.examCode, school : school._id,
                    session: session._id, term: term._id
                })
                const course = await Course.findOne({
                    exam: exam._id, examiner : staff._id,
                    courseName: req.params.subject,
                    className: req.params.className
                })
                const availableQuestion = await Question.findOne({course : course._id, school : staff.school})
                const {question, optionA , optionB , optionC , optionD , correctOption , 
                    mark} = req.body 
                let answer
                if(correctOption == 'A'){
                    answer = optionA
                }else if(correctOption == 'B'){
                    answer = optionB
                }else if(correctOption == 'C'){
                    answer = optionC
                }else if(correctOption == 'D'){
                    answer = optionD
                }
                
                if(availableQuestion){
                    let imageFile
                    if(req.file){
                        imageFile = req.file.filename
                    }else{
                        imageFile = null
                    }

                    let bodywithImage = {
                        mainQuestion : question,
                        options : {
                            optionA : optionA , 
                            optionB : optionB , 
                            optionC : optionC , 
                            optionD : optionD 
                        } , 
                        image : imageFile,
                        correctOption : answer , 
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
                            FileHandler.moveFile(imageFile , "./public/uploads/profile" , "./public/uploads/schools/" + school.schoolCode + "/exam-" + exam.examCode) 
                            req.flash('success', `Question has been saved successfully`)
                            let redirectUrl = '/staff/cbt/school/' + req.params.examCode + '/' + req.params.subject + '/' + req.params.className + '/questions'
                            res.redirect(303, redirectUrl)
                        }
                    })
                }else{
                    let imageFile
                    if(req.file){
                        imageFile = req.file.filename
                    }else{
                        imageFile = null
                    }
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
                            image : imageFile,
                            correctOption : answer , 
                            mark : mark ,
                            questionNumber : 1
                        }] 
                    })
                    const saveQuestion = await que.save() 
                    if (saveQuestion) {
                        FileHandler.moveFile(imageFile , "./public/uploads/profile" , "./public/uploads/schools/" + school.schoolCode + "/exam-" + exam.examCode) 
                        req.flash('success', `Question has been saved successfully`)
                        let redirectUrl = '/staff/cbt/school/' + req.params.examCode + '/' + req.params.subject + '/' + req.params.className + '/questions'
                        res.redirect(redirectUrl)
                    }else {
                        throw {
                            message : "Unable to save the student"
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

    deleteSchoolQuestion = async (req, res, next) => {
        try{ 
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const session = await Session.findOne({school: school._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const exam = await Exam.findOne({
                    examCode : req.params.examCode, school : school._id,
                    session: session._id, term: term._id
                })
                const course = await Course.findOne({
                    exam: exam._id, examiner : staff._id,
                    courseName: req.params.subject,
                    className: req.params.className
                })
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
                            let redirectUrl = '/staff/cbt/school/' + req.params.examCode + '/' + req.params.subject + '/' + req.params.className + '/questions'
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

    publishSchoolQuestions = async (req, res, next) => {
        try{ 
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const session = await Session.findOne({school: staff.school, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const exam = await Exam.findOne({
                    examCode : req.params.examCode, school : staff.school,
                    session: session._id, term: term._id
                })
                const course = await Course.findOne({
                    exam: exam._id, examiner : staff._id,
                    courseName: req.params.subject,
                    className: req.params.className
                })
                if(course){
                    let courseID = course._id
                    Course.findByIdAndUpdate(courseID, {
                        publish : true,
                    }, {new : true, useAndModify : false}, (err , item) => {
                        if(err){
                            res.status(500)
                            return
                        }else {
                            let redirectUrl = '/staff/cbt/school/' + req.params.examCode + '/' + req.params.subject + '/' + req.params.className
                            res.redirect(303, redirectUrl)
                        }
                    })	
                }else{
                    throw 'Not found.'
                }
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    previewSchoolQuestions = async (req, res, next) => {
        try{ 
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({school: school._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const exam = await Exam.findOne({
                    examCode : req.params.examCode, school : school._id,
                    session: session._id, term: term._id
                })
                const courseDB = await Course.findOne({
                    exam: exam._id, examiner: staff._id,
                    courseName: req.params.subject,
                    className: req.params.className
                })
                const question = await Question.findOne({course : courseDB._id })
                if(question){
                    if(question.question.length > 5){
                        let currentQuestion 
                        if (req.query.question){
                            currentQuestion = Number(req.query.question)
                        }else {
                            currentQuestion = 1
                        }
                        res.render('school-preview', {title : "Preview", staff : staff,
                        code : school, exam : exam , questions : question,
                        course : courseDB , currentQuestion : question.question[currentQuestion - 1],
                        code : school.schoolCode, className : req.params.className})
                    }else{
                        res.render('school-preview', {title : 'Preview', staff : staff, code : school,
                        noQuestion : "You need to have up to 5 questions to preview.", exam : exam,
                        course : courseDB, className : req.params.className})
                    }
                }else{
                    res.render('school-preview', {title : 'Preview', staff : staff, code : school,
                    noQuestion : "No questions has been set yet.", exam : exam,
                    course : courseDB, className : req.params.className})
                }
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

}

const returnApp = new App()

module.exports = returnApp 