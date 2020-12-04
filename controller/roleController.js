const GenerateInvoice = require('./invoiceGenerator')
const SchoolAdmin = require('../model/schoolAdmin')
const Staff = require("../model/staff")
const Student = require('../model/student')
const Session = require('../model/session')
const Term = require('../model/term')
const Payment = require('../model/payment')
const PaymentType = require('../model/paymentType')
const ClassSchool = require('../model/classchool')
const PaymentProof = require('../model/payment-proof')
const Transaction = require('../model/transaction')
const Invoice = require('../model/invoice')
const Period = require('../model/period')
const Subject = require('../model/subject')
const Role = require('../model/role')
const ClassTimetable = require('../model/classTimetable')
const Day = require('../model/day')
const ExamTimetable = require('../model/examTimetable')
const ExamDay = require('../model/examDay')
const LessonNotes = require('../model/lessonNote')

class App {

    createPaymentType = async (req , res , next) => {
        try {
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode , status : 'Active'})
                if(staff.role == 'r-2'){
                    const school = await SchoolAdmin.findOne({_id : staff.school})
                    const paymentTypes = await PaymentType.find({school : school._id})
                    const session = await Session.findOne({school: school._id, current: true})
                    if(session){
                        const term = await Term.findOne({session: session._id, current: true})
                        if(term){

                            res.render('payment-type' , {title : "Payment Type" , staff : staff , code : school, 
                            openfinance_active : 'pcoded-trigger', sessS: session.name, termS: term.name,
                            error : req.flash('error'), success : req.flash('success') , finance_active : 'active', payment_active : 'active', paymentTypes : paymentTypes})
                        }else{
                            res.render('sess-term-error', {school: school, title: 'Payment Type',
                            finance_active: 'active', openfinance_active: "pcoded-trigger",code : school,
                            payment_active : "active"})
                        }
                    }else{
                        res.render('sess-term-error', {school: school, title: 'Payment Type',
                        finance_active: 'active', openfinance_active: "pcoded-trigger",code : school,
                        payment_active : "active"})
                    }
                }else{
                    res.redirect(303, '/staff')
                }
            }else {
                res.redirect(303, '/staff')
            }
        } catch (err) {
            res.render("error-page", {error: err})
        }
    }

    postPaymentType = async (req , res , next) => {
        try {
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const { paymentFor, importance } = req.body
                let status
                if(importance){
                    status = "Compulsory"
                }else{
                    status = "Optional"
                }
                const paymentType = new PaymentType ({
                    paymentFor : paymentFor ,
                    school : schoolAdmin._id,
                    importance : status 
                })  
                const saveType = await paymentType.save()
                console.log(saveType)      
                if (saveType) {
                    req.flash('success' , 'Payment Type saved successfully')
                    res.redirect(303 , '/staff/finance/payment-type')
                    return
                }else {
                    throw {
                        message : "Unable to save the Payment Typee."
                    }
                    return 
                }  
            }else{
                res.redirect(303, '/staff')
            }
        }catch (err) {
            res.render("error-page", {error: err})
        }
    }

    deletePaymentType = async ( req , res , next) => {
        try {
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode , status : 'Active'})
                if(staff.role == 'r-2'){
                    const school = await SchoolAdmin.findOne({_id : staff.school})
                    const paymentTypes = await PaymentType.findById(req.params.paymentTypeId)
                    const session = await Session.findOne({school: school._id, current: true})
                    if(session){
                        const term = await Term.findOne({session: session._id, current: true})
                        if(term){
                            const invoice = await Invoice.find({school: school._id, session: session._id})
                            console.log(invoice)
                            if(invoice.length > 0){
                                req.flash('error' , 'This Payment Type is connected to an Invoice')
                                res.redirect(303 , '/staff/finance/payment-type')
                            }else {
                                let delPaymentType = await PaymentType.findByIdAndDelete(paymentTypes._id)
                                if(delPaymentType) {
                                    req.flash('success' , 'Payment Type has been deleted.')
                                    res.redirect(303 , '/staff/finance/payment-type')
                                }else{
                                    throw{
                                        message : "Unable to delete the Payment Type"
                                    }
                                }
                            }
                        }else{
                            throw{
                                message : "Unable to delete the Payment Type"
                            }
                        }
                    } else{
                        throw{
                            message : "Unable to delete the Payment Type"
                        }
                    }   
                }else {
                    res.redirect(303, '/staff')
                }
            }else {
                res.redirect(303, '/staff')
            }
        } catch (err) {
            res.render("error-page", {error: err})
        }
    }

    getAllClass = async ( req , res , next ) => {
        try {
            if( req.session.staffCode ){
                const staff = await Staff.findOne({staffID : req.session.staffCode , status : 'Active'})
                if(staff.role == 'r-2'){
                    const school = await SchoolAdmin.findOne({_id : staff.school})
                    const classes = await ClassSchool.find({school : school._id})
                    const session = await Session.findOne({school: school._id, current: true})
                    if(session){
                        const term = await Term.findOne({session: session._id, current: true})
                        if(term){
                            res.render('all-classes' , { title : 'Classes' , staff : staff, 
                            classes : classes , code : school, openfinance_active : 'pcoded-trigger',
                            finance_active : 'active', amount_active : 'active', sessS: session.name, termS: term.name})
                        }else{
                            res.render('sess-term-error', {staff: staff, title: 'Classes',
                            finance_active: 'active', openfinance_active: "pcoded-trigger",
                            amount_active : "active"})
                        }
                    }else{
                        res.render('sess-term-error', {staff: staff, title: 'Classes',
                            finance_active: 'active', openfinance_active: "pcoded-trigger",
                            amount_active : "active"})
                    }
                }else{
                    res.redirect(303, '/staff')
                }
            }else{
                res.redirect(303, '/staff')
            }
        }catch (err) {
            res.render("error-page", {error: err})
        }
    }

    getSingleClass = async ( req , res , next ) => {
        try {
            if( req.session.staffCode ){
                const staff = await Staff.findOne({staffID : req.session.staffCode , status : 'Active'})
                if(staff.role == 'r-2'){
                    const school = await SchoolAdmin.findOne({_id : staff.school})
                    const session = await Session.findOne({ school : school._id , current : true})
                    const term = await Term.findOne({ session : session._id   , current : true})
                    const paymentTypes = await PaymentType.find({school: school._id})
                    const singleClass = await ClassSchool.findOne({ _id : req.params.classID , school: school._id})
                    const payments = await Payment.findOne({ 
                        class: req.params.classID , school: school._id,
                        session: session._id, term: term._id 
                    })
                    const availablePayments = await Payment.find({
                        school: school._id, session: session._id, term: term._id
                    })
                    const classes = await ClassSchool.find({school: school._id})
                    let invoices
                    if(payments){
                        invoices = await Invoice.find({
                            payment: payments._id
                        })
                    }
                    console.log(invoices)

                    let paymentName = {}
                    paymentTypes.map(pay => paymentName[pay._id] = pay.paymentFor)
                    let className = {}
                    classes.map(cls => className[cls._id] = cls.name)

                    res.render('single-class' , { title : "Single Class Payment Details" , staff : staff , 
                    termS : term.name , sessS : session.name , code : school, paymentTypes : paymentTypes , singleClass : singleClass , 
                    payments : payments , classDB : singleClass , paymentName : paymentName, success: req.flash('success'),
                    finance_active: 'active', openfinance_active: "pcoded-trigger", availablePayments,
                    amount_active : "active", invoices: invoices, className, error: req.flash('error')})
                }else {
                    res.redirect(303, '/staff')
                }
            }else {
                res.redirect(303, '/staff')
            }
        }catch (err) {
            res.render("error-page", {error: err})
        }
    }

    postSingleClass = async ( req , res , next ) => {
        try {
            if( req.session.staffCode ){
                const staff = await Staff.findOne({staffID : req.session.staffCode , status : 'Active'})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const paymentt = await Payment.findOne({ class: req.params.classID , school: school._id })
                const session = await Session.findOne({school: school._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const { paymentFor , amount } = req.body
                if(!paymentt) {
                    
                    const payment = new Payment ({
                        school : school._id ,
                        class : req.params.classID ,
                        session: session._id,
                        term: term._id,
                        fees : [
                            {
                                paymentFor : paymentFor ,
                                amount : amount
                            }
                        ]

                    })
                    const savePayment = await payment.save()
    
                    if( savePayment ) {
                        req.flash('success', 'Payment has been saved.')
                        res.redirect(303 ,  "/staff/finance/all-classes/" + req.params.classID)
                        return
                    }else {
                        throw{
                            message : "Cannot save this payment amount record"
                        }
                    }
                }
                else {
  
                    Payment.findByIdAndUpdate(paymentt._id, {
                        $addToSet : {
                            fees : [
                                {
                                    paymentFor : paymentFor ,
                                    amount : amount
                                }
                            ] }   
                            
                    }, {new : true, useFindAndModify : false}, (err , item) => {
                        if(err){
                            res.status(500)
                            return
                        }else {
                            req.flash('success', "Added successfully.")
                            res.redirect(303 ,  "/staff/finance/all-classes/" + req.params.classID)
                            return
                        }
                    })	
              
                }
            }else {
                res.redirect(303, '/staff')
            }
            
        } catch (err) {
            res.render('error-page', {error : err})
        }
    }

    replicatePayment = async (req, res, next) => {
        try{
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                if(staff.role == 'r-2'){
                    const school = await SchoolAdmin.findOne({_id : staff.school})
                    const session = await Session.findOne({school: school._id, current: true})
                    const term = await Term.findOne({session: session._id, current: true})
                    
                    const availablePayment = await Payment.findOne({
                        session : session._id, term: term._id,
                        school : school._id, class: req.params.cls
                    })
                    if(availablePayment){
                        const newPayment = await new Payment({
                            session : session._id,  
                            term : term._id , 
                            school : school._id,
                            class : req.params.classID, 
                            fees: availablePayment.fees
                        })
                        await newPayment.save()

                        req.flash('success', 'Payments imported successfully.')
                        let redirectUrl = '/staff/finance/all-classes/' + req.params.classID 
                        res.redirect(303, redirectUrl)
                    }else{
                        req.flash('error', 'No payments found.')
                        let redirectUrl = '/staff/finance/all-classes/' + req.params.classID 
                        res.redirect(303, redirectUrl)
                    }
                }else{
                    res.redirect(303, '/staff')
                }
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    deleteSinglePayment = async ( req , res , next) => {
        try {
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode , status : 'Active'})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({current: true, school: school._id})
                const term = await Term.findOne({current: true, session: session._id})
                const paymentt = await Payment.findOne({ 
                    class: req.params.classID , school: school._id,
                    session: session._id, term: term._id
                })
                let allFees = paymentt.fees
                let mapAll = allFees.find(elem => elem._id == req.params.feeID)
                
                Payment.findByIdAndUpdate(paymentt._id , {
                    $pullAll : {
                        fees : [mapAll]}
                } , {new : true , useFindAndModify : false} , ( err , item) => {
                    if(err){
                        res.status(500)
                        return
                    }else{
                        let redirectUrl = '/staff/finance/all-classes/' + req.params.classID 
                        res.redirect(303, redirectUrl)
                    }
                })
            }else{
                res.redirect(303, '/staff')
            }
        } catch (err) {
            res.render("error-page", {error: err})
        }
    }

    generateInvoice = async ( req , res , next ) => {
        try {
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode , status : 'Active'})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({ school : school._id , current : true})
                const term = await Term.findOne({session: session._id, current: true})
                const payments = await Payment.findOne({ 
                    class : req.params.classID , school : school._id,
                    session: session._id, term: term._id 
                })
                const invoices = await Invoice.find({payment: payments._id})
                const singleClass = await ClassSchool.findOne({ _id : req.params.classID , school: school._id})
                const students = await Student.find({school: school._id, className: req.params.classID})
                let title = `Generating Invoice for ${singleClass.name}`

                let studentName = {}
                students.map(s => studentName[s._id] = s.lastName + ' ' + s.firstName + ' ' + s.otherName)
                let studentReg = {}
                students.map(reg => studentReg[reg._id] = reg.studentID)

                res.render('generate-invoice' , { title : title , staff : staff , code : school,
                sessS: session.name , termS : term.name , payments : payments , studentDB: students,
                openfinance_active : 'pcoded-trigger', singleClass : singleClass, 
                finance_active : 'active', amount_active : 'active', invoices: invoices,
                studentName: studentName, studentReg: studentReg})
            }else{
                res.redirect('/staff')
            }
        }catch (err) {
            res.render("error-page", {error: err})
        }
    }

    createInvoice = async ( req , res , next ) => {
        try {
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode , status : 'Active'})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({school: school._id, current: true})
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
                const {target, payment} = req.body
                let count = target.length 
                while(count > 0){ 
                    for (let student of target){ 
                        const totalInvoice = await Invoice.find({session: session._id , school : school._id})
                        console.log(totalInvoice)
                        let start = "0001"
                        let code = GenerateInvoice(totalInvoice, start, "invoiceNumber", 1, 4)
                        const newInvoice = await new Invoice({
                            student : student.id,
                            session: session._id,
                            payment: payment,
                            school: school._id,
                            invoiceNumber: sess + initialName + code
                        })
                        
                        await newInvoice.save()  
                        count -= 1 
                    }
                }
                res.json({message : "Invoice has been generated."})
            }else{
                res.redirect('/staff')
            }
        }catch (err) {
            res.render("error-page", {error: err})
        }
    }

    getClassBill = async ( req , res , next ) => {
        try {
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode , status : 'Active'})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const classes = await ClassSchool.find({school : school._id})
                const session = await Session.findOne({ school : school._id , current : true})
                const term = await Term.findOne({session: session._id, current: true})
                const payments = await Payment.findOne({ class : req.params.classID , school : school._id })
                
                let paymentFees = payments.fees

                let sum = paymentFees.reduce((a, b) => a + Number(b.amount), 0)

                const paymentTypes = await PaymentType.find({ school : school._id })
                const singleClass = await ClassSchool.findOne({ _id : req.params.classID , school: school._id})

                let title = `Bill for ${singleClass.name}`

                let paymentName = {}
                paymentTypes.map(pay => paymentName[pay._id] = pay.paymentFor)

                const invoices = await Invoice.find({
                    payment: payments._id
                })

                res.render('single-class-bill' , { title : title , staff : staff , code : school,
                sessS: session.name , termS : term.name , payments : payments , paymentTypes : paymentTypes,
                paymentName : paymentName, openfinance_active : 'pcoded-trigger', school : school,
                classes : classes , singleClass : singleClass, sum: sum , 
                finance_active : 'active', amount_active : 'active', invoices: invoices})
            }else{
                res.redirect('/staff')
            }
        }catch (err) {
            res.render("error-page", {error: err})
        }
    }

    getTransactionUpload = async ( req , res , next ) => {
        try {
            if( req.session.staffCode ){
                const staff = await Staff.findOne({staffID : req.session.staffCode , status : 'Active'})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const classes = await ClassSchool.find({school : school._id})
                const session = await Session.findOne({school: school._id, current: true})
                if(session){
                    const term = await Term.findOne({session: session._id, current: true})
                    if(term){
                        const students = await Student.find({school: school._id})
                        const paymentType = await PaymentType.find({school: school._id})
                        const paymentProof = await PaymentProof.find({
                            session: session._id, term: term._id, 
                            school: school._id, recorded: false
                        })
                        res.render('transaction-uploads' , { title : 'Upload Transactions' , staff : staff, 
                        classes : classes , openfinance_active : 'pcoded-trigger', students: students,
                        finance_active : 'active', uploadT_active : 'active', sessS: session.name, termS: term.name,
                        paymentType: paymentType, code : school, success: req.flash('success'), paymentProof: paymentProof})
                    }else{
                        res.render('sess-term-error', {staff: staff, title: 'Upload Transactions',
                        finance_active: 'active', openfinance_active: "pcoded-trigger",
                        uploadT_active : "active"})
                    }
                }else{
                    res.render('sess-term-error', {staff: staff, title: 'Upload Transactions',
                    finance_active: 'active', openfinance_active: "pcoded-trigger",
                    uploadT_active : "active"})
                }
            }else{
                res.redirect(303, '/staff')
            }
        }catch (err) {
            res.render("error-page", {error: err})
        }
    }

    getProofDetails = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const code = req.session.schoolCode
                const paymentProof = await PaymentProof.findOne({_id: req.body.proof})
                const student = await Student.findOne({_id: paymentProof.student})
                res.json({
                    student, paymentProof, code
                })
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.json(err)
        }
    }

    getPaymentProof = async ( req , res , next ) => {
        try {
            if( req.session.staffCode ){
                const staff = await Staff.findOne({staffID : req.session.staffCode , status : 'Active'})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const classes = await ClassSchool.find({school : school._id})
                const session = await Session.findOne({school: school._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const paymentProof = await PaymentProof.find({
                    session: session._id, term: term._id, 
                    school: school._id, recorded: false
                })
                const students = await Student.find({school: school._id})

                let studentName = {}
                students.map(name => studentName[name._id] = name.firstName + " " + name.lastName + " " + `(${name.studentID})`)
                let className = {}
                classes.map(cls => className[cls._id] = cls.name)

                res.render('transaction-proof' , { title : 'Upload Transactions' , staff : staff, school : school,
                classes : classes , code : school, openfinance_active : 'pcoded-trigger', paymentProof: paymentProof,
                finance_active : 'active', uploadT_active : 'active', sessS: session.name, termS: term.name,
                className: className, studentName: studentName})
                
            }else{
                res.redirect(303, '/staff')
            }
        }catch (err) {
            res.render("error-page", {error: err})
        }
    }

    makeRecorded = async ( req , res , next ) => {
        try {
            if( req.session.staffCode ){
                PaymentProof.findByIdAndUpdate(req.params.proofID , {
                    recorded: true
                } ,{new : true, useAndModify : false}, (err , item) => {
                    if(err){
                        res.status(500)
                        return
                    }else{
                        req.flash('success', "Transaction has been recorded.")
                        res.redirect(303, '/staff/finance/transactions/upload/proofs')

                    }
                })
            }else{
                res.redirect(303, '/school')
            }
        }catch (err) {
            res.render("error-page", {error: err})
        }
    }

    uploadSingleTransaction = async (req, res, next) => {
        try{
            if(req.session.staffCode){
                const {studentID, target} = req.body
                const staff = await Staff.findOne({staffID : req.session.staffCode , status : 'Active'})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({school: school.id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const student = await Student.findOne({_id : studentID})
                if(student){
                    const transaction= new Transaction ({
                        school: school._id,
                        student: studentID,
                        session: session._id,
                        term: term._id,
                        className: student.className,
                        payment: target,
                        status: 'Completed'
                    })
                    const saveTransaction = await transaction.save()
                    if(saveTransaction){
                        if(req.body.proof){
                            await PaymentProof.findByIdAndUpdate(req.body.proof , {
                                recorded: true
                            } ,{new : true, useFindAndModify : false})
                            console.log(req.body.proof)
                        }
                        res.json({message: "Transaction sent!"})
                    }else{
                        throw 'Error in Saving'
                    }
                }
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    getTransactionLogs = async ( req , res , next ) => {
        try {
            if( req.session.staffCode ){
                const {studentID, target} = req.body
                const staff = await Staff.findOne({staffID : req.session.staffCode , status : 'Active'})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const classes = await ClassSchool.find({school : school._id})
                const session = await Session.findOne({school: school._id, current: true})
                if(session){
                    const term = await Term.findOne({session: session._id, current: true})
                    if(term){
                        res.render('transaction-logs' , { title : 'Upload Transactions' , staff : staff, 
                        classes : classes , code : school, openfinance_active : 'pcoded-trigger',
                        finance_active : 'active', transaction_active : 'active', sessS: session.name, termS: term.name})
                    }else{
                        res.render('sess-term-error', {staff: staff, title: 'Upload Transactions',
                        finance_active: 'active', openfinance_active: "pcoded-trigger",
                        transaction_active : "active"})
                    }
                }else{
                    res.render('sess-term-error', {staff: staff, title: 'Upload Transactions',
                    finance_active: 'active', openfinance_active: "pcoded-trigger",
                    transaction_active : "active"})
                }
            }else{
                res.redirect(303, '/staff')
            }
        }catch (err) {
            res.render("error-page", {error: err})
        }
    }

    getTodayLogs = async ( req , res , next ) => {
        try {
            if( req.session.staffCode ){
                const staff = await Staff.findOne({staffID : req.session.staffCode , status : 'Active'})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const classes = await ClassSchool.find({school : school._id})
                const session = await Session.findOne({school: school._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                let today = new Date()
                today.setHours(today.getHours() - 24)
                const transactions = await Transaction.find({
                    session: session._id, term: term._id,
                    paymentDate: {$gte: today}
                }) 
                const paymentType = await PaymentType.find({
                    school: school._id
                })

                let compulsoryPayments = await PaymentType.find({
                    school: school._id, importance: 'Compulsory'
                })
                let compulsory = [] 
                compulsoryPayments.map(e => {
                    compulsory.push(e.paymentFor)
                })
                let totalCompulsory, totalOptional, totalAll
                if(transactions.length > 0){
                    let cPayments = []
                    let oPayments = []
                    transactions.map(t => {
                        let filterCompulsory = t.payment.filter(s => compulsory.includes(s.paymentFor))
                        let filterOptional = t.payment.filter(s => !compulsory.includes(s.paymentFor))
                        let sumC = filterCompulsory.reduce((a, b) => a + Number(b.amountPaid), 0)
                        let sumO = filterOptional.reduce((a, b) => a + Number(b.amountPaid), 0)
                        cPayments.push(sumC)
                        oPayments.push(sumO)
                    })
                    totalCompulsory = cPayments.reduce((a, b) => a + b)
                    totalOptional = oPayments.reduce((a, b) => a + b)
                    totalAll = totalCompulsory + totalOptional
                }

                const students = await Student.find({school: school._id})
                let studentName = {}
                students.map(s => studentName[s._id] = s.lastName + " " + s.firstName)
                let studentReg = {}
                students.map(r => studentReg[r._id] = r.studentID)

                res.render('today-logs' , { title : 'Transactions' , staff : staff, code : school,
                classes : classes , openfinance_active : 'pcoded-trigger', today: today, transactions: transactions,
                finance_active : 'active', transaction_active : 'active', sessS: session.name, termS: term.name,
                paymentType: paymentType, studentName, studentReg, totalCompulsory, totalAll, totalOptional})
                    
            }else{
                res.redirect(303, '/staff')
            }
        }catch (err) {
            res.render("error-page", {error: err})
        }
    }

    getDailyLogs = async (req, res, next) => {
        try{
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode , status : 'Active'})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({school: school._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const transactions = await Transaction.find({
                    session: session._id, term: term._id,
                    paymentDate: {$gte: req.params.startDate, $lte: req.params.endDate}
                })
                const paymentType = await PaymentType.find({
                    school: school._id
                })

                let compulsoryPayments = await PaymentType.find({
                    school: school._id, importance: 'Compulsory'
                })
                let compulsory = [] 
                compulsoryPayments.map(e => {
                    compulsory.push(e.paymentFor)
                })
                let totalCompulsory, totalOptional, totalAll
                if(transactions.length > 0){
                    let cPayments = []
                    let oPayments = []
                    transactions.map(t => {
                        let filterCompulsory = t.payment.filter(s => compulsory.includes(s.paymentFor))
                        let filterOptional = t.payment.filter(s => !compulsory.includes(s.paymentFor))
                        let sumC = filterCompulsory.reduce((a, b) => a + Number(b.amountPaid), 0)
                        let sumO = filterOptional.reduce((a, b) => a + Number(b.amountPaid), 0)
                        cPayments.push(sumC)
                        oPayments.push(sumO)
                    })
                    totalCompulsory = cPayments.reduce((a, b) => a + b)
                    totalOptional = oPayments.reduce((a, b) => a + b)
                    totalAll = totalCompulsory + totalOptional
                }

                const students = await Student.find({school: school._id})
                let studentName = {}
                students.map(s => studentName[s._id] = s.lastName + " " + s.firstName)
                let studentReg = {}
                students.map(r => studentReg[r._id] = r.studentID)

                res.render('daily-logs' , { title : 'Transactions' , staff : staff, 
                openfinance_active : 'pcoded-trigger', transactions: transactions,
                code : school, finance_active : 'active', transaction_active : 'active', sessS: session.name, termS: term.name,
                paymentType: paymentType, studentName, studentReg, totalCompulsory, totalAll, totalOptional,
                startDate: req.params.startDate, endDate: req.params.endDate})

            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    getClassLogs = async (req, res, next) => {
        try{
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode , status : 'Active'})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({school: school._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const className = await ClassSchool.findOne({school: school._id, name: req.params.className})
                const classes = await ClassSchool.find({school: school._id})
                const transactions = await Transaction.find({
                    session: session._id, term: term._id,
                    className: className._id
                })
                const paymentType = await PaymentType.find({
                    school: school._id
                })

                let compulsoryPayments = await PaymentType.find({
                    school: school._id, importance: 'Compulsory'
                })
                let compulsory = [] 
                compulsoryPayments.map(e => {
                    compulsory.push(e.paymentFor)
                })
                let totalCompulsory, totalOptional, totalAll
                if(transactions.length > 0){
                    let cPayments = []
                    let oPayments = []
                    transactions.map(t => {
                        let filterCompulsory = t.payment.filter(s => compulsory.includes(s.paymentFor))
                        let filterOptional = t.payment.filter(s => !compulsory.includes(s.paymentFor))
                        let sumC = filterCompulsory.reduce((a, b) => a + Number(b.amountPaid), 0)
                        let sumO = filterOptional.reduce((a, b) => a + Number(b.amountPaid), 0)
                        cPayments.push(sumC)
                        oPayments.push(sumO)
                    })
                    totalCompulsory = cPayments.reduce((a, b) => a + b)
                    totalOptional = oPayments.reduce((a, b) => a + b)
                    totalAll = totalCompulsory + totalOptional
                }

                const students = await Student.find({school: school._id})
                let studentName = {}
                students.map(s => studentName[s._id] = s.lastName + " " + s.firstName)
                let studentReg = {}
                students.map(r => studentReg[r._id] = r.studentID)

                res.render('class-logs' , { title : 'Transactions' , staff : staff, 
                openfinance_active : 'pcoded-trigger', transactions: transactions, classes: classes,
                code : school, finance_active : 'active', transaction_active : 'active', sessS: session.name, termS: term.name,
                paymentType: paymentType, studentName, studentReg, totalCompulsory, totalAll, totalOptional,
                pClass: req.params.className})

            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    /**-----------Principal Role Controller----------- */

    getPrincipalStaffs = async (req , res , next) => {
        try{
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode , status : 'Active'})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({school: school._id, current: true})
                if(session){
                    const term = await Term.findOne({school: school._id, session: session._id, current: true})
                    if(term){
                        const allStaff= await Staff.find({school : school._id})
                        const roles = await Role.find({school: school._id})

                        let roleName = {}
                        roles.map(r => roleName[r.role] = r.name)

                        res.render("school-staffs" , {
                            title : "School Staffs",
                            staff : staff ,
                            allStaff,
                            code : school,
                            success : req.flash('success'),
                            staff_active : "active",
                            users_active: 'active',
                            openuser_active: "pcoded-trigger",
                            sessS: session.name,
                            termS: term.name,
                            roleName : roleName
                        })
                    }else{
                        res.render('sess-term-error', {staff: staff, title: 'School Staffs',
                        users_active: 'active', openuser_active: "pcoded-trigger",
                        staff_active : "active"})
                    }
                }else{
                    res.render('sess-term-error', {staff: staff, title: 'Staffs',
                    users_active: 'active', openuser_active: "pcoded-trigger",
                    staff_active : "active"})
                }
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    getSinglePrincipalStaff = async (req , res , next) => {
        try{
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode , status : 'Active'})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({school: school._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const roles = await Role.find({school: school._id})

                let roleName = {}
                roles.map(r => roleName[r.role] = r.name)

                res.render('single-principal-staff' , { title  : "School Staff", staffDB: staff, school : school,
                staff : staff, success : req.flash('success'), staff_active : "active",
                code : school, users_active: 'active', openuser_active: "pcoded-trigger",
                sessS: session.name, termS: term.name, roleName: roleName})
                
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    getStudentsPage = async (req , res , next) => {
        try{
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode , status : 'Active'})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({school: school._id, current: true})
                if(session){
                    const term = await Term.findOne({session: session._id, current: true})
                    if(term){
                        res.render("principal-students", {title : "Students", staff : staff,
                        error : req.flash('error'), success : req.flash('success'), student_active : "active",
                        code : school, users_active: 'active', openuser_active: "pcoded-trigger",
                        sessS: session.name, termS: term.name}) 
                    }else{
                        res.render('sess-term-error', {staff: staff, title: 'Students',
                        users_active: 'active', openuser_active: "pcoded-trigger",
                        student_active : "active"})
                    }
                }else{
                    res.render('sess-term-error', {staff: staff, title: 'Students',
                    users_active: 'active', openuser_active: "pcoded-trigger",
                    student_active : "active"})
                }
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    getAllStudents = async (req, res, next) => {
        try{
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode , status : 'Active'})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({school: school._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const classchool = await ClassSchool.find({school: school._id})

                res.render('all-principal-students', {title: 'All Students', staff: staff,
                code : school, users_active: 'active', openuser_active: "pcoded-trigger", student_active : "active",
                sessS: session.name, termS: term.name, classchool: classchool})
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render('error-page', {error: err})
        }
    }

    getSingleStudent = async (req , res , next) => {
        try{
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode , status : 'Active'})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                let validStudent = await Student.findOne({_id : req.params.studentID})
                let checkClass = await ClassSchool.findOne({_id : validStudent.className})
                const session = await Session.findOne({school: school._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                if(validStudent){
                    res.render('single-student' , { title  : "Student", studentDB: validStudent, 
                    staff : staff, studentClass : checkClass, 
                    code : school, success : req.flash('success'), student_active : "active",
                    users_active: 'active', openuser_active: "pcoded-trigger",
                    sessS: session.name, termS: term.name})
                }else{
                    throw{
                        message : "Student not found"
                    }
                }
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    updateSingleStudent = async(req, res, next) => {
        try{
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode , status : 'Active'})
                const school = await SchoolAdmin.findOne({_id : staff.school})
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
                            otherName : req.body.otherName ,
                            status : req.body.status
                        }, {new : true, useAndModify : false}, (err , item) => {
                            if(err){
                                res.status(500)
                                return
                            }else {
                                req.flash('success', "Update was successful.")
                                let redirectUrl = "/staff/new-student/" + req.params.studentID
                                res.redirect(303, redirectUrl)

                                FileHandler.moveFile(originalName , "./public/uploads/profile" , "./public/uploads/schools/" + req.session.schoolCode + "/" + checkClass.name + "/") 
                            }
                        })	
                    }else{
                        Student.findByIdAndUpdate(req.params.studentID, {
                            firstName : req.body.firstName,
                            lastName : req.body.lastName,
                            gender : req.body.gender,
                            otherName : req.body.otherName ,
                            status : req.body.status
                        }, {new : true, useAndModify : false}, (err , item) => {
                            if(err){
                                res.status(500)
                                return
                            }else {
                                req.flash('success', "Update was successful.")
                                let redirectUrl = "/staff/new-student/" + req.params.studentID
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
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    getSuspendedStudents = async (req, res, next) => {
        try{
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode , status : 'Active'})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({school: school._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const classchool = await ClassSchool.find({school: school._id})

                res.render('suspended-students', {title: 'Suspended Students', staff: staff,
                code : school, users_active: 'active', openuser_active: "pcoded-trigger", student_active : "active",
                sessS: session.name, termS: term.name, classchool: classchool})
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render('error-page', {error: err})
        }
    }

    getRevokedStudents = async (req, res, next) => {
        try{
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode , status : 'Active'})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({school: school._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const classchool = await ClassSchool.find({school: school._id})

                res.render('revoked-students', {title: 'Revoked Students', staff : staff,
                code : school, users_active: 'active', openuser_active: "pcoded-trigger", student_active : "active",
                sessS: session.name, termS: term.name, classchool: classchool})
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render('error-page', {error: err})
        }
    }

    getAllGraduates = async (req, res, next) => {
        try{
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode , status : 'Active'})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({school: school._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const students = await Student.find({school: school._id , status: 'Graduated'})

                res.render('principal-graduates', {title: 'Graduated Students', staff : staff,
                code : school, users_active: 'active', openuser_active: "pcoded-trigger", student_active : "active",
                sessS: session.name, termS: term.name, students: students})

            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render('error-page', {error: err})
        }
    }

    getGraduatedStudents = async (req, res, next) => {
        try{
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode , status : 'Active'})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({school: school._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const classchool = await ClassSchool.find({school: school._id})

                res.render('principal-graduate-students', {title: 'Graduate Students', staff : staff,
                code : school, users_active: 'active', openuser_active: "pcoded-trigger", student_active : "active",
                sessS: session.name, termS: term.name, classchool: classchool})
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render('error-page', {error: err})
        }
    }

    graduateEachClass = async (req, res, next) => {
        try{
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode , status : 'Active'})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({school: school._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const students = await Student.find({school: school._id, className: req.params.classID, status: 'Active'})
                const classname = await ClassSchool.findOne({_id: req.params.classID})
                const classchool = await ClassSchool.find({school: school._id})

                res.render('graduate-class', {title: 'Graduate Students', staff :staff,
                code : school, users_active: 'active', openuser_active: "pcoded-trigger", student_active : "active",
                sessS: session.name, termS: term.name, students: students, pClass : classname,
                classchool: classchool})

            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render('error-page', {error: err})
        }
    }

    getPeriodPage = async (req , res , next) => {
        if(req.session.staffCode) {
            try{
                const staff = await Staff.findOne({staffID : req.session.staffCode , status : 'Active'})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({school : school._id, current: true})
                if(session) {
                    const term = await Term.findOne({school: school._id, session: session._id, current: true})
                    if(term) {
                        const periods = await Period.find({school : school._id}).sort([['startTime' , 'ascending']]) 
                        res.render("principal-period-page" , {
                            periods : periods ,
                            title : "Timetable Periods" ,
                            staff : staff ,
                            code : school,
                            sessS: session.name,
                            termS: term.name ,
                            success : req.flash('success'),
                            period_active: 'active',
                            timetable_active : "active" ,
                            opentimetable_active: "pcoded-trigger",
                        })
                    }else{
                        res.render('sess-term-error', {staff : staff, title: 'Exam Settings',
                        period_active: 'active', opentimetable_active: "pcoded-trigger",
                        timetable_active : "active"})
                    }
                }else{
                    res.render('sess-term-error', {staff : staff, title: 'Exam Settings',
                    period_active: 'active', opentimetable_active: "pcoded-trigger",
                    timetable_active : "active"})
                }
            }catch(err){
                res.render('error-page', {error : err})
            }
            
        }else{
            res.redirect(303 , '/staff')
        }
    }

    postPeriodPage = async (req , res , next) => {
        if(req.session.staffCode) {
            try{
                const staff = await Staff.findOne({staffID : req.session.staffCode , status : 'Active'})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const {day , periodNum , startTime , endTime , weekday } = req.body
                const periodd = await Period.findOne({ school : school._id })
                if(!periodd) {
                    const period = new Period({
                        weekday : [{
                            day : day ,
                            periodNum : periodNum ,
                            startTime : startTime ,
                            endTime : endTime ,
                        }],
                        school : school._id
                    })
                    const savePeriod = await period.save()
                    if (savePeriod) {
                        req.flash('success', 'Period successfully created!')
                        res.redirect(303 , '/staff/period')
                        return
                    }else {
                        throw {
                            message : 'Unable to save Period'
                        }
                    }
                }
                if(periodd){
                    Period.findByIdAndUpdate(periodd._id, {
                        $addToSet : {
                            weekday : [{
                                day : day ,
                                periodNum : periodNum ,
                                startTime : startTime ,
                                endTime : endTime ,
                            }],
                        }
                    }, {new : true, useAndModify : false}, (err , item) => {
                        if(err){
                            res.status(500)
                            return
                        }else {
                            req.flash('success', 'Period successfully created!')
                            res.redirect(303, '/staff/period/')
                        }
                    })	
                }
            }catch(err) {
                res.render('error-page', {error : err})
            }
        }else {
            res.redirect(303 , '/staff')
        }
    }

    removePeriod = async (req, res, next) => {
        try{
            if(req.session.staffCode){ 
                const staff = await Staff.findOne({staffID : req.session.staffCode , status : 'Active'})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const periods = await Period.findOne({school : school._id}) 
                const allPeriods = periods.weekday
                let mapIt = allPeriods.find( elem => elem._id == req.params.day)
                Period.findByIdAndUpdate(periods._id, {
                    $pullAll : {
                        weekday : [mapIt] }
                }, {new : true, useAndModify : false}, (err , item) => {
                    if(err){
                        res.status(500) 
                        return
                    }else {
                        req.flash('success', "Your deletion was successful.") 
                        res.redirect(303, '/staff/period')
                    }
                })
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    getDayPage = async (req , res , next) => {
        if(req.session.staffCode) {
            try{
                const staff = await Staff.findOne({staffID : req.session.staffCode , status : 'Active'})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({school : school._id, current: true})
                if(session) {
                    const term = await Term.findOne({school: school._id, session: session._id, current: true})
                    if(term) {
                        const days = await Day.find({school : school._id})
                        res.render("principal-day-page" , {
                            days : days ,
                            title : "Set Weekdays" ,
                            staff : staff ,
                            code : school,
                            sessS: session.name,
                            termS: term.name ,
                            success : req.flash('success'),
                            period_active: 'active',
                            timetable_active : "active" ,
                            opentimetable_active: "pcoded-trigger",
                        })    
                    }else{
                        res.render('sess-term-error', {staff : staff, title: 'Exam Settings',
                        period_active: 'active', opentimetable_active: "pcoded-trigger",
                        timetable_active : "active"})
                    }
                }else{
                    res.render('sess-term-error', {staff : staff, title: 'Exam Settings',
                    period_active: 'active', opentimetable_active: "pcoded-trigger",
                    timetable_active : "active"})
                }
            }catch(err){
                res.render('error-page', {error : err})
            }
        }else{
            res.redirect(303 , '/staff')
        }
    }

    postDayPage = async (req , res , next) => {
        if(req.session.staffCode) {
            try{
                const staff = await Staff.findOne({staffID : req.session.staffCode , status : 'Active'})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const {weekday } = req.body
                const day = new Day({
                    school : school._id ,
                    weekday : weekday
                })
                const saveDay = await day.save()
                if (saveDay) {
                    req.flash('success' , 'Weekday created successfully!')
                    res.redirect(303 , '/staff/day')
                    return
                }else {
                    throw {
                        message : 'Unable to save Period'
                    }
                }
            }catch(err) {
                res.render('error-page', {error : err})
            }
        }else {
            res.redirect(303 , '/staff')
        }
    }
    
    deleteDay = async (req , res , next ) => {
        if(req.session.staffCode) {
            const staff = await Staff.findOne({staffID : req.session.staffCode , status : 'Active'})
            const school = await SchoolAdmin.findOne({_id : staff.school})
            try {
                let day = await Day.findById(req.params.dayID) 
                if ( day ) {
                    let delDay =  await Day.findByIdAndRemove(day._id) 
                    if ( delDay ) {
                        req.flash('success' , 'Weekday has been cancelled successfully.')
                        res.redirect(303 , '/staff/day')
                    }else {
                        throw {
                            status : 500 ,
                            message : "Internal Server Error"
                        }
                    }
                }else {
                    throw {
                        status : 400 ,
                        message : "Something went wrong with the request "
                    }
                }
            }catch(error){
                res.sendStatus(error.status).json({message : error.message})
                return 
            }
        }
        else{
            res.redirect(303, '/staff')
        }
    }

    deleteDay = async (req , res , next ) => {
        if(req.session.staffCode) {
            const staff = await Staff.findOne({staffID : req.session.staffCode , status : 'Active'})
            const school = await SchoolAdmin.findOne({_id : staff.school})
            try {
                let day = await Day.findById(req.params.dayID) 
                if ( day ) {
                    let delDay =  await Day.findByIdAndRemove(day._id) 
                    if ( delDay ) {
                        req.flash('success' , 'Weekday has been cancelled successfully.')
                        res.redirect(303 , '/staff/day')
                    }else {
                        throw {
                            status : 500 ,
                            message : "Internal Server Error"
                        }
                    }
                }else {
                    throw {
                        status : 400 ,
                        message : "Something went wrong with the request "
                    }
                }
            }catch(error){
                res.sendStatus(error.status).json({message : error.message})
                return 
            }
        }
        else{
            res.redirect(303, '/staff')
        }
    }

    getTimetablePage = async (req, res, next) => {
        if(req.session.staffCode){
            try {
                const staff = await Staff.findOne({staffID : req.session.staffCode , status : 'Active'})
                const school = await SchoolAdmin.findOne({_id : staff.school})  
                const session = await Session.findOne({school : school._id, current: true})
                if(session) {
                    const term = await Term.findOne({school: school._id, session: session._id, current: true})
                    if(term) { 
                        const classchool = await ClassSchool.find({school : school._id})
                        res.render('principal-timetable-page', {
                             title : 'Timetable', 
                             staff : staff,
                             classchool : classchool,
                             attendance_active: "active" ,
                             sessS: session.name,
                             code : school,
                             termS: term.name ,
                             success : req.flash('success'),
                             time_active: 'active',
                             timetable_active : "active" ,
                             opentimetable_active: "pcoded-trigger",
                        })
                    }else{
                        res.render('sess-term-error', {staff : staff, title: 'Exam Settings',
                        time_active: 'active', opentimetable_active: "pcoded-trigger",
                        timetable_active : "active"})
                    }
                }else{
                    res.render('sess-term-error', {staff : staff, title: 'Exam Settings',
                    time_active: 'active', opentimetable_active: "pcoded-trigger",
                    timetable_active : "active"})
                }
            }catch(error){
                res.sendStatus(error.status).json({message : error.message})
                return 
            }
        }else{
            res.render(303, '/staff')
        }
    }

    getClasTimetablePage = async (req , res , next) => {
        if(req.session.staffCode) {
            try{
                const staff = await Staff.findOne({staffID : req.session.staffCode , status : 'Active'})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({school : school._id, current: true})
                if(session) {
                    const term = await Term.findOne({school: school._id, session: session._id, current: true})
                    if(term) {  
                        const periods = await Period.find({school : school._id})
                        const subjects = await Subject.findOne({school : school._id})
                        const timetables = await ClassTimetable.findOne({school : school._id, class : req.params.classID})
                        const day = await Day.find({school : school._id})
                        const classSchools = await ClassSchool.findOne({school : school._id , _id : req.params.classID})
                        res.render("principal-classtimetable-page" , {
                            timetables : timetables ,
                            subjects : subjects ,
                            periods : periods ,
                            code : school,
                            day : day ,
                            title : "Timetable Periods" ,
                            staff : staff,
                            classSchools : classSchools ,
                            sessS: session.name,
                             termS: term.name ,
                             success : req.flash('success'),
                             time_active: 'active',
                             timetable_active : "active" ,
                             opentimetable_active: "pcoded-trigger",
                        })
                    }else{
                        res.render('sess-term-error', {staff : staff, title: 'Exam Settings',
                        time_active: 'active', opentimetable_active: "pcoded-trigger",
                        timetable_active : "active"})
                    }
                }else{
                    res.render('sess-term-error', {staff : staff, title: 'Exam Settings',
                    time_active: 'active', opentimetable_active: "pcoded-trigger",
                    timetable_active : "active"})
                }		
            }catch(err){
                res.render('error-page', {error : err})
            }
            
        }else{
            res.redirect(303 , '/staff')
        }
    }

    getDaySubjectPage = async (req , res , next) => {
        if(req.session.staffCode) {
            try{
                const staff = await Staff.findOne({staffID : req.session.staffCode , status : 'Active'})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({school : school._id, current: true})
                if(session) {
                    const term = await Term.findOne({school: school._id, session: session._id, current: true})
                    if(term) {  
                        const periods = await Period.findOne({school : school._id})
                        const subjects = await Subject.findOne({school : school._id})
                        const timetables = await ClassTimetable.findOne({school : school._id, class : req.params.classID , day : req.params.dayID})
                        const day = await Day.findOne({school : school._id , _id : req.params.dayID})
                        const classSchools = await ClassSchool.findOne({school : school._id , _id : req.params.classID}) 
                        let result         
                        if(timetables) {
                            result = timetables.subject.sort((a,b) => (a.periodNum - b.periodNum))
                        }  else {
                            result = null
                        }
                        res.render("principal-daysubject-page" , {
                            timetables : result ,
                            subjects : subjects ,
                            periods : periods ,
                            day : day ,
                            code : school,
                            title : "Timetable Periods" ,
                            staff : staff,
                            classSchools : classSchools ,
                            sessS: session.name,
                             termS: term.name ,
                             success : req.flash('success'),
                             time_active: 'active',
                             timetable_active : "active" ,
                             opentimetable_active: "pcoded-trigger",
                        })
                    }else{
                        res.render('sess-term-error', {staff : staff, title: 'Exam Settings',
                        time_active: 'active', opentimetable_active: "pcoded-trigger",
                        timetable_active : "active"})
                    }
                }else{
                    res.render('sess-term-error', {staff : staff, title: 'Exam Settings',
                    time_active: 'active', opentimetable_active: "pcoded-trigger",
                    timetable_active : "active"})
                }		
            }catch(err){
                res.render('error-page', {error : err})
            }
            
        }else{
            res.redirect(303 , '/staff')
        }
    }

    postTimetablePage = async (req , res , next) => {
        if(req.session.staffCode) {
            try{
                const staff = await Staff.findOne({staffID : req.session.staffCode , status : 'Active'})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const classSchool = await ClassSchool.findOne({school : school._id , _id : req.params.classID}) 
                const session = await Session.findOne({school : school._id , current : true}) 
                const subjects = await Subject.find({school : school._id})
                const term = await Term.findOne({school : school._id}) 
                const day = await Day.findOne({school : school._id , _id : req.params.dayID})
    
                const {nameOfDay , periodNum , subjectName } = req.body
                const periodd = await ClassTimetable.findOne({ school : school._id , class : req.params.classID , day : req.params.dayID })
                if(!periodd) {  
                    const classTimetable = new ClassTimetable({
                        subject : [{
                            subjectName : subjectName ,
                            periodNum : periodNum ,
                        }],
                        nameOfDay : day.weekday ,
                        day :  day._id,
                        school : school._id ,
                        session : session._id ,
                        term : term._id ,
                        class : classSchool._id ,
    
    
                    })
                    const saveClassTimetable = await classTimetable.save()
                    if (saveClassTimetable) {
                        req.flash('success' , 'Data Entered Successfully!')
                        res.redirect(303 , '/staff/timetable/class/' + classSchool._id + '/class-timetable/day/' +day._id + '/subject')
                        return
                    }else {
                        throw {
                            message : 'Unable to save Period'
                        }
                    }
                }
                if(periodd){
                    ClassTimetable.findByIdAndUpdate(periodd._id, {
                        $addToSet : {
                            subject : [{
                                subjectName : subjectName ,
                                periodNum : periodNum ,
                            }],
                        }
                    }, {new : true, useAndModify : false}, (err , item) => {
                        if(err){
                            res.status(500)
                            return
                        }else {
                            req.flash('success' , 'Data Entered Successfully!')
                            res.redirect(303 , '/staff/timetable/class/' + classSchool._id + '/class-timetable/day/' +day._id + '/subject')
                        }
                    })	
                }
            }catch(err) {
                res.render('error-page', {error : err})
            }
        }else {
            res.redirect(303 , '/staff')
        }
    }

    removeDaySubject = async (req, res, next) => {
        try{
            if(req.session.staffCode){ 
                const staff = await Staff.findOne({staffID : req.session.staffCode , status : 'Active'})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const periods = await ClassTimetable.findOne({ school : school._id , class : req.params.classID , day : req.params.dayID })
                const classSchool = await ClassSchool.findOne({school : school._id , _id : req.params.classID}) 
                const day = await Day.findOne({school : school._id , _id : req.params.dayID})
                
                const allPeriods = periods.subject
                let mapIt = allPeriods.find( elem => elem._id == req.params.subjectID)
                ClassTimetable.findByIdAndUpdate(periods._id, {
                    $pullAll : {
                        subject : [mapIt] }
                }, {new : true, useAndModify : false}, (err , item) => {
                    if(err){
                        res.status(500) 
                        return
                    }else {
                        req.flash('success', "Your deletion was successful.") 
                        res.redirect(303 , '/school/timetable/class/' + classSchool._id + '/class-timetable/day/' +day._id + '/subject')
                    }
                })
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }
    
    getAllTimetables = async (req , res , next) => {
        if(req.session.staffCode) {
            try{
                const staff = await Staff.findOne({staffID : req.session.staffCode , status : 'Active'})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({school : school._id, current: true})
                if(session) {
                    const term = await Term.findOne({school: school._id, session: session._id, current: true})
                    if(term) {  
                        const periods = await Period.find({school : school._id})
                        const subjects = await Subject.findOne({school : school._id})
                        const timetables = await ClassTimetable.find({school : school._id , class : req.params.classID })
                        const day = await Day.find({school : school._id})
                        const classSchools = await ClassSchool.findOne({school : school._id , _id : req.params.classID })
                        let resArr    
                        if(timetables) {
                            resArr = timetables.map(item => {
                                console.log(item.subject)
                                item.subject = item.subject.sort((a,b) => (a.periodNum - b.periodNum)) 
                                return item
                            })
                            console.log(resArr)
                        }  else {
                            result = null
                        }
            
                        res.render("all-time" , {
                            timetables : resArr ,
                            subjects : subjects ,
                            periods : periods ,
                            code : school,
                            day : day ,
                            title : `Timetable Periods for ${classSchools.name}` ,
                            staff : staff,
                            classSchools : classSchools ,
                            sessS: session.name,
                            termS: term.name ,
                            time_active: 'active',
                            timetable_active : "active" ,
                            opentimetable_active: "pcoded-trigger",
                        })
                    } else{
                        res.render('sess-term-error', {staff : staff, title: 'Exam Settings',
                        time_active: 'active', opentimetable_active: "pcoded-trigger",
                        timetable_active : "active"})
                    }
                }else{
                    res.render('sess-term-error', {staff : staff, title: 'Exam Settings',
                    time_active: 'active', opentimetable_active: "pcoded-trigger",
                    timetable_active : "active"})
                }	
            }catch(err){
                res.render('error-page', {error : err})
            }
            
        }else{
            res.redirect(303 , '/staff')
        }
    }

    getExamTimetablePage = async (req, res, next) => {
        try{
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode , status : 'Active'})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({school : school._id, current: true})
                if(session) {
                    const term = await Term.findOne({school: school._id, session: session._id, current: true})
                    if(term) {  
                        const classchool = await ClassSchool.find({school : school._id})
                        res.render('principal-examtimetable-page', {title : 'Exam Timetable', staff : staff,
                            classchool : classchool ,
                            sessS: session.name,
                            code : school,
                            termS: term.name ,
                            examtime_active: 'active',
                            timetable_active : "active" ,
                            opentimetable_active: "pcoded-trigger",
                        })
                    }else{
                        res.render('sess-term-error', {staff: staff, title: 'Exam Settings',
                        examtime_active: 'active', opentimetable_active: "pcoded-trigger",
                        timetable_active : "active"})
                    }
                }else{
                    res.render('sess-term-error', {staff : staff, title: 'Exam Settings',
                    examtime_active: 'active', opentimetable_active: "pcoded-trigger",
                    timetable_active : "active"})
                }	
    
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    getExamDayPage = async (req , res , next) => {
        if(req.session.staffCode) {
            try{
                const staff = await Staff.findOne({staffID : req.session.staffCode , status : 'Active'})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({school : school._id, current: true})
                if(session) {
                    const term = await Term.findOne({school: school._id, session: session._id, current: true})
                    if(term) {  
                        const days = await ExamDay.find({school : school._id}).sort([['nameOfDay' , 'ascending']]) 
                        res.render("principal-examday-page" , {
                            days : days ,
                            title : "Set Exam Days" ,
                            staff :staff ,
                            code : school,
                            sessS: session.name,
                            termS: term.name ,
                            success : req.flash('success'),
                            examtime_active: 'active',
                            timetable_active : "active" ,
                            opentimetable_active: "pcoded-trigger",
                        })
                    }else{
                        res.render('sess-term-error', {staff : staff, title: 'Exam Settings',
                        examtime_active: 'active', opentimetable_active: "pcoded-trigger",
                        timetable_active : "active"})
                    }
                }else{
                    res.render('sess-term-error', {staff : staff, title: 'Exam Settings',
                    examtime_active: 'active', opentimetable_active: "pcoded-trigger",
                    timetable_active : "active"})
                }	
            }catch(err){
                res.render('error-page', {error : err})
            }
            
        }else{
            res.redirect(303 , '/staff')
        }
    }
    
    postExamDayPage = async (req , res , next) => {
        if(req.session.staffCode) {
            try{
                const staff = await Staff.findOne({staffID : req.session.staffCode , status : 'Active'})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const {nameOfDay } = req.body
                const day = new ExamDay({
                    school : school._id ,
                    nameOfDay : nameOfDay
                })
                const saveDay = await day.save()
                if (saveDay) {
                    req.flash('success' , 'Data Entered Successfully!')
                    res.redirect(303 , '/staff/exam-day')
                    return
                }else {
                    throw {
                        message : 'Unable to save Exam Date'
                    }
                }
            }catch(err) {
                res.send(err.message)
            }
        }else {
            res.redirect(303 , '/staff')
        }
    }

    deleteExamDay = async (req , res , next ) => {
        if(req.session.staffCode) {
            const staff = await Staff.findOne({staffID : req.session.staffCode , status : 'Active'})
            const school = await SchoolAdmin.findOne({_id : staff.school})
            try {
                let examDay = await ExamDay.findById(req.params.examDayID) 
                if ( examDay ) {
                    let delDay =  await ExamDay.findByIdAndRemove(examDay._id) 
                    if ( delDay ) {
                        req.flash('success' , 'Exam day has been cancelled successfully.')
                        res.redirect(303 , '/staff/exam-day')
                    }else {
                        throw {
                            status : 500 ,
                            message : "Internal Server Error"
                        } 
                    }
                }else {
                    throw {
                        status : 400 ,
                        message : "Something went wrong with the request "
                    }
                }
            }catch(error){
                res.sendStatus(error.status).json({message : error.message})
                return 
            }
        }
        else{
            res.redirect(303, '/staff')
        }
    }

    getClassExamTimetablePage = async (req , res , next) => {
        if(req.session.staffCode) {
            try{
                const staff = await Staff.findOne({staffID : req.session.staffCode , status : 'Active'})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({school : school._id, current: true})
                if(session) {
                    const term = await Term.findOne({school: school._id, session: session._id, current: true})
                    if(term) {  
                        const timetables = await ExamTimetable.findOne({school : school._id, class : req.params.classID})
                        const day = await ExamDay.find({school : school._id}).sort([['nameOfDay' , 'ascending']])
                        const classSchools = await ClassSchool.findOne({school : school._id , _id : req.params.classID})
                        res.render("principal-classexamtimetable-page" , {
                            timetables : timetables ,
                            day : day ,
                            title : "Exam Days" ,
                            code : school,
                            staff : staff,
                            classSchools : classSchools ,
                            sessS: session.name,
                            termS: term.name ,
                            success : req.flash('success'),
                            examtime_active: 'active',
                            timetable_active : "active" ,
                            opentimetable_active: "pcoded-trigger",
                        })
                    }else{
                        res.render('sess-term-error', {staff: staff, title: 'Exam Settings',
                        examtime_active: 'active', opentimetable_active: "pcoded-trigger",
                        timetable_active : "active"})
                    }
                }else{
                    res.render('sess-term-error', {staff : staff, title: 'Exam Settings',
                    examtime_active: 'active', opentimetable_active: "pcoded-trigger",
                    timetable_active : "active"})
                }		
            }catch(err){
                res.render('error-page', {error : err})
            }
            
        }else{
            res.redirect(303 , '/staff')
        }
    }

    getExamDaySubjectPage = async (req , res , next) => {
        if(req.session.staffCode) {
            try{
                const staff = await Staff.findOne({staffID : req.session.staffCode , status : 'Active'})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({school : school._id, current: true})
                if(session) {
                    const term = await Term.findOne({school: school._id, session: session._id, current: true})
                    if(term) {  
                        const subjects = await Subject.findOne({school : school._id})
                        const session = await Session.findOne({school : school._id , current : true}) 
                        const timetables = await ExamTimetable.findOne({school : school._id, class : req.params.classID , examDay : req.params.examDayID})
                        const examDay = await ExamDay.findOne({school : school._id , _id : req.params.examDayID})
                        const classSchools = await ClassSchool.findOne({school : school._id , _id : req.params.classID}) 
                        let result         
                        if(timetables) {
                            result = timetables.subject.sort((a,b) => (a.periodNum - b.periodNum))
                        }  else {
                            result = null
                        }
            
                        res.render("examdaysubject-page" , {
                            timetables : result ,
                            subjects : subjects ,
                            examDay : examDay ,
                            code : school,
                            title : "Timetable Periods" ,
                            staff : staff,
                            classSchools : classSchools ,
                            sessS: session.name,
                            termS: term.name ,
                            success : req.flash('success'),
                            examtime_active: 'active',
                            timetable_active : "active" ,
                            opentimetable_active: "pcoded-trigger",
                        })
                    } else{
                        res.render('sess-term-error', {ataff: staff, title: 'Exam Settings',
                        examtime_active: 'active', opentimetable_active: "pcoded-trigger",
                        timetable_active : "active"})
                    }
                }else{
                    res.render('sess-term-error', {staff : staff, title: 'Exam Settings',
                    examtime_active: 'active', opentimetable_active: "pcoded-trigger",
                    timetable_active : "active"})
                }		
            }catch(err){
                res.render('error-page', {error : err})
            }
            
        }else{
            res.redirect(303 , '/staff')
        }
    }
    
    
    postExamTimetablePage = async (req , res , next) => {
        if(req.session.staffCode) {
            try{
                const staff = await Staff.findOne({staffID : req.session.staffCode , status : 'Active'})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const classSchool = await ClassSchool.findOne({school : school._id , _id : req.params.classID}) 
                const session = await Session.findOne({school : school._id , current : true}) 
                const subjects = await Subject.find({school : school._id})
                // const term = await Term.findOne({school : schoolAdmin._id , current : true}) 
                const examDay = await ExamDay.findOne({school : school._id , _id : req.params.examDayID})
    
                const {nameOfDay , periodNum , subjectName , endTime , startTime} = req.body
                const periodd = await ExamTimetable.findOne({ school : school._id , class : req.params.classID , examDay : req.params.examDayID })
                if(!periodd) {  
                    const examTimetable = new ExamTimetable({
                        subject : [{
                            subjectName : subjectName ,
                            periodNum : periodNum ,
                            startTime : startTime ,
                            endTime : endTime
                        }],
                        nameOfDay : examDay.nameOfDay.toLocaleDateString() ,
                        examDay :  examDay._id,
                        school : school._id ,
                        session : session._id ,
                        // term : term._id ,
                        class : classSchool._id ,
    
    
                    })
                    const saveExamTimetable = await examTimetable.save()
                    if (saveExamTimetable) {
                        req.flash('success' , 'Data Entered Successfully!')
                        res.redirect(303 , '/staff/exam-timetable/class/' + classSchool._id + '/day/' +examDay._id + '/subject')
                        return
                    }else {
                        throw {
                            message : 'Unable to save Subject'
                        }
                    }
                }
                if(periodd){
                    // if (periodd.day)
                    ExamTimetable.findByIdAndUpdate(periodd._id, {
                        $addToSet : {
                            subject : [{
                                subjectName : subjectName ,
                                periodNum : periodNum ,
                                startTime : startTime ,
                                endTime : endTime
                            }],
                        }
                    }, {new : true, useAndModify : false}, (err , item) => {
                        if(err){
                            res.status(500)
                            return
                        }else {
                            res.redirect(303 , '/staff/exam-timetable/class/' + classSchool._id + '/day/' +examDay._id + '/subject')
                        }
                    })	
                }
            }catch(err) {
                res.render('error-page', {error : err})
            }
        }else {
            res.redirect(303 , '/staff')
        }
    }

    removeExamDaySubject = async (req, res, next) => {
        try{
            if(req.session.staffCode){ 
                const staff = await Staff.findOne({staffID : req.session.staffCode , status : 'Active'})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const periods = await ExamTimetable.findOne({ school : school._id , class : req.params.classID , examDay : req.params.examDayID })
                const classSchool = await ClassSchool.findOne({school : school._id , _id : req.params.classID}) 
                const examDay = await ExamDay.findOne({school : school._id , _id : req.params.examDayID})
                
                const allPeriods = periods.subject
                let mapIt = allPeriods.find( elem => elem._id == req.params.subjectID)
                // console.log(mapIt)
                ExamTimetable.findByIdAndUpdate(periods._id, {
                    $pullAll : {
                        subject : [mapIt] }
                }, {new : true, useAndModify : false}, (err , item) => {
                    if(err){
                        res.status(500) 
                        return
                    }else {
                        req.flash('success', "Your deletion was successful.") 
                        res.redirect(303 , '/staff/exam-timetable/class/' + classSchool._id + '/day/' +examDay._id + '/subject')
                    }
                })
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    getAllExamTimetables = async (req , res , next) => {
        if(req.session.staffCode) {
            try{
                const staff = await Staff.findOne({staffID : req.session.staffCode , status : 'Active'})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({school : school._id, current: true})
                if(session) {
                    const term = await Term.findOne({school: school._id, session: session._id, current: true})
                    if(term) {  
                        const timetables = await ExamTimetable.find({school : school._id , class : req.params.classID })
                        const examDay = await ExamDay.find({school : school._id})
                        const classSchools = await ClassSchool.findOne({school : school._id , _id : req.params.classID })
                        let resArr    
                        if(timetables) {
                            resArr = timetables.map(item => {
                                console.log(item.subject)
                                item.subject = item.subject.sort((a,b) => (a.periodNum - b.periodNum)) 
                                return item
                            })
                            console.log(resArr)
                        }  else {
                            result = null
                        }
            
                        res.render("allexam-time" , {
                            timetables : resArr ,
                            examDay : examDay ,
                            title : `Exam Timetable for ${classSchools.name}` ,
                            staff : staff,
                            classSchools : classSchools ,
                            classSchools : classSchools ,
                            sessS: session.name,
                            code : school,
                            termS: term.name ,
                            success : req.flash('success'),
                            examtime_active: 'active',
                            timetable_active : "active" ,
                            opentimetable_active: "pcoded-trigger",
                            term : term
                        })
                    } else{
                        res.render('sess-term-error', {staff : staff, title: 'Exam Settings',
                        examtime_active: 'active', opentimetable_active: "pcoded-trigger",
                        timetable_active : "active"})
                    }
                }else{
                    res.render('sess-term-error', {staff : staff, title: 'Exam Settings',
                    examtime_active: 'active', opentimetable_active: "pcoded-trigger",
                    timetable_active : "active"})
                }	 		
            }catch(err){
                res.render('error-page', {error : err})
            }
            
        }else{
            res.redirect(303 , '/staff')
        }
    }

    getPrincipalTransactionLogs = async ( req , res , next ) => {
        try {
            if( req.session.staffCode ){
                const {studentID, target} = req.body
                const staff = await Staff.findOne({staffID : req.session.staffCode , status : 'Active'})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const classes = await ClassSchool.find({school : school._id})
                const session = await Session.findOne({school: school._id, current: true})
                if(session){
                    const term = await Term.findOne({session: session._id, current: true})
                    if(term){
                        res.render('principal-transaction-logs' , { title : 'Upload Transactions' , staff : staff, 
                        classes : classes , code : school, openfinance_active : 'pcoded-trigger',
                        finance_active : 'active', transaction_active : 'active', sessS: session.name, termS: term.name})
                    }else{
                        res.render('sess-term-error', {staff: staff, title: 'Upload Transactions',
                        finance_active: 'active', openfinance_active: "pcoded-trigger",
                        transaction_active : "active"})
                    }
                }else{
                    res.render('sess-term-error', {staff: staff, title: 'Upload Transactions',
                    finance_active: 'active', openfinance_active: "pcoded-trigger",
                    transaction_active : "active"})
                }
            }else{
                res.redirect(303, '/staff')
            }
        }catch (err) {
            res.render("error-page", {error: err})
        }
    }

    getPrincipalTodayLogs = async ( req , res , next ) => {
        try {
            if( req.session.staffCode ){
                const staff = await Staff.findOne({staffID : req.session.staffCode , status : 'Active'})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const classes = await ClassSchool.find({school : school._id})
                const session = await Session.findOne({school: school._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                let today = new Date()
                today.setHours(today.getHours() - 24)
                const transactions = await Transaction.find({
                    session: session._id, term: term._id,
                    paymentDate: {$gte: today}
                }) 
                const paymentType = await PaymentType.find({
                    school: school._id
                })

                let compulsoryPayments = await PaymentType.find({
                    school: school._id, importance: 'Compulsory'
                })
                let compulsory = [] 
                compulsoryPayments.map(e => {
                    compulsory.push(e.paymentFor)
                })
                let totalCompulsory, totalOptional, totalAll
                if(transactions.length > 0){
                    let cPayments = []
                    let oPayments = []
                    transactions.map(t => {
                        let filterCompulsory = t.payment.filter(s => compulsory.includes(s.paymentFor))
                        let filterOptional = t.payment.filter(s => !compulsory.includes(s.paymentFor))
                        let sumC = filterCompulsory.reduce((a, b) => a + Number(b.amountPaid), 0)
                        let sumO = filterOptional.reduce((a, b) => a + Number(b.amountPaid), 0)
                        cPayments.push(sumC)
                        oPayments.push(sumO)
                    })
                    totalCompulsory = cPayments.reduce((a, b) => a + b)
                    totalOptional = oPayments.reduce((a, b) => a + b)
                    totalAll = totalCompulsory + totalOptional
                }

                const students = await Student.find({school: school._id})
                let studentName = {}
                students.map(s => studentName[s._id] = s.lastName + " " + s.firstName)
                let studentReg = {}
                students.map(r => studentReg[r._id] = r.studentID)

                res.render('principal-today-logs' , { title : 'Transactions' , staff : staff, code : school, 
                classes : classes , openfinance_active : 'pcoded-trigger', today: today, transactions: transactions,
                finance_active : 'active', transaction_active : 'active', sessS: session.name, termS: term.name,
                paymentType: paymentType, studentName, studentReg, totalCompulsory, totalAll, totalOptional})
                    
            }else{
                res.redirect(303, '/staff')
            }
        }catch (err) {
            res.render("error-page", {error: err})
        }
    }

    getPrincipalDailyLogs = async (req, res, next) => {
        try{
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode , status : 'Active'})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({school: school._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const transactions = await Transaction.find({
                    session: session._id, term: term._id,
                    paymentDate: {$gte: req.params.startDate, $lte: req.params.endDate}
                })
                const paymentType = await PaymentType.find({
                    school: school._id
                })

                let compulsoryPayments = await PaymentType.find({
                    school: school._id, importance: 'Compulsory'
                })
                let compulsory = [] 
                compulsoryPayments.map(e => {
                    compulsory.push(e.paymentFor)
                })
                let totalCompulsory, totalOptional, totalAll
                if(transactions.length > 0){
                    let cPayments = []
                    let oPayments = []
                    transactions.map(t => {
                        let filterCompulsory = t.payment.filter(s => compulsory.includes(s.paymentFor))
                        let filterOptional = t.payment.filter(s => !compulsory.includes(s.paymentFor))
                        let sumC = filterCompulsory.reduce((a, b) => a + Number(b.amountPaid), 0)
                        let sumO = filterOptional.reduce((a, b) => a + Number(b.amountPaid), 0)
                        cPayments.push(sumC)
                        oPayments.push(sumO)
                    })
                    totalCompulsory = cPayments.reduce((a, b) => a + b)
                    totalOptional = oPayments.reduce((a, b) => a + b)
                    totalAll = totalCompulsory + totalOptional
                }

                const students = await Student.find({school: school._id})
                let studentName = {}
                students.map(s => studentName[s._id] = s.lastName + " " + s.firstName)
                let studentReg = {}
                students.map(r => studentReg[r._id] = r.studentID)

                res.render('principal-daily-logs' , { title : 'Transactions' , staff : staff, code : school,
                openfinance_active : 'pcoded-trigger', transactions: transactions,
                finance_active : 'active', transaction_active : 'active', sessS: session.name, termS: term.name,
                paymentType: paymentType, studentName, studentReg, totalCompulsory, totalAll, totalOptional,
                startDate: req.params.startDate, endDate: req.params.endDate})

            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    getPrincipalClassLogs = async (req, res, next) => {
        try{
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode , status : 'Active'})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({school: school._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const className = await ClassSchool.findOne({school: school._id, name: req.params.className})
                const classes = await ClassSchool.find({school: school._id})
                const transactions = await Transaction.find({
                    session: session._id, term: term._id,
                    className: className._id
                })
                const paymentType = await PaymentType.find({
                    school: school._id
                })

                let compulsoryPayments = await PaymentType.find({
                    school: school._id, importance: 'Compulsory'
                })
                let compulsory = [] 
                compulsoryPayments.map(e => {
                    compulsory.push(e.paymentFor)
                })
                let totalCompulsory, totalOptional, totalAll
                if(transactions.length > 0){
                    let cPayments = []
                    let oPayments = []
                    transactions.map(t => {
                        let filterCompulsory = t.payment.filter(s => compulsory.includes(s.paymentFor))
                        let filterOptional = t.payment.filter(s => !compulsory.includes(s.paymentFor))
                        let sumC = filterCompulsory.reduce((a, b) => a + Number(b.amountPaid), 0)
                        let sumO = filterOptional.reduce((a, b) => a + Number(b.amountPaid), 0)
                        cPayments.push(sumC)
                        oPayments.push(sumO)
                    })
                    totalCompulsory = cPayments.reduce((a, b) => a + b)
                    totalOptional = oPayments.reduce((a, b) => a + b)
                    totalAll = totalCompulsory + totalOptional
                }

                const students = await Student.find({school: school._id})
                let studentName = {}
                students.map(s => studentName[s._id] = s.lastName + " " + s.firstName)
                let studentReg = {}
                students.map(r => studentReg[r._id] = r.studentID)

                res.render('principal-class-logs' , { title : 'Transactions' , staff : staff, code : school,
                openfinance_active : 'pcoded-trigger', transactions: transactions, classes: classes,
                finance_active : 'active', transaction_active : 'active', sessS: session.name, termS: term.name,
                paymentType: paymentType, studentName, studentReg, totalCompulsory, totalAll, totalOptional,
                pClass: req.params.className})

            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    getPendingNotes = async (req, res, next) => {
        try{
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode , status : 'Active'})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({school: school._id, current: true})
                const term = await Term.findOne({current: true, session: session._id})
                const lessonNotes = await LessonNotes.find({
                    session : session._id, 
                    term : term._id, 
                    status : "Pending",
                    school: school._id
                })
                const staffs = await Staff.find({school : school._id})

                let staffName = {}
                staffs.map(elem => staffName[elem._id] = elem.firstName + " " + elem.lastName)

                res.render('admin-notes', {title : "Lesson Notes", staff : staff, 
                code : school, notes_active : "active", lessonNotes : lessonNotes, sessS: session.name,
                staffName: staffName, termS: term.name})
        
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    getApprovedNotes = async (req, res, next) => {
        try{
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode , status : 'Active'})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({school: school._id, current: true})
                const term = await Term.findOne({current: true, session: session._id})
                const lessonNotes = await LessonNotes.find({
                    session : session._id, 
                    term : term._id, 
                    status : "Approved",
                    school: school._id
                })
                const staffs = await Staff.find({school : school._id})

                let staffName = {}
                staffs.map(elem => staffName[elem._id] = elem.firstName + " " + elem.lastName)

                res.render('approved-notes', {title : "Lesson Notes", staff : staff, code : school,
                notes_active : "active", lessonNotes : lessonNotes, sessS: session.name,
                staffName: staffName, termS: term.name})
        
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    getSingleNote = async (req, res, next) => {
        try{
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode , status : 'Active'})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({school: school._id, current: true})
                const term = await Term.findOne({current: true, session: session._id})
                const staffs = await Staff.find({school: school._id})
                const singleNote = await LessonNotes.findOne({_id : req.params.noteID})
                
                let staffName = {}
                staffs.map(elem => staffName[elem._id] = elem.firstName + " " + elem.lastName)
                let staffID = {}
                staffs.map(elem => staffID[elem._id] = elem.staffID)

                res.render('admin-single-note', {title : "Lesson Note", staff, code : school,
                notes_active : "active", singleLessonNote : singleNote, sessS: session.name,
                termS: term.name, session, term, staffName, school, staffID})

            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    approveNote = async (req, res, next) => {
        try{
            if(req.session.staffCode){
                
                LessonNotes.findByIdAndUpdate(req.params.noteID, {
                    status : "Approved"
                }, {new : true, useFindAndModify : false}, (err, item) => {
                    if(err){
                        console.log(err)
                    }else{
                        let redirectUrl = "/staff/principal/lesson-notes/" 
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

}

const returnApp = new App()

module.exports = returnApp 