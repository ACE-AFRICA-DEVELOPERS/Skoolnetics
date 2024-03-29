const bcrypt = require('bcryptjs')
const GenerateInvoice = require('./invoiceGenerator')
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
const Assignment = require("../model/assignment")
const Payment = require('../model/payment')
const PaymentType = require('../model/paymentType')
const PaymentProof = require('../model/payment-proof')
const Transaction = require('../model/transaction')
const Invoice = require('../model/invoice')
const Broadsheet = require('../model/broadsheet')
const PayOnline = require("../model/payOnline")

const FileHandler = require('./file')

const Paystack    =  require("paystack-node") 
const PaystackKey = process.env.PAYSTACK_KEY 
const environment = process.env.NODE_ENV 
const paystack = new Paystack(PaystackKey , environment) 

class App {

    postParentLogin = async (req , res , next) => {
        try { 
            const {code, password} = req.body
            let parent = await Parent.findOne({parentID : code})
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
                let session = await Session.findOne({school: school._id, current: true})
                let term = await Term.findOne({session: session._id, current: true})

                if(parent) {
                    res.render('parent-dashboard' , { title  : "Dashboard", parent : parent,  
                    code : school, dash_active : "active", 
                    schoolT: school, sessS: session.name, termS: term.name})
                }else{
                    throw{
                        message : "No Parent"
                    }
                }
            }else{
                res.redirect(303, '/parent')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    getSettings = async (req, res, next) => {
        try{
            if(req.session.regNumber){
                const parent = await Parent.findOne({parentID : req.session.parentCode})
                const school = await SchoolAdmin.findOne({_id : parent.school})
                res.render('parent-settings', {title : 'Settings', parent, code : school, 
                error : req.flash('error'), success : req.flash('success')})
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    changePassword = async(req, res, next) => {
        try{
            if(req.session.parentCode){
                const {oldPassword, newPassword, cNewPassword} = req.body
                const parent = await Parent.findOne({parentID : req.session.parentCode})
                if(newPassword == cNewPassword){
                    let validPassword = await bcrypt.compare(oldPassword , parent.password)
                    if(validPassword){
                        let harshedPassword = await bcrypt.hash(newPassword , 10)
                        Parent.findByIdAndUpdate(parent._id, {
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

    getChildren = async(req, res, next) => {
        try{
            if(req.session.parentCode){
                let parent = await Parent.findOne({parentID : req.session.parentCode})
                let school = await SchoolAdmin.findOne({_id : parent.school})
                const student = await Student.find({school: school._id})
                const session = await Session.findOne({school: school._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})

                let oneStudent = {}
                student.map(one => oneStudent[one._id] = one.firstName + " " + one.lastName)

                if(parent) {
                    res.render('parent-ward' , { title  : "Child(ren)", parent : parent,
                    code : school, student_active : "active", oneStudent : oneStudent,
                    ward_active: 'active', sessS: session.name, termS: term.name})
                }else{
                    throw{
                        message : "No Parent"
                    }
                }
            }else{
                res.redirect(303, '/parent')
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
                let session = await Session.findOne({school: schoolAdmin._id, current: true})
                let term = await Term.findOne({session: session._id, current: true})

                if(validStudent){
                    res.render('child-profile' , { title  : "Student", studentDB: validStudent, 
                    parent : parent, studentClass : checkClass, schoolAdmins : schoolAdmin,
                    success : req.flash('success'), student_active : "active", code: schoolAdmin,
                    termS: term.name, sessS: session.name, ward_active: 'active'})
                }else{
                    throw{
                        message : "Student not found"
                    }
                }  
            }else{
                res.redirect(303, '/parent')
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
                const term = await Term.findOne({session: session._id, current:true})

                res.render('finance-page' , {title : 'Student Finance Page' , parent : parent , code: school,
                students : student, sessS: session.name, termS: term.name, ward_active: 'active'})

            }else{
                res.redirect(303, '/parent')
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
                const term = await Term.findOne({session: session._id, current: true})
                const singleClass = await ClassSchool.findOne({  school: school._id}) 
                const payments = await Payment.findOne({ class : className._id, session: session._id, term: term._id })
                const paymentTypes = await PaymentType.find({ school : school._id })

                let paymentName = {}
                let type = {}
                paymentTypes.map(pay => paymentName[pay._id] = pay.paymentFor)
                paymentTypes.map(pay => type[pay._id] = pay.importance)
                let sum, invoice
                if(payments){
                    let paymentFees = payments.fees
                    sum = paymentFees.reduce((a, b) => a + Number(b.amount), 0)
                    invoice = await Invoice.findOne({payment: payments._id, student: req.params.studentID})
                }

                res.render('child-fees' , {title : 'Child Fees Page' , parent : parent , students : student, card_active : 'active',
                className : className, termS : term.name, sessS : session.name , school : school, singleClass : singleClass ,
                sum : sum  , payments : payments , paymentTypes : paymentTypes , paymentName : paymentName,
                ward_active: 'active', invoice: invoice, code: school, type})
            }else{
                res.redirect(303, '/parent')
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
                const term = await Term.findOne({session: session._id, current: true})
                const singleClass = await ClassSchool.findOne({  school: school._id}) 
                const payments = await Payment.findOne({ class : className._id, session: session._id, term: term._id })
                const paymentTypes = await PaymentType.find({ school : school._id })
                
                let paymentName = {}
                paymentTypes.map(pay => paymentName[pay._id] = pay.paymentFor)

                res.render('pay-online' , {title : 'Make Payment Online' , parent : parent , students : student, card_active : 'active',
                className : className, school : school, singleClass : singleClass , code: school,
                payments : payments , paymentTypes : paymentTypes , paymentName : paymentName,
                ward_active: 'active', sessS: session.name, termS: term.name})
            }else{
                res.redirect(303, '/parent-page')
            }
        } catch (error) {
            
        }
    }

    getUploadPayment = async(req, res, next) => {
        try{
            if(req.session.parentCode){
                const parent = await Parent.findOne({parentID : req.session.parentCode})
                const student = await Student.findOne({_id : req.params.studentID})
                const school = await SchoolAdmin.findOne({_id: parent.school})
                const className = await ClassSchool.findOne({_id: student.className})
                const session = await Session.findOne({current: true, school: school._id})
                const term = await Term.findOne({current: true, session: session._id})
                const payments = await Payment.findOne({ class : className._id, session: session._id, term: term._id })
                const paymentTypes = await PaymentType.find({ school : school._id })
                
                let paymentName = {}
                paymentTypes.map(pay => paymentName[pay._id] = pay.paymentFor)
                const proofTotal = await PaymentProof.find({
                    student: req.params.studentID,
                    session: session._id,
                    term: term._id,
                })
                
                res.render('parent-upload', {title : "Upload POP", students: student,
                parent : parent, success : req.flash('success'), ward_active: "active",
                sessS: session.name, termS: term.name, payments: payments, code: school,
                paymentName: paymentName, error: req.flash('error'), proofTotal: proofTotal})
            }else{
                res.redirect(303, '/parent')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    postTransactionProof = async (req, res, next) => {
        try{
            if(req.session.parentCode){
                const {description, amount} = req.body
                const parent = await Parent.findOne({parentID: req.session.parentCode})
                const student = await Student.findOne({_id : req.params.studentID})
                const school = await SchoolAdmin.findOne({_id: parent.school})
                const className = await ClassSchool.findOne({_id: student.className})
                const session = await Session.findOne({current: true, school: school._id})
                const term = await Term.findOne({current: true, session: session._id})

                FileHandler.createDirectory("./public/uploads/schools/" + school.schoolCode + "/transactions")

                if(req.file){
                    const paymentProof = new PaymentProof ({
                        school: school._id,
                        student: req.params.studentID,
                        session: session._id,
                        term: term._id,
                        className: className._id,
                        amountPaid: amount,
                        proof: req.file.filename,
                        description: description
                    })  
                    const saveProof = await paymentProof.save()
                    if(saveProof){

                        FileHandler.moveFile(req.file.filename , "./public/uploads/profile" , "./public/uploads/schools/" + school.schoolCode + "/transactions/") 
                        
                        req.flash('success', 'Transaction sent! Please wait for approval.')
                        let redirectUrl = '/parent/student/' + req.params.studentID + '/finance-page/upload-payment'
                        res.redirect(303, redirectUrl)
                    }else{
                        throw 'Unable to save.'
                    }
                }else{
                    req.flash('error', 'You need to upload a screenshot of your transaction!')
                    let redirectUrl = '/parent/student/' + req.params.studentID + '/finance-page/upload-payment'
                    res.redirect(303, redirectUrl)
                }
                 
            }else{
                res.redirect(303, '/parent')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    storePayment = async (req, res, next) => {
        try { 
            if(req.session.parentCode){
                const { amount , student, target } = req.body
                const parent = await Parent.findOne({parentID: req.session.parentCode})
                const school = await SchoolAdmin.findOne({_id: parent.school})
                const session = await Session.findOne({school: school._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})

                const totalPay = await PayOnline.find({school: school._id, session: session._id, verified: true})
                
                let getname = school.schoolName
                let sessionName = session.name
                const sess = sessionName.substring(5, 9)

                function getInitials(name){
                    let names = name.split(' ')
                    let initials = ''
                    for(let i = 0; i < names.length; i++){
                        if(names[i].length > 0 && names[i] !== ''){
                            initials += names[i][0]
                        }
                    }
                    return initials
                }
                const initialName = getInitials(getname)
                let start = "000001"
                const code = GenerateInvoice(totalPay, start, "receiptNo", 1, 6)

                const newPay = await new PayOnline({
                    student: student,
                    school: school._id,
                    session: session._id,
                    term: term._id,
                    payment: target,
                    total: amount,
                    receiptNo: sess + initialName + code
                })
                let savePay = await newPay.save()
                if(savePay){
                    res.json({
                        payID: savePay._id,
                        amount: savePay.total
                    })
                }else{
                    throw 'Error in saving'
                }
                
            }else{
                res.json({message: 'Access denied'})
            }    
        }catch(error){
            res.json({
                message : error.message
            })
        }
    }

    proceedToPayment = async (req , res) => {
        try { 
            if(req.session.parentCode){
                const { amount, payID } = req.params
                const parent = await Parent.findOne({parentID: req.session.parentCode})
                const payOnline = await PayOnline.findOne({_id: payID})
                const promise6 = paystack.initializeTransaction({
                    amount: Number(amount)* 100,
                    email: parent.email
                }) 
                promise6.then(function (response){
                    if (response.body.status){ 
                        PayOnline.findByIdAndUpdate(payOnline._id, {
                            referenceNumber : response.body.data.reference
                        }, {new : true, useFindAndModify : false}, (err, item) => {
                            if(err){
                                console.log(err)
                            }
                            else{
                                res.redirect(response.body.data.authorization_url)
                            }
                        })
                        
                    }else {
                        res.json({
                            message : "Unable to proceed with the request"
                        })
                    }
                }).catch(function (error){
                    console.error(error.message)
                })
            }else{
                res.json({message: 'Access denied'})
            }    
        }catch(error){
            res.json({
                message : error.message
            })
        }
    }

    verifyTransaction = async (req , res) => {
        try { 
            if(req.session.parentCode){
                const parent = await Parent.findOne({parentID: req.session.parentCode})
                const { reference } = req.query
                const payOnline = await PayOnline.findOne({referenceNumber: reference})
                const school = await SchoolAdmin.findOne({_id: parent.school})
                const session = await Session.findOne({school: school._id, current: true})
                const term = await Term.findOne({current: true, session: session._id})
                const student = await Student.findOne({_id: payOnline.student})
                const className = await ClassSchool.findOne({_id: student.className})

                const promise7 = paystack.verifyTransaction({
                    reference
                }) 
                promise7.then(function (response){
                    PayOnline.findByIdAndUpdate(payOnline._id, {
                        verified : true
                    }, {new : true, useFindAndModify : false}, (err, item) => {
                        if(err){
                            console.log(err)
                        }
                        else{
                            const newTransaction = new Transaction({
                                student: student,
                                school: school._id,
                                session: session._id,
                                term: term._id,
                                className: className._id,
                                payment: payOnline.payment,
                                status: 'Completed'
                            })
                            let saveTransaction = newTransaction.save()
                            if(saveTransaction){
                                res.redirect(303, '/parent/verify/verify-payment/' + payOnline._id)
                            }else{
                                throw 'Unable to save'
                            }
                        }
                    })
                    
                }).catch(function (error){
                    console.error(error.message)
                })
                
            }else{
                res.json({message: 'Access denied'})
            }    
        }catch(error){
            res.json({
                message : error.message
            })
        }
    }

    getReceipt = async(req, res, next) => {
        try{
            if(req.session.parentCode){
                const parent = await Parent.findOne({parentID : req.session.parentCode})
                const payOnline = await PayOnline.findOne({_id: req.params.payID})
                const school = await SchoolAdmin.findOne({_id: parent.school})
                const student = await Student.findOne({_id: payOnline.student})
                const className = await ClassSchool.findOne({_id: student.className})
                const session = await Session.findOne({current: true, school: school._id})
                const term = await Term.findOne({current: true, session: session._id}) 
               
                res.render('student-receipt', {title : "Reciept", code: school,
                parent : parent, students: student, ward_active: "active", payOnline,
                sessS: session.name, termS: term.name, className})

            }else{
                res.redirect(303, '/parent')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }
    
    getFinancialHistory = async(req, res, next) => {
        try{
            if(req.session.parentCode){
                const parent = await Parent.findOne({parentID : req.session.parentCode})
                const student = await Student.findOne({_id : req.params.studentID})
                const school = await SchoolAdmin.findOne({_id: parent.school})
                const className = await ClassSchool.findOne({_id: student.className})
                const session = await Session.findOne({current: true, school: school._id})
                const term = await Term.findOne({current: true, session: session._id}) 
                const transactions = await Transaction.find({
                    session: session._id, term: term._id,
                    student: student._id, school: parent.school
                })
                const paymentTypes = await PaymentType.find({ school : school._id }) 

                res.render('student-finance-history', {title : "Financial Histories", code: school,
                parent : parent, students: student, ward_active: "active", paymentTypes,
                sessS: session.name, termS: term.name, transactions: transactions, className})

            }else{
                res.redirect(303, '/parent')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    getAttendance = async ( req , res , next ) => {
        try {
            if(req.session.parentCode){
                let redirectUrl = '/parent/student/' + req.params.studentID + '/attendance/1' 
               res.redirect(303, redirectUrl)
            }else{
                res.redirect(303, '/parent')
            }
        } catch (err) {
            res.render("error-page", {error: err})
        }
    }

    getEachAttendance = async ( req , res , next ) => {
        try {
            if(req.session.parentCode){
                const parent = await Parent.findOne({parentID : req.session.parentCode})
                const student = await Student.findOne({_id : req.params.studentID})
                const school = await SchoolAdmin.findOne({_id : parent.school})
                const className = await ClassSchool.findOne({_id : student.className})
                const session = await Session.findOne({school : student.school, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const attendance = await Attendance.findOne({
                    session: session._id,
                    term: term._id,
                    className: student.className,
                    student: student._id
                })
                let week1Attendance
                if(attendance){
                    if(attendance.attendance.length > 0){
                        week1Attendance = attendance.attendance.filter(week => {
                            return week.week == req.params.week
                        })

                        week1Attendance.sort((a, b) => {
                            return new Date(a.date) - new Date(b.date)
                        })
                    }
                }

                let weekday = new Array(7)
                weekday[0] = "Sunday"
                weekday[1] = "Monday"
                weekday[2] = "Tuesday"
                weekday[3] = "Wednesday"
                weekday[4] = "Thursday"
                weekday[5] = "Friday"
                weekday[6] = "Saturday"

                console.log(week1Attendance)

                res.render('parent-attendance' , {title : 'Student Attendance' , parent : parent , 
                students : student, sessS: session.name, termS: term.name, ward_active: 'active',
                week: req.params.week, attendance: week1Attendance, weekday, code: school})

            }else{
                res.redirect(303, '/parent')
            }
        } catch (err) {
            res.render("error-page", {error: err})
        }
    }

    getReportCard = async (req, res, next) => {
        try{
            if(req.session.parentCode){
                const parent = await Parent.findOne({parentID : req.session.parentCode})
                const student = await Student.findOne({_id : req.params.studentID})
                const school = await SchoolAdmin.findOne({_id: parent.school})
                const className = await ClassSchool.findOne({_id: student.className})
                const session = await Session.findOne({current: true, school: school._id})
                const term = await Term.findOne({current: true, session: session._id}) 
                if(term.name == 'Third Term'){
                    let redirectUrl = '/parent/student/' + req.params.sessionID + '/report-card/third-term'
                    res.redirect(303, redirectUrl)
                    return
                }
                const broadsheet = await Broadsheet.findOne({
                    released: true, session: session._id,
                    term: term._id, student: student._id,
                    className: className.name
                })

                res.render('parent-report-card', {title : "Report Card", schoolT: school._id,
                parent : parent, students: student, ward_active: "active", code: school, studentDB : student,
                sessS: session.name, termS: term.name, className, broadsheet})

            }else{
                res.redirect(303, '/parent')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    getReportCardThird = async (req, res, next) => {
        try{
            if(req.session.parentCode){
                const parent = await Parent.findOne({parentID : req.session.parentCode})
                const student = await Student.findOne({_id : req.params.studentID})
                const school = await SchoolAdmin.findOne({_id: parent.school})
                const className = await ClassSchool.findOne({_id: student.className})
                const session = await Session.findOne({current: true, school: school._id})
                const term = await Term.findOne({current: true, session: session._id}) 
            
                if(term.name != 'Third Term'){
                    let redirectUrl = '/parent/student/' + req.params.sessionID + '/report-card'
                    res.redirect(303, redirectUrl)
                    return
                }
                const broadsheet = await Broadsheet.findOne({
                    released: true, session: session._id,
                    term: term._id, student: student._id,
                    className: className.name
                })

                res.render('parent-report-card-third', {title : "Report Card", schoolT: school._id,
                parent : parent, students: student, ward_active: "active", code: school,
                sessS: session.name, termS: term.name, className, broadsheet})

            }else{
                res.redirect(303, '/parent')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    getAssignment = async (req, res, next) => {
        try{
            if(req.session.parentCode){
                const parent = await Parent.findOne({parentID : req.session.parentCode})
                const student = await Student.findOne({_id : req.params.studentID})
                const school = await SchoolAdmin.findOne({_id: parent.school})
                const className = await ClassSchool.findOne({_id: student.className})
                const session = await Session.findOne({current: true, school: school._id})
                const term = await Term.findOne({current: true, session: session._id}) 

                const assignments = await Assignment.find({
                    session : session._id, term : term._id, school: student.school,
                    className: className.name
                })
            
                res.render('parent-assignment', {title : "Assignments", schoolT: school._id,
                parent : parent, students: student, ward_active: "active", assignments,
                sessS: session.name, termS: term.name, className, code: school})

            }else{
                res.redirect(303, '/parent')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    getSingleAssignment = async (req, res, next) => {
        try{
            if(req.session.parentCode){
                const parent = await Parent.findOne({parentID : req.session.parentCode})
                const student = await Student.findOne({_id : req.params.studentID})
                const school = await SchoolAdmin.findOne({_id: parent.school})
                const className = await ClassSchool.findOne({_id: student.className})
                const session = await Session.findOne({current: true, school: school._id})
                const term = await Term.findOne({current: true, session: session._id}) 

                const singleAssignment = await Assignment.findOne({_id : req.params.assID})
                const staffs = await Staff.findOne({_id: singleAssignment.staff})
            
                res.render('parent-single-assignment', {title : "Assignment", schoolT: school._id,
                parent : parent, students: student, ward_active: "active", singleAssignment, staffs,
                sessS: session.name, termS: term.name, className, session, term, code: school})

            }else{
                res.redirect(303, '/parent')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    settingsPage = async(req, res, next) => {
        try{
            if(req.session.parentCode){
                const parent = await Parent.findOne({parentID : req.session.parentCode})
                res.render('parent-settings', {title : "Settings",
                    parent : parent, success : req.flash('success')})
            }else{
                res.redirect(303, '/parent')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    getLogout = (req , res , next ) => {
        try {
            if (req.session.parentCode) {
                delete req.session.parentCode
                res.redirect(303 , '/parent')
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