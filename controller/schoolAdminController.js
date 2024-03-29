const fs = require('fs')
const path = require('path')
const fileName = __filename
const dirName = path.dirname(fileName)

const FileHandler = require('./file')
const GenerateAccount = require('./accountGenerator')
const bcrypt = require('bcryptjs')

const SchoolAdmin = require('../model/schoolAdmin')
const Session = require('../model/session')
const Term = require('../model/term')
const Subject = require('../model/subject')
const Staff = require('../model/staff')
const Student = require('../model/student')
const Exam = require('../model/exam')
const Course = require('../model/course')
const ClassSchool = require('../model/classchool')
const Result = require('../model/result')
const Question = require('../model/question')
const Attendance = require('../model/attendance')
const LessonNotes = require('../model/lessonNote')
const Broadsheet = require('../model/broadsheet')
const Parent = require('../model/parent')
const Role = require('../model/role')
const PaymentType = require('../model/paymentType')
const subject = require('../model/subject')

class App { 

    getSchoolLogin = (req, res, next) => {
        res.render('school-login', {title : "School Login"})
    }

    postSchoolAdminLogin = async (req , res , next) => {
        try { 
            const {schoolCode, email, password} = req.body
            let school = await SchoolAdmin.findOne({schoolCode : schoolCode, schoolEmail : email}) 
            console.log(school) 
            if(school){
                let validSchool = await bcrypt.compare(password , school.password)
                if (validSchool) {
                    req.session.schoolCode = school.schoolCode
                    res.redirect(303, '/school/dashboard')
                }else {
                    res.render('school-login' , { error : 'Invalid Credentials'})
                }
            }else {
                res.render('school-login' , { error : 'Invalid school'})
            }  
        }catch(errors) {
            res.render('error-page', {error : errors})
        }
    }

    getSchoolSignup = (req, res, next) => {
        res.render('school-signup', {title : "Create an account"})
    }
    
    getForgotPassword = (req, res, next) => {
        res.render('forgot_password', {title : "Password Reset"})
    }

    postSchoolAdminSignUp = async (req, res, next) => {
        try{
            const {schoolName, schoolNumber, password, schoolEmail, 
                schoolAdminName, address, state, country} = req.body
            
            const checkSchool = await SchoolAdmin.find({ $or : [{schoolName : schoolName}, {schoolEmail : schoolEmail}]})
            if(checkSchool.length == 0){

                const schoolPass = await bcrypt.hash(password , 10)
                
                const schoolAdmin = await new SchoolAdmin({
                    schoolName : schoolName ,  
                    schoolEmail : schoolEmail , 
                    schoolNumber : schoolNumber,
                    schoolAdmin : schoolAdminName, 
                    password : schoolPass, 
                    address  : address,
                    state : state,
                    country : country
                })
                const saveAdmin = await schoolAdmin.save()
                if ( saveAdmin ) { 
                    let redirectUrl = "/school/verify/" + saveAdmin._id
                    res.redirect(redirectUrl)
                    return 
                }else{
                    throw{
                        message : "Unable to save the school admin"
                    }
                }
            }else{
                res.render('school-signup', {title : "Create an account", error : "Account already exists."})
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    verifyEmail = async (req, res, next) => {
        try{
            if(req.params.schoolID){
                const schoolAdmin = await SchoolAdmin.findOne({_id : req.params.schoolID})
                if(schoolAdmin){
                    res.render('verify-page', {schoolAdmin : schoolAdmin, title : "Verify Email"})
                }else{
                    throw{
                        message : "You can't access this page."
                    }
                }
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    getDashboard = async (req , res , next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const student = await Student.find({school : schoolAdmin._id})
                const classchool = await ClassSchool.find({school : schoolAdmin._id})
                const staff = await Staff.find({school : schoolAdmin._id})
                const exams = await Exam.find({school : schoolAdmin._id})
                const progress = await Course.find({school : schoolAdmin._id, release : true})
                const session = await Session.findOne({school : schoolAdmin._id, current : true})
                const paymentType = await PaymentType.find({school: schoolAdmin._id})
                const roles = await Role.find({school: schoolAdmin._id})

                let sessionS, termS
                if(session){
                    sessionS = session.name
                    const term = await Term.findOne({session: session._id, current: true})
                    if(term){
                        termS = term.name
                    }else{
                        termS = "Term not set."
                    }
                }else{
                    sessionS = "Session not set."
                }
               
                res.render('school-admin-dashboard' , { title  : "Admin Dashboard", schoolAdmin : schoolAdmin, students : student.length,
                classes : classchool.length, exams : exams.length, sessS : sessionS,
                progress : progress.length, staffs : staff.length, dash_active : "active",
                termS: termS, paymentType: paymentType.length, roles: roles.length})

            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    getSettings = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                res.render('school-settings', {title : 'Settings', schoolAdmin : schoolAdmin, 
                error : req.flash('error'), success : req.flash('success')})
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    changePassword = async(req, res, next) => {
        try{
            if(req.session.schoolCode){
                const {oldPassword, newPassword, cNewPassword} = req.body
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                if(newPassword == cNewPassword){
                    let validPassword = await bcrypt.compare(oldPassword , schoolAdmin.password)
                    if(validPassword){
                        let harshedPassword = await bcrypt.hash(newPassword , 10)
                        SchoolAdmin.findByIdAndUpdate(schoolAdmin._id, {
                            password : harshedPassword
                        }, {new : true, useFindAndModify : false}, (err, item) => {
                            if(err) {
                                console.log(err)
                            }else {
                                res.json({message: "Password changed successfully.", status: 200})
                            }
                        })
                    }else{
                        res.json({message: "Old Password is incorrect", status: 500})
                    }
                }else{
                    res.json({message: "Passwords does not match.", status: 500})
                }
            }else{
                res.rson({message: "Access denied", status: 500})
            }
        }catch(err) {
            res.render('error-page', {error : err})
        }
    }

    getProfile = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                
                res.render('school-profile', {title : 'Profile', schoolAdmin : schoolAdmin, 
                error : req.flash('error'), success : req.flash('success')})

            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    updateLogo = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                if(req.file){
                    FileHandler.createDirectory("./public/uploads/schools/" + req.session.schoolCode + "/logo/")
                    SchoolAdmin.findByIdAndUpdate(schoolAdmin._id, {
                        logo : req.file.filename
                    }, {new : true, useFindAndModify : false}, (err , item) => {
                        if(err){
                            console.log(err)
                        }else{

                            FileHandler.moveFile(req.file.filename , "./public/uploads/profile" , "./public/uploads/schools/" + req.session.schoolCode + "/logo/") 

                            req.flash('success', 'Logo changed successfully')
                            res.redirect('/school/profile')
                        }
                    })
                }else{
                    req.flash('error', 'You need to upload an Image.')
                    res.redirect('/school/profile')
                }
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    getStudentsPage = async (req , res , next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                if(session){
                    const term = await Term.findOne({session: session._id, current: true})
                    if(term){
                        res.render("admin-student-page", {title : "Students", schoolAdmin : schoolAdmin,
                        error : req.flash('error'), success : req.flash('success'), student_active : "active",
                        users_active: 'active', openuser_active: "pcoded-trigger",
                        sessS: session.name, termS: term.name}) 
                    }else{
                        res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'Students',
                        users_active: 'active', openuser_active: "pcoded-trigger",
                        student_active : "active"})
                    }
                }else{
                    res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'Students',
                    users_active: 'active', openuser_active: "pcoded-trigger",
                    student_active : "active"})
                }
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    getAllStudents = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const classchool = await ClassSchool.find({school: schoolAdmin._id})

                res.render('all-students', {title: 'All Students', schoolAdmin: schoolAdmin,
                users_active: 'active', openuser_active: "pcoded-trigger", student_active : "active",
                sessS: session.name, termS: term.name, classchool: classchool})
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error: err})
        }
    }

