const SchoolAdmin = require('../model/schoolAdmin')
const Session = require('../model/session')
const Term = require('../model/term')
const ClassSchool = require('../model/classchool')
const Broadsheet = require('../model/broadsheet')
const Student = require('../model/student')
const Exam = require('../model/exam')
const Course = require('../model/course')
const Question = require('../model/question')
const Result = require('../model/result')
const Staff = require('../model/staff')
const Attendance = require('../model/attendance')

class App {

    getSessionPage = async(req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.find({school : schoolAdmin._id})
                const currentS = await Session.findOne({school: schoolAdmin, current: true})
                let sessS, termS
                if(currentS){
                    sessS = currentS.name
                    const currentT = await Term.findOne({session: currentS._id, current: true})
                    if(currentT){
                        termS = currentT.name
                    }else{
                        termS = "Term not set."
                    }
                }else{
                    sessS = "Session not set."
                }
                res.render('school-sessions', {title : "Sessions", session_active : "active",
                schoolAdmin : schoolAdmin, session : session, success : req.flash('success'),
                opensession_active: "pcoded-trigger", sessT_active: 'active', sessS: sessS,
                termS: termS, error: req.flash('error')})
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    postSession = async(req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
    
                const {name} = req.body
                const findSession = await Session.findOne({school: schoolAdmin._id, name})
                if(!findSession){
                    const session = await new Session({
                        name : name,
                        school : schoolAdmin._id,
                    })
                    const saveSession = await session.save()
                    if ( saveSession ) { 
                        req.flash('success', 'Session has been saved.')
                        res.redirect(303, '/school/session')
                        return 
                    }else {
                        throw {
                            message : "Unable to save the exam"
                        }
                    }
                }else{
                    req.flash('error', 'Session already exists.')
                    res.redirect(303, '/school/session')
                    return
                }
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    makeCurrent = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                Session.updateMany({school : schoolAdmin._id}, {
                        current : false
                }, {new : true, useAndModify : false}, (err , item) => {
                    if(err){
                        res.status(500)
                        return
                    }else {
                        Session.findByIdAndUpdate(req.params.sessionID, {
                            current : true
                        }, {new : true, useFindAndModify : false}, (err, item) => {
                            if(err){
                                console.log(err)
                            }
                            else{
                                req.flash('success', 'Session is now current!')
                                let redirectUrl = '/school/session'
                                res.redirect(303, redirectUrl)
                            }
                        })
                    }
                })	
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    currentTerm = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const findSession = await Session.findOne({_id: req.params.sessionID, current: true})
                if(findSession){
                    Term.updateMany({school : schoolAdmin._id, session: req.params.sessionID}, {
                            current : false
                    }, {new : true, useFindAndModify : false}, (err , item) => {
                        if(err){
                            res.status(500)
                            return
                        }else {
                            Term.findByIdAndUpdate(req.params.termID, {
                                current : true
                            }, {new : true, useFindAndModify : false}, (err, item) => {
                                if(err){
                                    console.log(err)
                                }
                                else{
                                    req.flash('success', 'Term is now current')
                                    let redirectUrl = '/school/session/' + req.params.sessionID
                                    res.redirect(303, redirectUrl)
                                }
                            })
                        }
                    })	
                }else{
                    req.flash('error', 'You need to make session current first!')
                    let redirectUrl = '/school/session/' + req.params.sessionID
                    res.redirect(303, redirectUrl)
                    return
                }
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    endSession = async (req, res, next) => {
        try{
            if(req.session.schoolCode){  
                Term.updateMany({session: req.params.sessionID}, {
                    ended : true
                }, {new : true, useFindAndModify : false}, (err , item) => {
                    if(err){
                        res.status(500)
                        return
                    }else {
                        Session.findByIdAndUpdate(req.params.sessionID, {
                            ended : true
                        }, {new : true, useFindAndModify : false}, (err, item) => {
                            if(err){
                                console.log(err)
                            }else{
                                let redirectUrl = '/school/session/'
                                res.redirect(303, redirectUrl)
                            }
                        })	
                    } 
                })        
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    endTerm = async (req, res, next) => {
        try{
            if(req.session.schoolCode){                
                Term.findByIdAndUpdate(req.params.termID, {
                    ended : true
                }, {new : true, useFindAndModify : false}, (err, item) => {
                    if(err){
                        console.log(err)
                    }
                    else{
                        let redirectUrl = '/school/session/' + req.params.sessionID
                        res.redirect(303, redirectUrl)
                    }
                })	
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    getTermPage = async(req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({school : schoolAdmin._id, _id : req.params.sessionID})
                const currentS = await Session.findOne({school: schoolAdmin, current: true})
                let sessS, termS
                if(currentS){
                    sessS = currentS.name
                    const currentT = await Term.findOne({session: currentS._id, current: true})
                    if(currentT){
                        termS = currentT.name
                    }else{
                        termS = "Term not set."
                    }
                }else{
                    sessS = "Session not set."
                }
                const term = await Term.find({session : session._id})
                res.render('school-term', {title : "Term", session_active : "active",  opensession_active: "pcoded-trigger",
                schoolAdmin : schoolAdmin, term : term, session : session, error : req.flash('error'),
                success : req.flash('success'), sessT_active: 'active', termS: termS,
                sessS: sessS})
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    postTerm = async(req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
    
                const {name, startDate, endDate} = req.body
                const findTerm = await Term.findOne({session: req.params.sessionID, name})
                if(!findTerm){
                    const term = await new Term({
                        name : name,
                        school : schoolAdmin._id,
                        startDate : startDate,
                        endDate : endDate,
                        session : req.params.sessionID
                    })
                    const saveTerm = await term.save()
                    if ( saveTerm ) { 
                        req.flash('success', 'Term has been saved.')
                        let redirectUrl = "/school/session/" + req.params.sessionID
                        res.redirect(303, redirectUrl)
                        return 
                    }else {
                        throw {
                            message : "Unable to save the Term."
                        }
                    }
                }else{
                    req.flash('error', 'Term already exists!')
                    let redirectUrl = "/school/session/" + req.params.sessionID
                    res.redirect(303, redirectUrl)
                    return 
                }
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    populateTerm = async (req, res, next) => {
        const term = await Term.find({session : req.body.session})
        res.json(term)
    }

    getManageSessions = async(req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.find({school : schoolAdmin._id})
                const currentS = await Session.findOne({school: schoolAdmin, current: true})
                let sessS, termS
                if(currentS){
                    sessS = currentS.name
                    const currentT = await Term.findOne({session: currentS._id, current: true})
                    if(currentT){
                        termS = currentT.name
                    }else{
                        termS = "Term not set."
                    }
                }else{
                    sessS = "Session not set."
                }

                res.render('school-manage-sessions', {title : "Manage Sessions", manage_active : "active", 
                schoolAdmin : schoolAdmin, session : session, 
                termS: termS, sessS: sessS})

            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    getManageTerm = async(req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({school : schoolAdmin._id, _id: req.params.sessionID})
                const term = await Term.find({session: session._id, ended: true})
                    
                res.render('school-manage-terms', {title : "Manage Term", manage_active : "active", 
                schoolAdmin : schoolAdmin, session : session, terms: term,
                sessS: session.name})

            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    getTermActivities = async(req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({school : schoolAdmin._id, _id: req.params.sessionID})
                const term = await Term.findOne({session: session._id, name: req.params.termName})
                    
                res.render('term-activities', {title : "Activities", manage_active : "active", 
                schoolAdmin : schoolAdmin, session : session, term: term, termS: term.name,
                sessS: session.name})

            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    getTermResultsClasses = async(req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({school : schoolAdmin._id, _id: req.params.sessionID})
                const term = await Term.findOne({session: session._id, name: req.params.termName})
                const classes = await ClassSchool.find({school: schoolAdmin._id})
                    
                res.render('term-results-classes', {title : "Classes", manage_active : "active", 
                schoolAdmin : schoolAdmin, session : session, term: term, termS: term.name,
                sessS: session.name, classes: classes})

            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    getTermResults = async(req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({school : schoolAdmin._id, _id: req.params.sessionID})
                const term = await Term.findOne({session: session._id, name: req.params.termName})
                if(term.name == 'Third Term'){
                    let redirectUrl = '/school/manage-sessions/' + req.params.sessionID + '/' + req.params.termName + '/results/' + req.params.className + '/third'
                    res.redirect(303, redirectUrl)
                    return
                }
                const broadsheet = await Broadsheet.find({
                    session: session._id, term: term.id,
                    className: req.params.className, school: schoolAdmin._id
                })
                const title = 'Broadsheet for ' + session.name + ', ' + term.name 

                const students = await Student.find({school: schoolAdmin._id})

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
                    
                res.render('term-results', {title : title, manage_active : "active", 
                schoolAdmin : schoolAdmin, session : session, term: term, termS: term.name,
                sessS: session.name, broadsheet: resultArray, className: req.params.className,
                firstResult: firstResult, studentName, studentID})

            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    getTermResultsThird = async(req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({school : schoolAdmin._id, _id: req.params.sessionID})
                const term = await Term.findOne({session: session._id, name: req.params.termName})
                if(term.name != 'Third Term'){
                    let redirectUrl = '/school/manage-sessions/' + req.params.sessionID + '/' + req.params.termName + '/results/' + req.params.className
                    res.redirect(303, redirectUrl)
                    return
                }
                const broadsheet = await Broadsheet.find({
                    session: session._id, term: term.id,
                    className: req.params.className, school: schoolAdmin._id
                })
                const title = 'Broadsheet for ' + session.name + ', ' + term.name 

                const students = await Student.find({school: schoolAdmin._id})

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
                    
                res.render('term-results-third', {title : title, manage_active : "active", 
                schoolAdmin : schoolAdmin, session : session, term: term, termS: term.name,
                sessS: session.name, broadsheet: resultArray, className: req.params.className,
                firstResult: firstResult, studentName, studentID})

            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    getReportCard = async(req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode: req.session.schoolCode})
                const session = await Session.findOne({school : schoolAdmin._id, _id: req.params.sessionID})
                const term = await Term.findOne({session: session._id, name: req.params.termName})
                const broadsheet = await Broadsheet.findOne({
                    session: session._id, term: term._id,
                    _id: req.params.cardID,
                    school: schoolAdmin._id
                })
                const student = await Student.findOne({_id: broadsheet.student})
               
                res.render('term-report-card', {title : "Report Card", manage_active : "active", 
                schoolAdmin : schoolAdmin, session : session, term: term, termS: term.name,
                sessS: session.name, broadsheet, students: student, pClass: req.params.className })
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error: err})
        }
    }

    getReportCardThird = async(req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode: req.session.schoolCode})
                const session = await Session.findOne({school : schoolAdmin._id, _id: req.params.sessionID})
                const term = await Term.findOne({session: session._id, name: req.params.termName})
                const broadsheet = await Broadsheet.findOne({
                    session: session._id, term: term._id,
                    _id: req.params.cardID,
                    school: schoolAdmin._id
                })
                const student = await Student.findOne({_id: broadsheet.student})
               
                res.render('term-report-card-third', {title : "Report Card", manage_active : "active", 
                schoolAdmin : schoolAdmin, session : session, term: term, termS: term.name,
                sessS: session.name, broadsheet, students: student })
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error: err})
        }
    }

    getCBTExams = async(req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({school : schoolAdmin._id, _id: req.params.sessionID})
                const term = await Term.findOne({session: session._id, name: req.params.termName})
                const exam = await Exam.find({
                    session: session._id, term: term._id,
                    quickOwner: {$exists : false}
                })   
                res.render('session-cbt-exams', {title : "Exams", manage_active : "active", 
                schoolAdmin : schoolAdmin, session : session, term: term, termS: term.name,
                sessS: session.name, exam: exam})

            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    getCBTQuestions = async(req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({school : schoolAdmin._id, _id: req.params.sessionID})
                const term = await Term.findOne({session: session._id, name: req.params.termName})
                const exam = await Exam.findOne({
                    _id: req.params.examID,
                    school: schoolAdmin._id
                })
                const courses = await Course.find({school : schoolAdmin._id, exam : exam._id, publish : true})

                res.render('session-cbt-questions', {title : "Exams", manage_active : "active", 
                schoolAdmin : schoolAdmin, session : session, term: term, termS: term.name,
                sessS: session.name, exam: exam, courses})

            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    getCBTResults = async(req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({school : schoolAdmin._id, _id: req.params.sessionID})
                const term = await Term.findOne({session: session._id, name: req.params.termName})
                const exam = await Exam.findOne({
                    _id: req.params.examID
                })
                const classes = await ClassSchool.find({school: schoolAdmin._id})
                  
                res.render('session-cbt-results', {title : "Results", manage_active : "active", 
                schoolAdmin : schoolAdmin, session : session, term: term, termS: term.name,
                sessS: session.name, exam: exam, classes})

            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    getMainQuestion = async(req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({school : schoolAdmin._id, _id: req.params.sessionID})
                const term = await Term.findOne({session: session._id, name: req.params.termName})
                const exam = await Exam.findOne({
                    _id: req.params.examID
                })  
                const course = await Course.findOne({_id: req.params.courseID})
                const question = await Question.findOne({
                    course : req.params.courseID, school : schoolAdmin._id
                })
                res.render('session-main-question', {title : "Questions", manage_active : "active", 
                schoolAdmin : schoolAdmin, session : session, term: term, termS: term.name,
                sessS: session.name, exam: exam, questions: question, course})

            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    getMainResults = async(req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({school : schoolAdmin._id, _id: req.params.sessionID})
                const term = await Term.findOne({session: session._id, name: req.params.termName})
                const exam = await Exam.findOne({
                    _id: req.params.examID
                })  

                let className = req.params.className
                const result = await Result.find({
                    className : className, 
                    school : schoolAdmin._id,
                    exam: exam._id
                })
                const students = await Student.find({school: schoolAdmin._id})

                let studentName = {}
                let studentID = {}
                students.map(student => {
                    studentName[student._id] = student.firstName + " " + student.lastName
                    studentID[student._id] = student.studentID
                })
  
                const resultArray = result.map(item => {
                    item.results = item.result.sort((a,b) => (a.courseName > b.courseName) ? 1 : -1)
                    return item
                })

                const firstResult = resultArray[0]

                res.render('session-main-result', {title : "Results", manage_active : "active", 
                schoolAdmin : schoolAdmin, session : session, term: term, termS: term.name,
                sessS: session.name, exam: exam, firstResult, results : resultArray,
                studentName, studentID, className})

            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    getAttendanceClasses = async(req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({school : schoolAdmin._id, _id: req.params.sessionID})
                const term = await Term.findOne({session: session._id, name: req.params.termName})
                const classes = await ClassSchool.find({school: schoolAdmin._id})
                    
                res.render('term-attendance-classes', {title : "Classes", manage_active : "active", 
                schoolAdmin : schoolAdmin, session : session, term: term, termS: term.name,
                sessS: session.name, classes: classes})

            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    redirectToAttendance = (req, res, next) => {
        try{
            if(req.session.schoolCode){
                let redirectUrl = '/school/manage-sessions/' + req.params.sessionID + '/' + req.params.termName + '/attendance/' + req.params.className + '/1'
                res.redirect(303, redirectUrl)
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error: err})
        }
    }

    getEachAttendance = async(req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({school : schoolAdmin._id, _id: req.params.sessionID})
                const term = await Term.findOne({session: session._id, name: req.params.termName})
                const classchool = await ClassSchool.findOne({school: schoolAdmin._id, name: req.params.className})
                const students = await Student.find({school: schoolAdmin._id})
                const attendance = await Attendance.find({
                    session: session._id,
                    term: term._id,
                    className: classchool._id
                })
                let studentName = {}
                students.map(student => 
                    studentName[student._id] = student.lastName + " " + student.firstName + " " + student.otherName
                )

                if(attendance.length > 0){
                    let week1Attendance = attendance.map(week => {
                        week.attendance = week.attendance.filter(w => {
                            return w.week == req.params.week
                        })
                        return week
                    })

                    week1Attendance.map(week => {
                        week.attendance = week.attendance.sort((a, b) => {
                            return new Date(a.date) - new Date(b.date)
                        })
                        return week
                    })
                    
                    const attendanceWeek = week1Attendance[0].attendance

                    let weekday = new Array(7)
                    weekday[0] = "S"
                    weekday[1] = "M"
                    weekday[2] = "T"
                    weekday[3] = "W"
                    weekday[4] = "Th"
                    weekday[5] = "F"
                    weekday[6] = "S"

                    res.render('term-attendance', {title : "Classes", manage_active : "active", 
                    schoolAdmin : schoolAdmin, session : session, term: term, termS: term.name,
                    sessS: session.name, week: req.params.week, attendanceWeek : attendanceWeek,
                    studentName: studentName, attendance: week1Attendance, weekday, pClass: req.params.className})

                }else{
                    res.render('term-attendance', {title : "Classes", manage_active : "active", 
                    schoolAdmin : schoolAdmin, session : session, term: term, termS: term.name,
                    sessS: session.name, studentName: studentName, attendance: attendance,
                    pClass: req.params.className})
                }

            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    getManageSessionsStaff = async(req, res, next) => {
        try{
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const session = await Session.find({school : staff.school})
                const currentS = await Session.findOne({school: staff.school, current: true})
                let sessS, termS
                if(currentS){
                    sessS = currentS.name
                    const currentT = await Term.findOne({session: currentS._id, current: true})
                    if(currentT){
                        termS = currentT.name
                    }else{
                        termS = "Term not set."
                    }
                }else{
                    sessS = "Session not set."
                }

                res.render('staff-manage-sessions', {title : "Manage Sessions", manage_active : "active", 
                staff: staff, session : session, 
                termS: termS, sessS: sessS})

            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    getManageTermStaff = async(req, res, next) => {
        try{
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const session = await Session.findOne({school : staff.school, _id: req.params.sessionID})
                const term = await Term.find({session: session._id, ended: true})
                    
                res.render('staff-manage-terms', {title : "Manage Term", manage_active : "active", 
                staff, session : session, terms: term,
                sessS: session.name})

            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    getTermActivitiesStaff = async(req, res, next) => {
        try{
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const session = await Session.findOne({school : staff.school, _id: req.params.sessionID})
                const term = await Term.findOne({session: session._id, name: req.params.termName})
                    
                res.render('staff-term-activities', {title : "Activities", manage_active : "active", 
                staff, session : session, term: term, termS: term.name,
                sessS: session.name})

            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    getManageSessionsStudent = async(req, res, next) => {
        try{
            if(req.session.regNumber){
                const student = await Student.findOne({studentID : req.session.regNumber})
                const session = await Session.find({school : student.school})
                const currentS = await Session.findOne({school: student.school, current: true})
                let sessS, termS
                if(currentS){
                    sessS = currentS.name
                    const currentT = await Term.findOne({session: currentS._id, current: true})
                    if(currentT){
                        termS = currentT.name
                    }else{
                        termS = "Term not set."
                    }
                }else{
                    sessS = "Session not set."
                }

                res.render('student-manage-sessions', {title : "Manage Sessions", manage_active : "active", 
                student, session : session, 
                termS: termS, sessS: sessS})

            }else{
                res.redirect(303, '/student')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    getManageTermStudent = async(req, res, next) => {
        try{
            if(req.session.regNumber){
                const student = await Student.findOne({studentID : req.session.regNumber})
                const session = await Session.findOne({school : student.school, _id: req.params.sessionID})
                const term = await Term.find({session: session._id, ended: true})
                    
                res.render('student-manage-terms', {title : "Manage Term", manage_active : "active", 
                student, session : session, terms: term,
                sessS: session.name})

            }else{
                res.redirect(303, '/student')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    getTermActivitiesStudent = async(req, res, next) => {
        try{
            if(req.session.regNumber){
                const student = await Student.findOne({studentID : req.session.regNumber})
                const session = await Session.findOne({school : student.school, _id: req.params.sessionID})
                const term = await Term.findOne({session: session._id, name: req.params.termName})
                    
                res.render('student-term-activities', {title : "Activities", manage_active : "active", 
                student, session : session, term: term, termS: term.name,
                sessS: session.name})

            }else{
                res.redirect(303, '/student')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

}

const returnApp = new App()

module.exports = returnApp 