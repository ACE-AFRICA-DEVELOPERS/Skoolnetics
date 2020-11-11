
const GenerateInvoice = require('./invoiceGenerator')
const SchoolAdmin = require('../model/schoolAdmin')
const Staff = require("../model/staff")
const Student = require('../model/student')
const Session = require('../model/session')
const Term = require('../model/term')
const Payment = require('../model/payment')
const PaymentType = require('../model/paymentType')
const ClassSchool = require('../model/classchool')
const Invoice = require('../model/invoice')
const PaymentProof = require('../model/paymentProof')
const Transaction = require('../model/transaction')

class App {

    createPaymentType = async (req , res , next) => {
        try {
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const paymentTypes = await PaymentType.find({school : schoolAdmin._id})
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                if(session){
                    const term = await Term.findOne({session: session._id, current: true})
                    if(term){

                        res.render('payment-type' , {title : "Payment Type" , schoolAdmin : schoolAdmin , 
                        openfinance_active : 'pcoded-trigger', sessS: session.name, termS: term.name,
                        finance_active : 'active', payment_active : 'active', paymentTypes : paymentTypes})
                    }else{
                        res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'Payment Type',
                        finance_active: 'active', openfinance_active: "pcoded-trigger",
                        payment_active : "active"})
                    }
                }else{
                    res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'Payment Type',
                    finance_active: 'active', openfinance_active: "pcoded-trigger",
                    payment_active : "active"})
                }
            }else {
                res.redirect(303, '/school')
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
                    importance: status
                })  
                const saveType = await paymentType.save()
                console.log(saveType)      
                if (saveType) {
                    res.redirect(303 , '/school/fees/payment-type')
                    return
                }else {
                    throw {
                        message : "Unable to save the Payment Typee."
                    }
                    return 
                }  
            }else{
                res.redirect(303, '/school')
            }
        }catch (err) {
            res.render("error-page", {error: err})
        }
    }

    getAllClass = async ( req , res , next ) => {
        try {
            if( req.session.schoolCode ){
                const schoolAdmin = await SchoolAdmin.findOne({ schoolCode : req.session.schoolCode })
                const classes = await ClassSchool.find({school : schoolAdmin._id})
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                if(session){
                    const term = await Term.findOne({session: session._id, current: true})
                    if(term){
                        res.render('all-classes' , { title : 'Classes' , schoolAdmin : schoolAdmin, 
                        classes : classes , openfinance_active : 'pcoded-trigger',
                        finance_active : 'active', amount_active : 'active', sessS: session.name, termS: term.name})
                    }else{
                        res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'Classes',
                        finance_active: 'active', openfinance_active: "pcoded-trigger",
                        amount_active : "active"})
                    }
                }else{
                    res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'Classes',
                        finance_active: 'active', openfinance_active: "pcoded-trigger",
                        amount_active : "active"})
                }
            }else{
                res.redirect(303, '/school')
            }
        }catch (err) {
            res.render("error-page", {error: err})
        }
    }

    getSingleClass = async ( req , res , next ) => {
        try {
            if( req.session.schoolCode ){
                const schoolAdmin = await SchoolAdmin.findOne({ schoolCode : req.session.schoolCode })
                const session = await Session.findOne({ school : schoolAdmin._id , current : true})
                const term = await Term.findOne({ session : session._id   , current : true})
                const paymentTypes = await PaymentType.find({school: schoolAdmin._id})
                const singleClass = await ClassSchool.findOne({ _id : req.params.classID , school: schoolAdmin._id})
                const payments = await Payment.findOne({ class: req.params.classID , school: schoolAdmin._id, })
                
                const invoices = await Invoice.find({
                    payment: payments._id
                })

                let paymentName = {}
                paymentTypes.map(pay => paymentName[pay._id] = pay.paymentFor)

                res.render('single-class' , { title : "Single Class Payment Details" , schoolAdmin : schoolAdmin , 
                termS : term.name , sessS : session.name , paymentTypes : paymentTypes , singleClass : singleClass , 
                payments : payments , classDB : singleClass , paymentName : paymentName,
                finance_active: 'active', openfinance_active: "pcoded-trigger",
                amount_active : "active", invoices: invoices})
            }else {
                res.redirect(303, '/school')
            }
        }catch (err) {
            res.render("error-page", {error: err})
        }
    }

    postSingleClass = async ( req , res , next ) => {
        try {
            if( req.session.schoolCode ){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const paymentt = await Payment.findOne({ class: req.params.classID , school: schoolAdmin._id })
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const { paymentFor , amount } = req.body
                if(!paymentt) {
                    
                    const payment = new Payment ({
                        school : schoolAdmin._id ,
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
                        
                        res.redirect(303 ,  "/school/fees/all-classes/" + req.params.classID)
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
                            res.redirect(303 ,  "/school/fees/all-classes/" + req.params.classID)
                            return
                        }
                    })	
              
                }
            }else {
                res.redirect(303, '/school')
            }
            
        } catch (err) {
            res.render('error-page', {error : err})
        }
    }

    deleteSinglePayment = async ( req , res , next) => {
        try {
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const paymentt = await Payment.findOne({ class: req.params.classID , school: schoolAdmin._id })
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
                        let redirectUrl = '/school/fees/all-classes/' + req.params.classID 
                        res.redirect(303, redirectUrl)
                    }
                })
            }else{
                res.redirect(303, '/school')
            }
        } catch (err) {
            res.render("error-page", {error: err})
        }
    }

    getClassBill = async ( req , res , next ) => {
        try {
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({ schoolCode : req.session.schoolCode })
                const classes = await ClassSchool.find({school : schoolAdmin._id})
                const session = await Session.findOne({ school : schoolAdmin._id , current : true})
                const term = await Term.findOne({session: session._id, current: true})
                const payments = await Payment.findOne({ class : req.params.classID , school : schoolAdmin._id })
                
                let paymentFees = payments.fees

                let sum = paymentFees.reduce((a, b) => a + Number(b.amount), 0)

                const paymentTypes = await PaymentType.find({ school : schoolAdmin._id })
                const singleClass = await ClassSchool.findOne({ _id : req.params.classID , school: schoolAdmin._id})

                let title = `Bill for ${singleClass.name}`

                let paymentName = {}
                paymentTypes.map(pay => paymentName[pay._id] = pay.paymentFor)

                const invoices = await Invoice.find({
                    payment: payments._id
                })

                res.render('single-class-bill' , { title : title , schoolAdmin : schoolAdmin , 
                sessS: session.name , termS : term.name , payments : payments , paymentTypes : paymentTypes,
                paymentName : paymentName, openfinance_active : 'pcoded-trigger',
                classes : classes , singleClass : singleClass, sum: sum , 
                finance_active : 'active', amount_active : 'active', invoices: invoices})
            }else{
                res.redirect('/school')
            }
        }catch (err) {
            res.render("error-page", {error: err})
        }
    }

    generateInvoice = async ( req , res , next ) => {
        try {
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({ schoolCode : req.session.schoolCode })
                const session = await Session.findOne({ school : schoolAdmin._id , current : true})
                const term = await Term.findOne({session: session._id, current: true})
                const payments = await Payment.findOne({ 
                    class : req.params.classID , school : schoolAdmin._id,
                    session: session._id, term: term._id 
                })
                const invoices = await Invoice.find({payment: payments._id})
                const singleClass = await ClassSchool.findOne({ _id : req.params.classID , school: schoolAdmin._id})
                const students = await Student.find({school: schoolAdmin._id, className: req.params.classID})
                let title = `Generating Invoice for ${singleClass.name}`

                let studentName = {}
                students.map(s => studentName[s._id] = s.lastName + ' ' + s.firstName + ' ' + s.otherName)
                let studentReg = {}
                students.map(reg => studentReg[reg._id] = reg.studentID)

                res.render('generate-invoice' , { title : title , schoolAdmin : schoolAdmin , 
                sessS: session.name , termS : term.name , payments : payments , studentDB: students,
                openfinance_active : 'pcoded-trigger', singleClass : singleClass, 
                finance_active : 'active', amount_active : 'active', invoices: invoices,
                studentName: studentName, studentReg: studentReg})
            }else{
                res.redirect('/school')
            }
        }catch (err) {
            res.render("error-page", {error: err})
        }
    }

    createInvoice = async ( req , res , next ) => {
        try {
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({ schoolCode : req.session.schoolCode })
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                let getname = schoolAdmin.schoolName
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
                        const totalInvoice = await Invoice.find({payment: payment})
                        let start = "0001"
                        let code = GenerateInvoice(totalInvoice, start, "invoiceNumber", 1, 4)
                        const newInvoice = await new Invoice({
                            student : student.id,
                            payment: payment,
                            school: schoolAdmin._id,
                            invoiceNumber: sess + initialName + code
                        })
    
                        await newInvoice.save()  
                        count -= 1 
                    }
                }
                res.json({message : "Invoice has been generated."})
            }else{
                res.redirect('/school')
            }
        }catch (err) {
            res.render("error-page", {error: err})
        }
    }

    getTransactionUpload = async ( req , res , next ) => {
        try {
            if( req.session.schoolCode ){
                const schoolAdmin = await SchoolAdmin.findOne({ schoolCode : req.session.schoolCode })
                const classes = await ClassSchool.find({school : schoolAdmin._id})
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                if(session){
                    const term = await Term.findOne({session: session._id, current: true})
                    if(term){
                        res.render('transaction-uploads' , { title : 'Upload Transactions' , schoolAdmin : schoolAdmin, 
                        classes : classes , openfinance_active : 'pcoded-trigger',
                        finance_active : 'active', uploadT_active : 'active', sessS: session.name, termS: term.name})
                    }else{
                        res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'Upload Transactions',
                        finance_active: 'active', openfinance_active: "pcoded-trigger",
                        uploadT_active : "active"})
                    }
                }else{
                    res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'Upload Transactions',
                    finance_active: 'active', openfinance_active: "pcoded-trigger",
                    uploadT_active : "active"})
                }
            }else{
                res.redirect(303, '/school')
            }
        }catch (err) {
            res.render("error-page", {error: err})
        }
    }

    getPaymentProof = async ( req , res , next ) => {
        try {
            if( req.session.schoolCode ){
                const schoolAdmin = await SchoolAdmin.findOne({ schoolCode : req.session.schoolCode })
                const classes = await ClassSchool.find({school : schoolAdmin._id})
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const paymentProof = await PaymentProof.find({
                    session: session._id, term: term._id, 
                    school: schoolAdmin._id, recorded: false
                })
                const students = await Student.find({school: schoolAdmin._id})

                let studentName = {}
                students.map(name => studentName[name._id] = name.firstName + " " + name.lastName + " " + `(${name.studentID})`)
                let className = {}
                classes.map(cls => className[cls._id] = cls.name)

                res.render('transaction-proof' , { title : 'Upload Transactions' , schoolAdmin : schoolAdmin, 
                classes : classes , openfinance_active : 'pcoded-trigger', paymentProof: paymentProof,
                finance_active : 'active', uploadT_active : 'active', sessS: session.name, termS: term.name,
                className: className, studentName: studentName})
                
            }else{
                res.redirect(303, '/school')
            }
        }catch (err) {
            res.render("error-page", {error: err})
        }
    }

    makeRecorded = async ( req , res , next ) => {
        try {
            if( req.session.schoolCode ){
                PaymentProof.findByIdAndUpdate(req.params.proofID , {
                    recorded: true
                } ,{new : true, useAndModify : false}, (err , item) => {
                    if(err){
                        res.status(500)
                        return
                    }else{
                        req.flash('success', "Transaction has been recorded.")
                        res.redirect(303, '/school/fees/transactions/upload/proofs')

                    }
                })
            }else{
                res.redirect(303, '/school')
            }
        }catch (err) {
            res.render("error-page", {error: err})
        }
    }

    getTransactionLogs = async ( req , res , next ) => {
        try {
            if( req.session.schoolCode ){
                const schoolAdmin = await SchoolAdmin.findOne({ schoolCode : req.session.schoolCode })
                const classes = await ClassSchool.find({school : schoolAdmin._id})
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                if(session){
                    const term = await Term.findOne({session: session._id, current: true})
                    if(term){
                        res.render('transaction-logs' , { title : 'Upload Transactions' , schoolAdmin : schoolAdmin, 
                        classes : classes , openfinance_active : 'pcoded-trigger',
                        finance_active : 'active', transaction_active : 'active', sessS: session.name, termS: term.name})
                    }else{
                        res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'Upload Transactions',
                        finance_active: 'active', openfinance_active: "pcoded-trigger",
                        transaction_active : "active"})
                    }
                }else{
                    res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'Upload Transactions',
                    finance_active: 'active', openfinance_active: "pcoded-trigger",
                    transaction_active : "active"})
                }
            }else{
                res.redirect(303, '/school')
            }
        }catch (err) {
            res.render("error-page", {error: err})
        }
    }
}



const returnApp = new App()

module.exports = returnApp 