    getImportStudents = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const classchool = await ClassSchool.find({school: schoolAdmin._id})

                res.render('import-students', {title: 'Import Students', schoolAdmin: schoolAdmin,
                users_active: 'active', openuser_active: "pcoded-trigger", student_active : "active",
                sessS: session.name, termS: term.name, classchool: classchool})
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error: err})
        }
    }

    getAllClasses = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const classchool = await ClassSchool.find({school: schoolAdmin._id})

                res.render('import-class-students', {title: 'Import Students', schoolAdmin: schoolAdmin,
                users_active: 'active', openuser_active: "pcoded-trigger", student_active : "active",
                sessS: session.name, termS: term.name, classchool: classchool})
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error: err})
        }
    }

    getImportEachClass = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const classchool = await ClassSchool.findOne({school: schoolAdmin._id, name: req.params.className})

                res.render('import-each-student', {title: 'Import Students', schoolAdmin: schoolAdmin,
                users_active: 'active', openuser_active: "pcoded-trigger", student_active : "active",
                sessS: session.name, termS: term.name, classchool: classchool})
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error: err})
        }
    }

    importEachClass = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const classes = await ClassSchool.findOne({school: schoolAdmin._id, name: req.params.className})
                let {name}  = req.body  
                let count = name.length 
                while ( count > 0){
                    for( let student of name){
                        let totalStudent = await Student.find({school: schoolAdmin._id})
                        let start, code
                        if(schoolAdmin.demo){
                            start = "0" + schoolAdmin.demoCode
                            code = `D${GenerateAccount(totalStudent, start, "studentID", 1, 3)}`
                        }else{
                            start = req.session.schoolCode + "001"
                            code = `S${GenerateAccount(totalStudent, start, "studentID", 1, 6)}`
                        }
                
                        let studentPass = await bcrypt.hash(student.LastName.toUpperCase() , 10)

                        const newStudent = await new Student({
                            firstName: student.FirstName,
                            lastName: student.LastName,
                            otherName: student.OtherName,
                            className: classes._id,
                            school: schoolAdmin._id,
                            bloodGroup: student.BloodGroup,
                            religion: student.Religion,
                            parentsNumber: student.ParentsNo,
                            address: student.Address,
                            gender: student.Gender,
                            password: studentPass,
                            studentID : code,
                            dateOfBirth: student.DateOfBirth
                        })
                        await newStudent.save()  
                        console.log("The record was created")
                        
                        count -= 1
                    }
                }

                res.json({message: 'Import completed! You will be redirected in 3 seconds.'})
            }else{
                res.json({message: 'Access denied!'})
            }
        }catch(err){
            res.json({message: err})
        }
    }

    getAllStudentImport = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})

                res.render('import-all-students', {title: 'Import Students', schoolAdmin: schoolAdmin,
                users_active: 'active', openuser_active: "pcoded-trigger", student_active : "active",
                sessS: session.name, termS: term.name})
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error: err})
        }
    }

    allStudentImport = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                let {name}  = req.body  
                let count = name.length 
                while ( count > 0){
                    for( let student of name){
                        let totalStudent = await Student.find({school: schoolAdmin._id})
                        let classname = await ClassSchool.findOne({school : schoolAdmin._id, name: student.Class}) 
                        let start, code
                        if(schoolAdmin.demo){
                            start = "0" + schoolAdmin.demoCode
                            code = `D${GenerateAccount(totalStudent, start, "studentID", 1, 3)}`
                        }else{
                            start = req.session.schoolCode + "001"
                            code = `S${GenerateAccount(totalStudent, start, "studentID", 1, 6)}`
                        }
                
                        let studentPass = await bcrypt.hash(student.LastName.toUpperCase() , 10)
                        if(classname){
                            const newStudent = await new Student({
                                firstName: student.FirstName,
                                lastName: student.LastName,
                                otherName: student.OtherName,
                                className: classname._id,
                                school: schoolAdmin._id,
                                bloodGroup: student.BloodGroup,
                                religion: student.Religion,
                                parentsNumber: student.ParentsNo,
                                address: student.Address,
                                gender: student.Gender,
                                password: studentPass,
                                studentID : code,
                                dateOfBirth: student.DateOfBirth
                            })
                            await newStudent.save()  
                            console.log("The record was created")
                        }else{
                            console.log('No Class found.')
                        } 
                        count -= 1
                    }
                }

                res.json({message: 'Import completed! You will be redirected in 3 seconds.'})
            }else{
                res.json({message: 'Access denied!'})
            }
        }catch(err){
            res.json({message: err})
        }
    }

    getSuspendedStudents = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const classchool = await ClassSchool.find({school: schoolAdmin._id})

                res.render('suspended-students', {title: 'Suspended Students', schoolAdmin: schoolAdmin,
                users_active: 'active', openuser_active: "pcoded-trigger", student_active : "active",
                sessS: session.name, termS: term.name, classchool: classchool})
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error: err})
        }
    }

    getRevokedStudents = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const classchool = await ClassSchool.find({school: schoolAdmin._id})

                res.render('revoked-students', {title: 'Revoked Students', schoolAdmin: schoolAdmin,
                users_active: 'active', openuser_active: "pcoded-trigger", student_active : "active",
                sessS: session.name, termS: term.name, classchool: classchool})
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error: err})
        }
    }


    getPromotedStudents = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const classchool = await ClassSchool.find({school: schoolAdmin._id})

                res.render('promote-students', {title: 'Promote Students', schoolAdmin: schoolAdmin,
                users_active: 'active', openuser_active: "pcoded-trigger", student_active : "active",
                sessS: session.name, termS: term.name, classchool: classchool})
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error: err})
        }
    }

    promoteEachClass = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const students = await Student.find({school: schoolAdmin._id, className: req.params.classID, status: 'Active'})
                const classname = await ClassSchool.findOne({_id: req.params.classID})
                const classchool = await ClassSchool.find({school: schoolAdmin._id})

                res.render('promote-class', {title: 'Promote Students', schoolAdmin: schoolAdmin,
                users_active: 'active', openuser_active: "pcoded-trigger", student_active : "active",
                sessS: session.name, termS: term.name, students: students, pClass : classname,
                classchool: classchool})

            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error: err})
        }
    }

    postPromote = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const {target, classID} = req.body
                let count = target.length 
                while(count > 0){ 
                    for (let student of target){ 
                        
                        await Student.findByIdAndUpdate(student.id, {
                            className: classID
                        }, {
                            new : true, 
                            useFindAndModify : false
                            }
                        ) 
                        console.log("Updated successfully")
                        count -= 1 
                    }
                }
                res.json({message: 'Students have been promoted!'})
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error: err})
        }
    }

    getGraduatedStudents = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const classchool = await ClassSchool.find({school: schoolAdmin._id})

                res.render('graduate-students', {title: 'Graduate Students', schoolAdmin: schoolAdmin,
                users_active: 'active', openuser_active: "pcoded-trigger", student_active : "active",
                sessS: session.name, termS: term.name, classchool: classchool})
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error: err})
        }
    }

    graduateEachClass = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const students = await Student.find({school: schoolAdmin._id, className: req.params.classID, status: 'Active'})
                const classname = await ClassSchool.findOne({_id: req.params.classID})
                const classchool = await ClassSchool.find({school: schoolAdmin._id})

                res.render('graduate-class', {title: 'Graduate Students', schoolAdmin: schoolAdmin,
                users_active: 'active', openuser_active: "pcoded-trigger", student_active : "active",
                sessS: session.name, termS: term.name, students: students, pClass : classname,
                classchool: classchool})

            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error: err})
        }
    }

    postGraduate = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const {target, classID} = req.body
                let count = target.length 
                while(count > 0){ 
                    for (let student of target){ 
                        
                        await Student.findByIdAndUpdate(student.id, {
                            className: null ,
                            status : 'Graduated'
                        }, {
                            new : true, 
                            useFindAndModify : false
                            }
                        ) 
                        console.log("Updated successfully")
                        count -= 1 
                    }
                }
                res.json({message: 'Students have been graduated!'})
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error: err})
        }
    }

    getAllGraduates = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const students = await Student.find({school: schoolAdmin._id , status: 'Graduated'})

                res.render('graduates', {title: 'Graduated Students', schoolAdmin: schoolAdmin,
                users_active: 'active', openuser_active: "pcoded-trigger", student_active : "active",
                sessS: session.name, termS: term.name, students: students})

            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error: err})
        }
    }

    fetchClassStudents = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                if(req.body.title == 'All Students'){
                    const students = await Student.find({school: schoolAdmin._id, className: req.body.className})
                    let filterStudents = students.filter(s => s.status == 'Active' || s.status == 'Suspended')
                    console.log(students)
    
                    if(filterStudents.length > 0 ){
                        res.json({message: filterStudents})
                    }else{
                        res.json({status: 404, message: 'No Students found.'})
                    }
                }else if(req.body.title == 'Suspended Students'){
                    const suspended = await Student.find({school: schoolAdmin._id, className: req.body.className, status: 'Suspended'})
                    if(suspended.length > 0 ){
                        res.json({message: suspended})
                    }else{
                        res.json({status: 404, message: 'No Students found.'})
                    }
                } else if(req.body.title == 'Revoked Students'){
                    const revoked = await Student.find({school: schoolAdmin._id, className: req.body.className, status: 'Revoked'})
                    if(revoked.length > 0 ){
                        res.json({message: revoked})
                    }else{
                        res.json({status: 404, message: 'No Students found.'})
                    }
                }
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.json({error: err})
        }
    }

    getNewStudent = async (req , res , next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const classchool = await ClassSchool.find({school : schoolAdmin._id})
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                if(session){
                    const term = await Term.findOne({session: session._id, current: true})
                    if(term){
                        res.render("new-student", {title : "New Student", schoolAdmin : schoolAdmin, classchool : classchool,
                        error : req.flash('error'), success : req.flash('success'), student_active : "active",
                        users_active: 'active', openuser_active: "pcoded-trigger",
                        sessS: session.name, termS: term.name}) 
                    }else{
                        res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'New Student',
                        users_active: 'active', openuser_active: "pcoded-trigger",
                        student_active : "active"})
                    }
                }else{
                    res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'New Student',
                    users_active: 'active', openuser_active: "pcoded-trigger",
                    student_active : "active"})
                }
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    postStudents = async (req , res , next) => { 
        try{
		    if(req.session.schoolCode){
 
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const {firstName , lastName, otherName, gender, className, pNumber,
                        address, blood, religion, dob} = req.body
                const totalStudent = await Student.find({school : schoolAdmin._id})
                let start, code
                if(schoolAdmin.demo){
                    start = "0" + schoolAdmin.demoCode
                    code = `D${GenerateAccount(totalStudent, start, "studentID", 1, 3)}`
                }else{
                    start = req.session.schoolCode + "001"
                    code = `S${GenerateAccount(totalStudent, start, "studentID", 1, 6)}`
                }
                
                const studentPass = await bcrypt.hash(lastName.toUpperCase() , 10)
                
                const student = await new Student({
                    firstName : firstName ,  
                    lastName : lastName , 
                    otherName : otherName, 
                    password : studentPass, 
                    gender  : gender,
                    studentID : code,
                    className : className,
                    school : schoolAdmin._id,
                    bloodGroup : blood,
                    religion : religion,
                    dateOfBirth : dob,
                    parentsNumber : pNumber,
                    address: address
                })
                const saveStudent = await student.save()
                if ( saveStudent ) { 
                    let redirectUrl = "/school/new-student/" + saveStudent._id + "/complete"
                    res.redirect(redirectUrl)
                    return 
                }else {
                    throw {
                        message : "Unable to save the exam"
                    }
                }
                	
            }else {
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    getComplete = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const student = await Student.findOne({_id : req.params.studentID})
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                if(student){
                    res.render("complete-reg", {title : "Upload Image", mainStudent : student, 
                    schoolAdmin : schoolAdmin, student_active : "active",
                    users_active: 'active', openuser_active: "pcoded-trigger",
                    sessS: session.name, termS: term.name})
                }else{
                    throw {
                        message : "You can't access this page. No Registration Number to access it."
                    }
                }
            }else{
                res.redirect('303', '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    completeStudentReg = async(req, res, next) => {
        try{
            if(req.session.schoolCode){
                const confirmStudent = await Student.findOne({_id : req.params.studentID})
                let checkClass = await ClassSchool.findOne({_id : confirmStudent.className})
                if (req.file) { 
                    const ID = req.params.studentID
                    const originalName = ID + "-" + req.file.originalname 
                    Student.findByIdAndUpdate(ID , {
                        profilePhoto : originalName
                    } ,{new : true, useAndModify : false}, (err , item) => {
                        if(err){
                            res.status(500)
                            return
                        }else{
                            FileHandler.moveFile(originalName , "./public/uploads/profile" , "./public/uploads/schools/" + req.session.schoolCode + "/" + checkClass.name + "/") 
                            
                            req.flash('success', "Successfully created. You can also see this student in the classes page.")
                            let redirectUrl = '/school/new-student/' + req.params.studentID  
                            res.redirect(303, redirectUrl)

                        }
                    })
                }else {
                    throw{
                        name : "File Error",
                        message : "File not found."
                    }
                }
            }else {
                res.redirect(303, '/school')
            }  
        }catch(err){
            res.render('error-page', {error : err})
        }  
    }

    getSingleStudent = async (req , res , next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                let validStudent = await Student.findOne({_id : req.params.studentID})
                let checkClass = await ClassSchool.findOne({_id : validStudent.className})
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                if(validStudent){
                    res.render('singlestudent' , { title  : "Student", studentDB: validStudent, 
                    schoolAdmin : schoolAdmin, studentClass : checkClass, 
                    success : req.flash('success'), student_active : "active",
                    users_active: 'active', openuser_active: "pcoded-trigger",
                    sessS: session.name, termS: term.name})
                }else{
                    throw{
                        message : "Student not found"
                    }
                }
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }
    
    updateSingleStudent = async(req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                let student = await Student.findOne({_id : req.params.studentID})
                let checkClass = await ClassSchool.findOne({_id : student.className})
                if(student){	
                    if(req.file){
                        FileHandler.deleteFile("./public/uploads/schools/"+ req.session.schoolCode + "/" + checkClass.name + "/" + student.profilePhoto) 
                        let originalName = req.params.studentID + "-" + req.file.originalname
                        Student.findByIdAndUpdate(req.params.studentID, {
                            profilePhoto : originalName,
                            firstName : req.body.firstName,
                            lastName : req.body.lastName,
                            gender : req.body.gender,
                            dateOfBirth : new Date(req.body.dateOfBirth),
                            otherName : req.body.otherName ,
                            status : req.body.status
                        }, {new : true, useAndModify : false}, (err , item) => {
                            if(err){
                                res.status(500)
                                return
                            }else {
                                req.flash('success', "Update was successful.")
                                let redirectUrl = "/school/new-student/" + req.params.studentID
                                res.redirect(303, redirectUrl)

                                const source = "../public/uploads/profile/" + originalName
                                const destination = "../public/uploads/schools/" + req.session.schoolCode + '/' + checkClass.name + "/" + originalName
                                fs.rename((path.join(dirName , source)) , (path.join(dirName , destination)), err => {
                                    if(err){
                                        console.error(err)
                                    }else{
                                        console.log("File Moved")
                                    }
                                })
                            }
                        })	
                    }else{
                        Student.findByIdAndUpdate(req.params.studentID, {
                            firstName : req.body.firstName,
                            lastName : req.body.lastName,
                            gender : req.body.gender,
                            dateOfBirth : new Date(req.body.dateOfBirth) ,
                            otherName : req.body.otherName ,
                            status : req.body.status
                        }, {new : true, useFindAndModify : false}, (err , item) => {
                            if(err){
                                console.log(err)
                                res.send('Test')
                                res.status(500)
                                return
                            }else {
                                req.flash('success', "Update was successful.")
                                let redirectUrl = "/school/new-student/" + req.params.studentID
                                res.redirect(303, redirectUrl)
                            }
                        })	
                    }				   
                }else {
                    throw {
                        message : 'Student not found'
                    }
                    return
                }
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }
    
    getStaffs = async (req , res , next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                if(session){
                    const term = await Term.findOne({school: schoolAdmin._id, session: session._id, current: true})
                    if(term){
                        const staff= await Staff.find({school : schoolAdmin._id})
                        const roles = await Role.find({school: schoolAdmin._id})

                        let roleName = {}
                        roles.map(r => roleName[r.role] = r.name)

                        res.render("admin-staff" , {
                            staffs : staff ,
                            title : "Staffs",
                            schoolAdmin : schoolAdmin,
                            success : req.flash('success'),
                            staff_active : "active",
                            users_active: 'active',
                            openuser_active: "pcoded-trigger",
                            sessS: session.name,
                            termS: term.name,
                            roleName : roleName
                        })
                    }else{
                        res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'Staffs',
                        users_active: 'active', openuser_active: "pcoded-trigger",
                        staff_active : "active"})
                    }
                }else{
                    res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'Staffs',
                    users_active: 'active', openuser_active: "pcoded-trigger",
                    staff_active : "active"})
                }
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    getNewStaff = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const classchool = await ClassSchool.find({school : schoolAdmin._id})
                const subjects = await Subject.findOne({school : schoolAdmin._id})
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const roles = await Role.find({school: schoolAdmin._id})
                res.render('new-staff', {title : 'New Staff', schoolAdmin : schoolAdmin, className : classchool,
                error : req.flash('error'), staff_active : "active", subjects : subjects,
                staff_active : "active", users_active: 'active', sessS: session.name,
                openuser_active: "pcoded-trigger", termS: term.name, roles: roles})
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    confirmHeadClass = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const staff = await Staff.findOne({school : schoolAdmin._id, classHead : req.body.classHead})
                if(staff){
                    res.json({message : "A teacher is already head of the class you chose.", button : true})
                }else{
                    res.json({message : "Good!", button : false})
                }
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    postStaffs = async (req , res , next) => { 
        try{
		    if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const {firstName , lastName, otherName, email, number, gender, role, classHead} = req.body
                let checkStaffEmail = await Staff.findOne({email : email, school : schoolAdmin._id})
                let checkStaffNumber = await Staff.findOne({number : number, school : schoolAdmin._id})
                if(checkStaffEmail || checkStaffNumber){
                    req.flash('error', "Staff already exists.")
                    res.redirect('/school/staff/new')
                }else{
                    const totalStaff = await Staff.find({school : schoolAdmin._id})
                    let start, code
                    if(schoolAdmin.demo){
                        start = schoolAdmin.demoCode
                        code = `D${GenerateAccount(totalStaff, start, "staffID", 1, 2)}`
                    }else{
                        start = req.session.schoolCode + "01"
                        code = GenerateAccount(totalStaff, start, "staffID", 1, 5)
                    }
                    
                    const staffPass = await bcrypt.hash(lastName.toUpperCase() , 10)
                    const staff = await new Staff({
                        firstName : firstName ,  
                        lastName : lastName , 
                        otherName : otherName,
                        email : email, 
                        mobile : number, 
                        password : staffPass, 
                        gender  : gender,
                        role : role,
                        classHead : classHead,
                        school : schoolAdmin._id,
                        staffID : code
                    })
                    const saveStaff = await staff.save()
                    if ( saveStaff ) { 
                        let redirectUrl = "/school/staff/" + saveStaff._id + "/complete"
                        res.redirect(redirectUrl)
                        return 
                    }else {
                        throw {
                            message : "Unable to save this Staff"
                        }
                    }
                }
            }else {
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    } 
    
    getStaffComplete = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const getStaff = await Staff.findOne({_id : req.params.staffID})
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                if(getStaff){
                    res.render("complete-staffreg", {title : "Upload Image", 
                    getStaff : getStaff, schoolAdmin : schoolAdmin, 
                    staff_active : "active", users_active: 'active', 
                    openuser_active: "pcoded-trigger", sessS: session.name,
                    termS: term.name})
                }else{
                    throw {
                        message : "You can't access this page. No ID to access it."
                    }
                }
            }else{
                res.redirect('303', '/admin')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    completeStaffReg = async(req, res, next) => {
        try{
            if(req.session.schoolCode){
                const confirmStaff= await Staff.findOne({_id : req.params.staffID})
                if (req.file) {  
                    const ID = req.params.staffID
                    const originalName = ID + "-" + req.file.originalname 
                    Staff.findByIdAndUpdate(ID , {
                        profilePhoto : originalName
                    } ,{new : true, useAndModify : false}, (err , item) => {
                        if(err){
                            res.status(500)
                            return
                        }else{
                            FileHandler.moveFile(originalName , "./public/uploads/profile" , "./public/uploads/schools/" + req.session.schoolCode + "/staffs/") 
                            
                            req.flash('success', "The Staff has been added successfully.")
                            let redirectUrl = '/school/staff/' + req.params.staffID  
                            res.redirect(303, redirectUrl)
                        }
                    })
                }else {
                    throw{
                        name : "File Error",
                        message : "File not found."
                    }
                }
            }else {
                res.redirect(303, '/school')
            }    
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    getImportStaff = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})

                res.render('import-all-staff', {title: 'Import Staff', schoolAdmin: schoolAdmin,
                users_active: 'active', openuser_active: "pcoded-trigger", staff_active : "active",
                sessS: session.name, termS: term.name})
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error: err})
        }
    }

    importStaff = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                let {name}  = req.body  
                let count = name.length 
                while ( count > 0){
                    for( let staff of name){
                        let totalStaff = await Staff.find({school: schoolAdmin._id})
                        let start, code
                        if(schoolAdmin.demo){
                            start = schoolAdmin.demoCode
                            code = `D${GenerateAccount(totalStaff, start, "staffID", 1, 2)}`
                        }else{
                            start = req.session.schoolCode + "01"
                            code = GenerateAccount(totalStaff, start, "staffID", 1, 5)
                        }
                        let staffPass = await bcrypt.hash(staff.LastName.toUpperCase() , 10)
                        let classHead
                        if(staff.ClassHead){
                            let check = await ClassSchool.findOne({school: schoolAdmin._id, name: staff.ClassHead})
                            classHead = check._id
                        }
                        const newStaff = await new Staff({
                            firstName: staff.FirstName,
                            lastName: staff.LastName,
                            otherName: staff.OtherName,
                            email: staff.Email,
                            mobile: staff.PhoneNo,
                            school: schoolAdmin._id,
                            gender: staff.Gender,
                            password: staffPass,
                            staffID : code,
                            status: 'Active',
                            role: staff.Role,
                            classHead: classHead
                        })
                        await newStaff.save()  
                        console.log("The record was created")
                        
                        count -= 1
                    }
                }

                res.json({message: 'Import completed! You will be redirected in 3 seconds.'})
            }else{
                res.json({message: 'Access denied!'})
            }
        }catch(err){
            res.json({message: err})
        }
    }

    getSingleStaff = async (req , res , next) => {
        try{
            if(req.session.schoolCode){
                let validStaff = await Staff.findOne({_id : req.params.staffID})
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const roles = await Role.find({school: schoolAdmin._id})

                let roleName = {}
                roles.map(r => roleName[r.role] = r.name)
                if(validStaff){
                    res.render('singlestaff' , { title  : "Staff", staffDB: validStaff, 
                    schoolAdmin : schoolAdmin, success : req.flash('success'), staff_active : "active",
                    users_active: 'active', openuser_active: "pcoded-trigger",
                    sessS: session.name, termS: term.name, roleName: roleName})
                }else{
                    throw{
                        message : "Staff not found"
                    }
                }
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    updateSingleStaff = async(req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const staff = await Staff.findOne({_id : req.params.staffID})
                console.log(req.file)
                if(staff){	
                    if(req.file){
                        FileHandler.deleteFile("./public/uploads/schools/"+ req.session.schoolCode + "/staffs/" + staff.profilePhoto) 
                        
                        let originalName = req.params.staffID + "-" + req.file.originalname
                        Staff.findByIdAndUpdate(req.params.staffID, {
                            profilePhoto : originalName,
                            firstName : req.body.firstName,
                            lastName : req.body.lastName,
                            otherName : req.body.otherName,
                            email : req.body.email ,
                            status : req.body.status ,
                            terminationDate : req.body.terminationDate
                        }, {new : true, useAndModify : false}, (err , item) => {
                            if(err){
                                res.status(500)
                                return
                            }else {
                                req.flash('success', "Update was successful.")
                                let redirectUrl = "/school/staff/" + req.params.staffID
                                res.redirect(303, redirectUrl)

                                const source = "../public/uploads/profile/" + originalName
                                const destination = "../public/uploads/schools/" + req.session.schoolCode + '/staffs/' + originalName
                                fs.rename((path.join(dirName , source)) , (path.join(dirName , destination)), err => {
                                    if(err){
                                        console.error(err)
                                    }else{
                                        console.log("File Moved")
                                    }
                                })
                            }
                        })	
                    }else{
                        Staff.findByIdAndUpdate(req.params.staffID, {
                            firstName : req.body.firstName,
                            lastName : req.body.lastName,
                            otherName : req.body.otherName,
                            email : req.body.email ,
                            status : req.body.status ,
                            terminationDate : req.body.terminationDate
                        }, {new : true, useAndModify : false}, (err , item) => {
                            if(err){
                                res.status(500)
                                return
                            }else {
                                req.flash('success', "Update was successful.")
                                let redirectUrl = "/school/staff/" + req.params.staffID
                                res.redirect(303, redirectUrl)
                            }
                        })	
                    }				   
                }else {
                    throw {
                        message : 'Staff not found'
                    }
                    return
                }
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    getParents = async (req , res , next) => {
        try{ 
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                if(session){
                    const term = await Term.findOne({session: session._id, current: true})
                    if(term){
                        const parent= await Parent.find({school : schoolAdmin._id})
                        res.render("admin-parent" , {
                            parents : parent ,
                            title : "Parents",
                            schoolAdmin : schoolAdmin,
                            success : req.flash('success'),
                            parent_active : "active",
                            users_active: 'active', 
                            openuser_active: "pcoded-trigger",
                            sessS: session.name, 
                            termS: term.name
                        })
                    }else{
                        res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'Parents',
                        users_active: 'active', openuser_active: "pcoded-trigger",
                        parent_active : "active"})
                    }
                }else{
                    res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'Parents',
                    users_active: 'active', openuser_active: "pcoded-trigger",
                    parent_active : "active"})
                }
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    getNewParent = async (req, res, next) => {
        try{ 
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const student = await Student.find({school : schoolAdmin._id})
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                const term = await Term.findOne({current: true, session: session._id})
                const parents = await Parent.find({school: schoolAdmin._id})
                
                
                let foundStudent = []
                if(parents.length > 0){
                    parents.map(p => {
                        p.ward.map(w => foundStudent.push(String(w)))
                    })
                }
                
                let filterStudents = student.filter(s => !foundStudent.includes(s.id))
                console.log(filterStudents)
                
                res.render('new-parent', {title : 'New Parent', schoolAdmin : schoolAdmin,
                error : req.flash('error'), parent_active : "active", students : filterStudents,
                users_active: 'active', openuser_active: "pcoded-trigger", sessS: session.name,
                termS: term.name})
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    postParents = async (req , res , next) => { 
        try{ 
		    if(req.session.schoolCode){	 
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const {name, surname, title, email, number, relationship, ward} = req.body
                const totalParent = await Parent.find({school : schoolAdmin._id})
                let start, code
                if(schoolAdmin.demo){
                    start = schoolAdmin.demoCode
                    code = `K${GenerateAccount(totalParent, start, "parentID", 1, 2)}`
                }else{
                    start = req.session.schoolCode + "001"
                    code = `P${GenerateAccount(totalParent, start, "parentID", 1, 6)}`
                }
               
                const parentPass = await bcrypt.hash(surname.toUpperCase() , 10)
                
                const parent = await new Parent({
                    name : name , 
                    surname: surname,
                    title : title,
                    email :email,  
                    password : parentPass, 
                    parentID : code,
                    school : schoolAdmin._id,
                    number : number,
                    relationship : relationship,
                    ward : ward
                })
                const saveParent = await parent.save()
                if ( saveParent ) { 
                    Student.findByIdAndUpdate(ward, {
                        parent : true
                    }, {new : true, useAndModify : false}, (err , item) => {
                        if(err){
                            res.status(500)
                            return
                        }else{
                            let redirectUrl = "/school/parent"
                            res.redirect(redirectUrl)
                            return
                        }
                    }) 
                }else {
                    throw {
                        message : "Unable to save this Parent"
                    }
                    return 
                }
            }else {
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    getSingleParent = async (req , res , next) => {
        try{ 
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                let validParent = await Parent.findOne({_id : req.params.parentID})
                const student = await Student.find({school : schoolAdmin._id})
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                let studentName = {}
                student.map(s => studentName[s._id] = s.firstName + " " + s.lastName)

                if(validParent){
                  
                    res.render('singleparent' , { title  : "Parent", parentDB: validParent, studentName: studentName,
                    schoolAdmin : schoolAdmin, success : req.flash('success'), sessS: session.name, 
                    parent_active : "active", termS: term.name, users_active: 'active', openuser_active: "pcoded-trigger"})

                }else{
                    throw{
                        message : "Parents not found"
                    }
                }
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    updateSingleParent = async(req, res, next) => {
        try{ 
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const parent = await Parent.findOne({_id : req.params.parentID})
                if(parent){	
                    if(req.file){
                        
                        FileHandler.deleteFile("./public/uploads/schools/"+ req.session.schoolCode + "/parents/" + parent.profilePhoto) 
                        
                        let originalName = req.params.parentID + "-" + req.file.originalname
                        Parent.findByIdAndUpdate(req.params.parentID, {
                            profilePhoto : originalName,
                            name : req.body.name,
                            gender : req.body.gender,
                            email : req.body.email,
                            number : req.body.number
                        }, {new : true, useAndModify : false}, (err , item) => {
                            if(err){
                                res.status(500)
                                return
                            }else {
                                req.flash('success', "Update was successful.")
                                let redirectUrl = "/school/parent/" + req.params.parentID
                                res.redirect(303, redirectUrl)

                                const source = "../public/uploads/profile/" + originalName
                                const destination = "../public/uploads/schools/" + req.session.schoolCode + '/parents/' + originalName
                                fs.rename((path.join(dirName , source)) , (path.join(dirName , destination)), err => {
                                    if(err){
                                        console.error(err)
                                    }else{
                                        console.log("File Moved")
                                    }
                                })
                            }
                        })	
                    }else{
                        Parent.findByIdAndUpdate(req.params.parentID, {
                            name : req.body.name,
                            gender : req.body.gender,
                            email : req.body.email,
                            number : req.body.number
                        }, {new : true, useAndModify : false}, (err , item) => {
                            if(err){
                                res.status(500)
                                return
                            }else {
                                req.flash('success', "Update was successful.")
                                let redirectUrl = "/school/parent/" + req.params.parentID
                                res.redirect(303, redirectUrl)
                            }
                        })	
                    }				   
                }else {
                    throw {
                        message : 'Parent not found'
                    }
                    return
                }
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    getAssignPage = async (req , res , next) => {
        try{
            if(req.session.schoolCode){
                const validStaff = await Staff.findOne({_id : req.params.staffID})
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const subjects = await Subject.findOne({school: schoolAdmin._id})
                const classSchool = await ClassSchool.find({school: schoolAdmin._id})
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                
                if(validStaff){
                    res.render('assign-class' , { title  : "Staff", staffDB: validStaff, 
                    schoolAdmin : schoolAdmin, success : req.flash('success'), staff_active : "active",
                    users_active: 'active', openuser_active: "pcoded-trigger", error : req.flash('error'),
                    subjects: subjects, classSchool: classSchool, sessS: session.name,
                    termS: term.name})
                }else{
                    throw{
                        message : "Staff not found"
                    }
                }
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    postAssignPage = async (req , res , next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode: req.session.schoolCode})
                const findStaff = await Staff.find({school: schoolAdmin._id, role: 'Teacher'})
                const validStaff = await Staff.findOne({_id : req.params.staffID})
                let assignLength = []
                let findTeachClass, findTeachSubject
                findStaff.map(e => {
                    
                    findTeachClass = e.teaching.find(i => i.className == req.body.className)
                    findTeachSubject = e.teaching.find(i => i.subject == req.body.subject)
                    if(findTeachClass && findTeachSubject){
                        assignLength.push(findTeachClass)
                    }
                })
                console.log(assignLength)
                
                if(assignLength.length > 0){
                    req.flash('error', "A teacher has that class and subject already.")
                    let redirectUrl = '/school/staff/' + validStaff._id + '/assign'
                    res.redirect(303, redirectUrl)
                    return
                }else{
                    let fromBody = {
                        className: req.body.className,
                        subject: req.body.subject
                    }
                    Staff.findByIdAndUpdate(validStaff._id, {
                        $addToSet : {
                            teaching : [fromBody] }
                    }, {new : true, useFindAndModify : false}, (err , item) => {
                        if(err){
                            res.status(500)
                            return
                        }else {
                            req.flash('success', "Record saved successfully.")
                            let redirectUrl = '/school/staff/' + validStaff._id + '/assign'
                            res.redirect(303, redirectUrl)
                        }
                    })
                }
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    deleteAssignClass = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const staff = await Staff.findOne({_id: req.params.staffID})
                const teach = staff.teaching
                let mapIt = teach.find( elem => elem._id == req.params.teach)
                Staff.findByIdAndUpdate(staff._id, {
                    $pullAll : {
                        teaching : [mapIt] }
                }, {new : true, useAndModify : false}, (err , item) => {
                    if(err){
                        res.status(500)
                        return
                    }else {
                        req.flash('success', "You just deleted a class and a subject.")
                        let redirectUrl = '/school/staff/' + req.params.staffID + '/assign' 
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

    getExams = async (req , res , next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({school : schoolAdmin._id, current: true})
                if(session){
                    const term = await Term.findOne({session: session._id, current: true})
                    if(term){
                        const exam = await Exam.find({
                            school : schoolAdmin._id, session: session._id,
                            term: term._id, quickOwner: {$exists : false}
                        })
                        res.render('admin-exam' , { title  : "Exams", exams : exam, 
                        schoolAdmin : schoolAdmin, setup_active : "active",
                        cbt_active: 'active', opencbt_active: "pcoded-trigger",
                        sessS: session.name, termS: term.name})
                    }else{
                        res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'Exams',
                        setup_active: 'active', opencbt_active: "pcoded-trigger",
                        cbt_active : "active"})
                    }
                }else{
                    res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'Exams',
                    setup_active: 'active', opencbt_active: "pcoded-trigger",
                    cbt_active : "active"})
                }
                
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    postExams = async (req , res , next) => {
        try{
            if(req.session.schoolCode){ 
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({school : schoolAdmin._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                let allExam = await Exam.find({school : schoolAdmin._id})
                let code = GenerateAccount(allExam, "01", "examCode", 1, 2)

                const {name, startDate, endDate} = req.body
            
                const exam = await new Exam({
                    name : name,
                    session : session._id,
                    term : term._id,
                    startDate : startDate,
                    endDate : endDate,
                    school : schoolAdmin._id,
                    examCode : code
                })
                const saveExam = await exam.save()
                if ( saveExam ) { 
                    
                    FileHandler.createDirectory("./public/uploads/schools/" + req.session.schoolCode + "/exam-" + saveExam.examCode)
                    res.redirect('/school/cbt-setup')
                    return 
                }else {
                    throw {
                        message : "Unable to save the exam"
                    }
                }
            }else {
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    getExamQuestions = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                const term = await Term.findOne({current: true, session: session._id})
                const exam = await Exam.findOne({
                    examCode : req.params.examCode, school : schoolAdmin._id,
                    session: session._id, term: term._id
                })
                const courses = await Course.find({school : schoolAdmin._id, exam : exam._id, publish : true})
                
                res.render('admin-questions', {schoolAdmin : schoolAdmin, 
                courses : courses, exam : exam, setup_active : "active",
                cbt_active: 'active', opencbt_active: "pcoded-trigger",
                sessS: session.name, termS: term.name})
                
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    unpublishSetQuestions = async (req, res, next) => {
        try{ 
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const staff = await Staff.findOne({school : schoolAdmin._id})
                const session = await Session.findOne({school: staff.school, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const exam = await Exam.findOne({
                    examCode : req.params.examCode, school : staff.school,
                    session: session._id, term: term._id
                })
                const course = await Course.findOne({
                    _id : req.params.courseID
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
                            let redirectUrl = '/school/cbt-setup/'  + req.params.examCode + '/questions'
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

    viewQuestions = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const questions = await Question.findOne({course : req.params.courseID, school : schoolAdmin._id})
                let marks
                if(questions){
                    marks = questions.question.reduce((a, b) => a + Number(b.mark), 0)
                }
                const course = await Course.findOne({_id : questions.course})
                const exam = await Exam.findOne({_id : course.exam})
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})

                res.render('released-questions', {schoolAdmin : schoolAdmin, 
                questions : questions, exam : exam, course : course, setup_active : "active",
                cbt_active: 'active', opencbt_active: "pcoded-trigger", sessS: session.name,
                termS: term.name, marks})
                
            }else {
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    releaseQuestion = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                
                Course.findByIdAndUpdate(req.params.courseID, {
                        release : true,
                }, {new : true, useAndModify : false}, (err , item) => {
                    if(err){
                        res.status(500)
                        return
                    }else {
                        let redirectUrl = '/school/cbt-setup/' + req.params.examCode + '/questions'
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

    openExam = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                
                Exam.findByIdAndUpdate(req.params.examID, {
                        available : true,
                }, {new : true, useAndModify : false}, (err , item) => {
                    if(err){
                        res.status(500)
                        return
                    }else {
                        let redirectUrl = '/school/cbt-setup'
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

    getReports = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({school : schoolAdmin._id, current: true})
                if(session){
                    const term = await Term.findOne({session: session._id, current: true})
                    if(term){
                        const exam = await Exam.find({
                            school : schoolAdmin._id, session: session._id,
                            term: term._id, quickOwner: {$exists : false}
                        })
        
                        res.render('admin-examreports', {schoolAdmin : schoolAdmin, result_active : "active",
                        cbt_active: 'active', opencbt_active: "pcoded-trigger", 
                        exams : exam, title : "CBT Results", sessS: session.name, termS: term.name})
                    }else{
                        res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'CBT Results',
                        result_active: 'active', opencbt_active: "pcoded-trigger",
                        cbt_active : "active"})
                    }
                }else{
                    res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'CBT Results',
                    result_active: 'active', opencbt_active: "pcoded-trigger",
                    cbt_active : "active"})
                }    
            }else{
                res.redirect(303, '/admin')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    getAllExams = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const classSchool = await ClassSchool.find({school : schoolAdmin._id})
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const exam = await Exam.findOne({
                    school : schoolAdmin._id, examCode : req.params.examCode,
                    session: session._id, term: term._id
                })
                
                res.render('all-exams', {schoolAdmin : schoolAdmin, classSchool : classSchool, 
                exam : exam, result_active : "active", sessS: session.name, termS: term.name,
                cbt_active: 'active', opencbt_active: "pcoded-trigger"})

            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    getFullReport = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const exam = await Exam.findOne({
                    school : schoolAdmin._id, examCode : req.params.examCode,
                    session: session._id, term: term._id
                })
                let className = req.params.className
                const result = await Result.find({
                    className : className, 
                    school : schoolAdmin._id,
                    exam: exam._id,
                    session: session._id,
                    term: term._id
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

                res.render('class-report', {firstResult : firstResult, schoolAdmin : schoolAdmin, 
                results : resultArray, exam : exam, studentName : studentName, title: 'CBT Results',
                result_active : "active",className : className, studentID : studentID,
                cbt_active: 'active', opencbt_active: "pcoded-trigger", sessS: session.name, termS: term.name})
            
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    releaseResults = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const exam = await Exam.findOne({
                    school : schoolAdmin._id, examCode : req.params.examCode,
                    session: session._id, term: term._id
                })
                
                Result.updateMany({className : req.params.className, 
                    school : schoolAdmin._id, exam: exam._id, 
                    session: session._id, term: term._id}, {
                        $set : {released : true}
                }, {new : true, useAndModify : false}, (err , item) => {
                    if(err){
                        res.status(500)
                        return
                    }else {
                        let redirectUrl = '/school/cbt-results/' + req.params.examCode + '/' + req.params.className
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

    unReleaseResults = async (req, res, next) => {
        try{
            if(req.session.email){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const exam = await Exam.findOne({
                    school : schoolAdmin._id, examCode : req.params.examCode,
                    session: session._id, term: term._id
                })

                Result.updateMany({className : req.params.className, 
                    school : schoolAdmin._id, exam: exam._id, session: session._id, 
                    term: term._id}, {
                        $set : {released : false}
                }, {new : true, useAndModify : false}, (err , item) => {
                    if(err){
                        res.status(500)
                        return
                    }else {
                        let redirectUrl = '/school/cbt-results/' + req.params.examCode + '/' + req.params.className
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

    getBroadSheet = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const classchool = await ClassSchool.find({school : schoolAdmin._id})
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                if(session){
                    const term = await Term.findOne({session: session._id, current: true})
                    if(term){
                        res.render('broadsheet-class', {title : 'Broadsheet', schoolAdmin : schoolAdmin,
                        classSchool : classchool, broadsheet_active: "active", sessS: session.name,
                        termS: term.name})
                    }else{
                        res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'Broadsheet',
                        broadsheet_active: "active"})
                    }
                }else{
                    res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'Broadsheet',
                    broadsheet_active: "active"})
                }
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    getClassBroadSheet = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({school : schoolAdmin._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                if(term.name == 'Third Term'){
                    let redirectUrl = '/school/broadsheet/' + req.params.className + '/third-term'
                    res.redirect(303, redirectUrl)
                    return
                }
                const broadsheet = await Broadsheet.find({
                    className: req.params.className, session: session._id,
                    term: term._id, school: schoolAdmin._id
                })
                let title = 'Broadsheet for ' + req.params.className
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

                res.render('broadsheet', {title : title, schoolAdmin : schoolAdmin,
                pClass : req.params.className, broadsheet_active: "active", broadsheet: resultArray,
                firstResult: firstResult, studentName: studentName, studentID: studentID,
                sessS: session.name, termS: term.name})
                
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    getClassBroadSheetThird = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({school : schoolAdmin._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                if(term.name != 'Third Term'){
                    let redirectUrl = '/school/broadsheet/' + req.params.className
                    res.redirect(303, redirectUrl)
                    return
                }
                const broadsheet = await Broadsheet.find({
                    className: req.params.className, session: session._id,
                    term: term._id, school: schoolAdmin._id
                })
                let title = 'Broadsheet for ' + req.params.className
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

                res.render('broadsheet-third', {title : title, schoolAdmin : schoolAdmin,
                pClass : req.params.className, broadsheet_active: "active", broadsheet: resultArray,
                firstResult: firstResult, studentName: studentName, studentID: studentID,
                sessS: session.name, termS: term.name})
                
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    getReportCard = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const broadsheet = await Broadsheet.findOne({_id: req.params.cardID})
                const student = await Student.findOne({_id: broadsheet.student})

                res.render('school-report-card', {broadsheet_active : "active", 
                title: 'Report Card', sessS: session.name, schoolAdmin: schoolAdmin,
                pClass: req.params.className, termS: term.name, 
                studentDB: student, broadsheet: broadsheet
                })

            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    releaseReportCard = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                const term = await Term.findOne({current: true, session: session._id})
                
                Broadsheet.updateMany({
                    className : req.params.className, school : schoolAdmin._id, 
                    session: session._id, term: term._id}, {
                        $set : {released : true}
                }, {new : true, useFindAndModify : false}, (err , item) => {
                    if(err){
                        res.status(500)
                        return
                    }else {
                        let redirectUrl = '/school/broadsheet/' + req.params.className 
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

    unReleaseReportCard = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                const term = await Term.findOne({current: true, session: session._id})
                
                Broadsheet.updateMany({
                    className : req.params.className, school : schoolAdmin._id, 
                    session: session._id, term: term._id}, {
                        $set : {released : false}
                }, {new : true, useFindAndModify : false}, (err , item) => {
                    if(err){
                        res.status(500)
                        return
                    }else {
                        let redirectUrl = '/school/broadsheet/' + req.params.className 
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

    getAttendanceClass = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const classchool = await ClassSchool.find({school : schoolAdmin._id})
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                if(session){
                    const term = await Term.findOne({session: session._id, current: true})
                    if(term){
                        res.render('admin-attendance-session', {title : 'School Attendance', schoolAdmin : schoolAdmin,
                        classSchool : classchool, attendance_active: "active", sessS: session.name,
                        termS: term.name})
                    }else{
                        res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'Broadsheet',
                        attendance_active: "active"})
                    }
                }else{
                    res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'Broadsheet',
                    attendance_active: "active"})
                }
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    firstAttendance = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                let redirectUrl = '/school/attendance/' + req.params.className + '/1'
                res.redirect(303, redirectUrl)
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    getEachAttendance = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const classchool = await ClassSchool.findOne({school : schoolAdmin._id, name: req.params.className})
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                const term = await Term.findOne({session : session._id, current: true})
                const students = await Student.find({school: schoolAdmin._id, className: classchool._id})
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
                    
                    res.render('admin-attendance', {title : 'School Attendance', schoolAdmin : schoolAdmin,
                    attendance_active: "active", attendance: week1Attendance, pClass: req.params.className,
                    week: req.params.week, attendanceWeek : attendanceWeek, studentName: studentName,
                    weekday: weekday, sessS: session.name, termS: term.name})
                }else{
                    res.render('admin-attendance', {title : 'School Attendance', schoolAdmin : schoolAdmin,
                    attendance_active: "active", pClass: req.params.className,
                    week: req.params.week, studentName: studentName, attendance: attendance,
                    sessS: session.name, termS: term.name})
                }
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    getNotesClass = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const classchool = await ClassSchool.find({school : schoolAdmin._id})
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                if(session){
                    const term = await Term.findOne({session: session._id, current: true})
                    if(term){
                        res.render('admin-notes-session', {title : 'School Attendance', schoolAdmin : schoolAdmin,
                        classSchool : classchool, notes_active: "active", sessS: session.name,
                        termS: term.name})
                    }else{
                        res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'Lesson Notes',
                        notes_active: "active"})
                    }
                }else{
                    res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'Lesson Notes',
                    notes_active: "active"})
                }
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    getLessonNotes = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                const term = await Term.findOne({current: true, session: session._id})
                const lessonNotes = await LessonNotes.find({
                    session : session._id, 
                    term : term._id, 
                    status : "Approved",
                    className: req.params.className
                })
                const staffs = await Staff.find({school : schoolAdmin._id})

                let staffName = {}
                staffs.map(elem => staffName[elem._id] = elem.firstName + " " + elem.lastName)

                res.render('admin-notes', {title : "Lesson Notes", schoolAdmin : schoolAdmin, 
                notes_active : "active", lessonNotes : lessonNotes, sessS: session.name,
                staffName: staffName, pClass: req.params.className, termS: term.name})
        
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    getSingleNote = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const singleNote = await LessonNotes.findOne({_id : req.params.noteID})
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const staffs = await Staff.find({school: schoolAdmin._id})
                let staffName = {}
                staffs.map(elem => staffName[elem._id] = elem.firstName + " " + elem.lastName)
                let staffID = {}
                staffs.map(elem => staffID[elem._id] = elem.staffID)

                res.render('admin-single-note', {title : "Lesson Note", schoolAdmin : schoolAdmin, 
                notes_active : "active", singleLessonNote : singleNote, sessS: session.name,
                termS: term.name, school: schoolAdmin, staffName, staffID, session, term})
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    getApprovedNotes = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                const term = await Term.findOne({current: true, session: session._id})
                const lessonNotes = await LessonNotes.find({
                    session : session._id, 
                    term : term._id, 
                    status : "approved",
                    className: req.params.className
                })
                const staffs = await Staff.find({school : schoolAdmin._id})

                let staffName = {}
                staffs.map(elem => staffName[elem._id] = elem.firstName + " " + elem.lastName)

                res.render('approved-notes', {title : "Approved Lesson Notes", schoolAdmin : schoolAdmin, 
                notes_active : "active", lessonNotes : lessonNotes, sessS: session.name, termS: term.name,
                staffName: staffName, pClass: req.params.className})
        
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    approveNote = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                
                LessonNotes.findByIdAndUpdate(req.params.noteID, {
                    status : "Approved"
                }, {new : true, useFindAndModify : false}, (err, item) => {
                    if(err){
                        console.log(err)
                    }else{
                        let redirectUrl = "/school/lesson-notes/" + req.params.className + "/all"
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

    getMailPage = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                
                res.render('admin-mail', {title : "Lesson Note", schoolAdmin : schoolAdmin, 
                    mail_active : "active"})
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    getHelp = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                
                res.render('admin-help', {title : "Lesson Note", schoolAdmin : schoolAdmin, 
                    help_active : "active"})
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    getLogout = (req , res , next ) => {
        try {
            if (req.session.schoolCode) {
                delete req.session.schoolCode
                res.redirect(303 , '/school')
            }else {
                throw new Error("Problem signing out. We will handle this shortly")
            }
        }catch(err) {
            res.render('error-page', {error : err})
        }
    }
}

const returnApp = new App()

module.exports = returnApp 