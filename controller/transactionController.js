const SchoolAdmin = require('../model/schoolAdmin')
const Staff = require("../model/staff")
const Student = require('../model/student')
const Session = require('../model/session')
const Term = require('../model/term')
const Payment = require('../model/payment')
const PaymentType = require('../model/paymentType')
const ClassSchool = require('../model/classchool')


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
                res.redirect(303, '/school/fees')
            }
        } catch (err) {
            res.json(err)
        }
    }

    postPaymentType = async (req , res , next) => {
        try {
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const { paymentFor } = req.body
                const paymentType = new PaymentType ({
                    paymentFor : paymentFor ,
                    school : schoolAdmin._id
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
                res.redirect(303, '/school/fees')
            }
        } catch (err) {
            res.json( err )
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
                res.redirect(303, '/school/fees')
            }
        } catch (err) {
            res.json(err)
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
                
                let paymentName = {}
                paymentTypes.map(pay => paymentName[pay._id] = pay.paymentFor)

                res.render('single-class' , { title : "Single Class Payment Details" , schoolAdmin : schoolAdmin , 
                termS : term.name , sessS : session.name , paymentTypes : paymentTypes , singleClass : singleClass , 
                payments : payments , classDB : singleClass , paymentName : paymentName})
            }else {
                res.redirect(303, '/school')
            }
        } catch (err) {
            res.json(err)
        }
    }

    postSingleClass = async ( req , res , next ) => {
        try {
            if( req.session.schoolCode ){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const paymentt = await Payment.findOne({ class: req.params.classID , school: schoolAdmin._id })
                const { paymentFor , amount } = req.body
                if(!paymentt) {
                    
                    const payment = new Payment ({
                        school : schoolAdmin._id ,
                        class : req.params.classID ,
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
                res.redirect(303, '/school/fees')
            }
        } catch (err) {
            res.render('error', {error : err})
        }
    }

    getInvoicePage = async ( req , res , next ) => {
        try {
            if( req.session.schoolCode ){
                const schoolAdmin = await SchoolAdmin.findOne({ schoolCode : req.session.schoolCode })
                const classes = await ClassSchool.find({school : schoolAdmin._id})
                

                res.render('payment-invoice' , { title : 'All Payment Classes' , schoolAdmin : schoolAdmin, 
                classes : classes , openfinance_active : 'pcoded-trigger',
                finance_active : 'active', invoice_active : 'active',})
            }else{
                res.redirect(303, '/school/fees')
            }
        } catch (err) {
            res.json(err)
        }
    }

    getSingleClassInvoice = async ( req , res , next ) => {
        try {
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({ schoolCode : req.session.schoolCode })
                const classes = await ClassSchool.find({school : schoolAdmin._id})
                const session = await Session.find({ school : schoolAdmin._id , current : true})
                const term = await Term.find({ school : schoolAdmin._id  })
                const payments = await Payment.findOne({ class : req.params.classID , school : schoolAdmin._id })
                
                let paymentFees = payments.fees

                let sum = paymentFees.reduce((a, b) => a + Number(b.amount), 0)

                const paymentTypes = await PaymentType.find({ school : schoolAdmin._id })
                const singleClass = await ClassSchool.findOne({ _id : req.params.classID , school: schoolAdmin._id})

                let title = `Generate Invoice for ${singleClass.name}`

                let sessionName = {}
                session.map(sess => sessionName[sess._id] = sess.name)

                let termName = {}
                term.map(ter => termName[ter._id] = ter.name)

                let className = {}
                classes.map(clas => className[clas._id] = clas.name)

                let paymentName = {}
                paymentTypes.map(pay => paymentName[pay._id] = pay.paymentFor)

                res.render('single-class-bill' , { title : title , schoolAdmin : schoolAdmin , 
                session : session , term : term , payments : payments , paymentTypes : paymentTypes,
                sessionName : sessionName , termName : termName , className : className , paymentName : paymentName,
                classes : classes , singleClass : singleClass, sum: sum , openfinance_active : 'pcoded-trigger',
                finance_active : 'active', invoice_active : 'active',})
            }else{
                res.rendirect('/school/fees/payment-invoice')
            }
        } catch (err) {
            res.render('error', {error : err})
        }
    }
}



const returnApp = new App()

module.exports = returnApp 