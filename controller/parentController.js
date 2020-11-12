const bcrypt = require('bcryptjs')

const SchoolAdmin = require('../model/schoolAdmin')
const Staff = require("../model/staff")
const Exam = require('../model/exam')
const Course = require('../model/course')
const Question = require('../model/question')
const Result = require('../model/result')
const Student = require('../model/student')
const Parent = require("../model/parent")
const Attendance = require('../model/attendance')
const ClassSchool = require('../model/classchool')
const Session = require('../model/session') 
const Term = require('../model/term')
const LessonNote = require('../model/lessonNote')
const Subject = require("../model/subject")
//const Assignment = require("../model/assignment")
const Payment = require('../model/payment')
const PaymentType = require('../model/paymentType')

const FileHandler = require('./file')

class App {

    postParentLogin = async (req , res , next) => {
        try { 
            const {code, email, password} = req.body
            let parent = await Parent.findOne({parentID : code, email : email})
            if(parent){
                const validParent = await bcrypt.compare(password , parent.password)
                if(validParent){
                    req.session.parentCode = parent.parentID
                    res.redirect(303 , '/parent/dashboard')
                }else{
                    res.render('parent-page' , { error : 'Invalid Login details'})
                }
            }else{
                res.render('parent-page' , { error : 'Invalid Login details'})
            }
        }catch(errors) {
            res.render('parent-page' , {error : errors})
        }
    }

    getDashboard = async (req , res , next) => {
        try{ 
            if(req.session.parentCode){
                let parent = await Parent.findOne({parentID : req.session.parentCode})
                let school = await SchoolAdmin.findOne({_id : parent.school})
                const student = await Student.find()

                let oneStudent = {}
                student.map(one => oneStudent[one._id] = one.firstName)

                if(parent) {
                    res.render('parent-dashboard' , { title  : "Dashboard", parent : parent,  
                    code : school.schoolCode, dash_active : "active", students : student, oneStudent: oneStudent})
                }else{
                    throw{
                        message : "No Parent"
                    }
                }
            }else{
                res.redirect(303, '/Parent')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    getChildren = async(req, res, next) => {
        try{
            if(req.session.parentCode){
                let parent = await Parent.findOne({parentID : req.session.parentCode})
                let school = await SchoolAdmin.findOne({_id : parent.school})
                const student = await Student.find()
                console.log(student)

                let oneStudent = {}
                student.map(one => oneStudent[one._id] = one.firstName + " " + one.lastName)

                if(parent) {
                    res.render('parent-ward' , { title  : "Child(ren)", parent : parent,
                    code : school.schoolCode, student_active : "active", oneStudent : oneStudent})
                }else{
                    throw{
                        message : "No Parent"
                    }
                }
            }else{
                res.redirect(303, '/Parent')
            } 
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    getSingleChild = async(req, res, next) => {
        try{
            if(req.session.parentCode){
                const parent = await Parent.findOne({parentID : req.session.parentCode})
                let validStudent = await Student.findOne({_id : req.params.studentID})
                let schoolAdmin = await SchoolAdmin.findOne({_id : parent.school})
                let checkClass = await ClassSchool.findOne({_id : validStudent.className})
                if(validStudent){
                    res.render('child-profile' , { title  : "Student", studentDB: validStudent, 
                    parent : parent, studentClass : checkClass, schoolAdmins : schoolAdmin,
                    success : req.flash('success'), student_active : "active", validStudent : validStudent})
                }else{
                    throw{
                        message : "Student not found"
                    }
                }  
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    getFinancePage = async ( req , res , next ) => {
        try {
            if(req.session.parentCode){
                const parent = await Parent.findOne({parentID : req.session.parentCode})
                const student = await Student.findOne({_id : req.params.studentID})
                const school = await SchoolAdmin.findOne({_id : parent.school})
                const className = await ClassSchool.findOne({_id : student.className})
                const session = await Session.findOne({school : student.school, current: true})
                const term = await Term.findOne({session: session._id})
                const singleClass = await ClassSchool.findOne({  school: school._id})

                res.render('finance-page' , {title : 'Student Finance Page' , parent : parent , students : student})
            }else{
                res.redirect(303, '/parent-page')
            }
        } catch (err) {
            res.render("error-page", {error: err})
        }
    }

    getFinancialRecords = async ( req , res , next ) => {
        try {
            if(req.session.parentCode){
                const parent = await Parent.findOne({parentID : req.session.parentCode})
                const student = await Student.findOne({_id : req.params.studentID})
                const school = await SchoolAdmin.findOne({_id : parent.school})
                const className = await ClassSchool.findOne({_id : student.className})
                const session = await Session.findOne({school : student.school, current: true})
                const term = await Term.findOne({session: session._id})
                const singleClass = await ClassSchool.findOne({  school: school._id}) 
                const payments = await Payment.findOne({ class : className._id })
                const paymentTypes = await PaymentType.find({ school : school._id })

                let paymentName = {}
                paymentTypes.map(pay => paymentName[pay._id] = pay.paymentFor)
                
                let paymentFees = payments.fees
                let sum = paymentFees.reduce((a, b) => a + Number(b.amount), 0)

                res.render('child-fees' , {title : 'Child Fees Page' , parent : parent , students : student, card_active : 'active',
                className : className, term : term, session : session , school : school, singleClass : singleClass ,
                sum : sum  , payments : payments , paymentTypes : paymentTypes , paymentName : paymentName})
            }else{
                res.redirect(303, '/parent-page')
            }
        } catch (err) {
            res.render("error-page", {error: err})
        }
    }

    getPayOnline = async ( req , res , next ) => {
        try {
            if(req.session.parentCode){
                const parent = await Parent.findOne({parentID : req.session.parentCode})
                const student = await Student.findOne({_id : req.params.studentID})
                const school = await SchoolAdmin.findOne({_id : parent.school})
                const className = await ClassSchool.findOne({_id : student.className})
                const session = await Session.findOne({school : student.school, current: true})
                const term = await Term.findOne({session: session._id})
                const singleClass = await ClassSchool.findOne({  school: school._id}) 
                const payments = await Payment.findOne({ class : className._id })
                const paymentTypes = await PaymentType.find({ school : school._id })

                let paymentName = {}
                paymentTypes.map(pay => paymentName[pay._id] = pay.paymentFor)
                
                let paymentFees = payments.fees
                let sum = paymentFees.reduce((a, b) => a + Number(b.amount), 0)

                res.render('pay-online' , {title : 'Make Payment Online' , parent : parent , students : student, card_active : 'active',
                className : className, term : term, session : session , school : school, singleClass : singleClass ,
                sum : sum  , payments : payments , paymentTypes : paymentTypes , paymentName : paymentName})
            }else{
                res.redirect(303, '/parent-page')
            }
        } catch (error) {
            
        }
    }

    settingsPage = async(req, res, next) => {
        try{
            if(req.session.parentCode){
                const parent = await Parent.findOne({parentID : req.session.parentCode})
                res.render('parent-settings', {title : "Settings",
                    parent : parent, success : req.flash('success')})
            }else{
                res.redirect(303, '/parent-page')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }



}

const returnApp = new App()

module.exports = returnApp 