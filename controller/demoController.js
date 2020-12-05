'use strict' 

const bcrypt = require('bcryptjs')
const FileHandler = require('./file')
const GenerateAccount = require('./accountGenerator')
const Random = require('./random')
const Admin = require('../model/admin')
const SchoolAdmin = require('../model/schoolAdmin')
const GenPass = require('../model/generate-pass')
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
const ExamCompute = require('../model/exam-settings')
const Grade = require('../model/grade')
const Broadsheet = require('../model/broadsheet')
const Parent = require('../model/parent')
const Role = require('../model/role')
const PaymentType = require('../model/paymentType')
const Assignment = require('../model/assignment')
const ClassTimetable = require('../model/classTimetable')
const ExamTimetable = require('../model/examTimetable')
const Day = require('../model/day')
const ExamDay = require('../model/examDay')
const Payment = require('../model/payment')
const Period = require('../model/period')
const StudentResults = require('../model/studentResults')


class App { 

    getDemoRegister = async (req , res , next) => {
        try{
                
            res.render('demo-signup', {title : "Get a Demo"})
           
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    requestDemo = async (req, res, next) => {
        try{
            const {schoolName, schoolEmail, schoolAdminName, address} = req.body
            
            const checkSchool = await SchoolAdmin.find({ $or : [{schoolName : schoolName}, {schoolEmail : schoolEmail}]})
            if(checkSchool.length == 0){
                
                const schoolAdmin = await new SchoolAdmin({
                    schoolCode: Random(5),
                    schoolName : schoolName ,  
                    schoolEmail : schoolEmail , 
                    schoolAdmin : schoolAdminName, 
                    address  : address,
                    demo : true,
                    schoolNumber: Random(8)
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
                res.render('demo-signup', {title : "Get a Demo", error : "Account already exists."})
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }


    getNewDemoSchool = async (req , res , next) => {
        try{
            if(req.session.adminEmail){
                const validAdmin = await Admin.findOne({email : req.session.adminEmail})
                const newDemoSchools = await SchoolAdmin.find({approved : false , demo : true})
                    
                res.render('admin-new-demo-schools', {admin : validAdmin, title : "New Demo Schools", 
                newDemoSchools : newDemoSchools, newdemo_actice : "active"})
            }else{
                res.redirect(303, '/202007/admin')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    getApprovedDemoSchool = async (req , res , next) => {
        try{
            if(req.session.adminEmail){
                const validAdmin = await Admin.findOne({email : req.session.adminEmail})
                const approvedDemoSchools = await SchoolAdmin.find({approved : true , demo : true})

                res.render('admin-approved-demo-schools', {admin : validAdmin, title : "Approved Demo Schools", 
                approvedDemoSchools : approvedDemoSchools, approveddemo_actice : "active"})
                    
            }else{
                res.redirect(303, '/202007/admin')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    getSingleDemoSchool = async (req , res , next) => {
        try{
            if(req.session.adminEmail){
                if(req.params.demoSchoolID){
                    const validAdmin = await Admin.findOne({email : req.session.adminEmail})
                    const demoSchool = await SchoolAdmin.findOne({_id : req.params.demoSchoolID , demo : true})
                    res.render('single-demo-school', {admin : validAdmin, title : demoSchool.schoolName, 
                        demoSchool : demoSchool, success : req.flash('success')})
                }else{
                    throw{
                        message: "You can't access this page."
                    }
                }
            }else{
                res.redirect(303, '/202007/admin')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    approveDemoSchool = async (req, res, next) => {
        try{
            if(req.session.adminEmail){
                const demo = await SchoolAdmin.findOne({_id: req.params.demoSchoolID})
                console.log(req.params.demoSchoolID)
                const totalSchool = await SchoolAdmin.find({approved : true , demo : true})
                const code = `${GenerateAccount(totalSchool , "01", "demoCode", 1, 2)}`
                let date = new Date()
                date.setDate(date.getDate() + 7)
                
                const schoolPass = await bcrypt.hash(demo.schoolNumber , 10)
                
                SchoolAdmin.findByIdAndUpdate(req.params.demoSchoolID , {
                    approved : true, demoCode : code , password : schoolPass, expiryDate: date
                } ,{new : true, useAndModify : false}, (err , item) => {
                    if(err){
                        res.status(500)
                        return
                    }else{
                        FileHandler.createDirectory("./public/uploads/schools/" + code)

                        let subjects = new Subject({
                            school : req.params.demoSchoolID,
                            subjects : [
                                "English Language", "Mathematics", "Quantitative Reasoning", "Verbal Reasoning",
                                "Basic Science", "Basic Technology", "History", "Yoruba Language", "French",
                                "Cultural and creative art", "Business Studies", "Home Economics", "Economics",
                                "Physical Health Education", "Christian Religious Studies", "Agricultural Science",
                                "Social Studies", "Literature in English", "Computer Studies", "Civic Education",
                                "Physics", "Chemistry", "Biology", "Techincal Drawing", "Marketing", "Further Mathematics",
                                "Commerce", "Government"
                            ]
                        })
                        subjects.save()

                        req.flash('success', "You have approved this demo account. School is now free to login.")
                        let redirectUrl = '/202007/admin/demoschool/' + req.params.demoSchoolID
                        res.redirect(303, redirectUrl)
                    }
                })
            
            }else{
                res.redirect(303, '/202007/admin')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    deleteDemo = async (req, res, next) => {
        try{
            if(req.session.adminEmail){
                let dateNow = new Date().toDateString()
                const demoSchool = await SchoolAdmin.findOne({demo : true , _id : req.params.demoSchoolID})
                if (demoSchool) {
                    if(demoSchool.expiryDate.toDateString().match(dateNow)) {
                        await Session.deleteMany({school : demoSchool._id})
                        await Subject.deleteMany({school : demoSchool._id})
                        await Staff.deleteMany({school : demoSchool._id})
                        await Student.deleteMany({school : demoSchool._id})
                        await Exam.deleteMany({school : demoSchool._id})
                        await ClassSchool.deleteMany({school : demoSchool._id})
                        await Course.deleteMany({school : demoSchool._id})
                        await Question.deleteMany({school : demoSchool._id})
                        await Result.deleteMany({school : demoSchool._id})
                        await Attendance.deleteMany({school : demoSchool._id})
                        await LessonNotes.deleteMany({school : demoSchool._id})
                        await ExamCompute.deleteMany({school : demoSchool._id})
                        await Broadsheet.deleteMany({school : demoSchool._id})
                        await Grade.deleteMany({school : demoSchool._id})
                        await Parent.deleteMany({school : demoSchool._id})
                        await PaymentType.deleteMany({school : demoSchool._id})
                        await Role.deleteMany({school : demoSchool._id})
                        await Term.deleteMany({school : demoSchool._id})
                        await Assignment.deleteMany({school : demoSchool._id})
                        await ClassTimetable.deleteMany({school : demoSchool._id})
                        await ExamTimetable.deleteMany({school : demoSchool._id})
                        await Day.deleteMany({school : demoSchool._id})
                        await Period.deleteMany({school : demoSchool._id})
                        await StudentResults.deleteMany({school : demoSchool._id})
                        await ExamDay.deleteMany({school : demoSchool._id})
                        await Payment.deleteMany({school : demoSchool._id})
                        await GenPass.deleteMany({school : demoSchool._id})
                        await SchoolAdmin.deleteMany({_id : demoSchool._id})
                        req.flash('success' , 'Demo School has been cancelled successfully.')
                        res.redirect(303 , '/202007/admin/dashboard')
                    } else {
                        res.json({message : "Cannot delete demo. Not yet expired"})
                    }
                }else {
                    throw {
                        status : 400 ,
                        message : "Something went wrong with the request "
                    }
                }
            }else{
                res.redirect(303, '/202007/admin')
            }
    }catch(err){
            res.render('error-page', {error : err})
        }
    }

}
const returnApp = new App()

module.exports = returnApp 