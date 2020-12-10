const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PayOnlineSchema = new Schema ({
    school : {type : Schema.Types.ObjectId, ref : 'SchoolAdmin'},
    session: {type : Schema.Types.ObjectId, ref: 'SchoolSession'},
    term: {type: Schema.Types.ObjectId, ref: 'Term'},
    student: {type : Schema.Types.ObjectId, ref: 'Student'},
    referenceNumber: String,
    verified: {type: Boolean, default: false},
    receiptNo: String,
    payment: [
        {
            paymentFor: String,
            amountPaid: Number
        }
    ],
    paymentDate: {type : Date, default: Date.now()},
    total: Number
})

module.exports = mongoose.model("PayOnline" , PayOnlineSchema) 
