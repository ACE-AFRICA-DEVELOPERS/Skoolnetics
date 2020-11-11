const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TransactionSchema = new Schema ({
    school : {type : Schema.Types.ObjectId, ref : 'SchoolAdmin'},
    student: {type : Schema.Types.ObjectId, ref: 'Student'},
    session: {type : Schema.Types.ObjectId, ref: 'Session'},
    term: {type: Schema.Types.ObjectId, ref: 'Term'},
    className : { type : Schema.Types.ObjectId, ref : 'Classchool'},
    paymentFor: String,
    amountPaid: Number,
    paymentDate: {type : Date, default: Date.now()},
    status: {type : String, enum: ['Completed', 'Pending'], default: 'Pending'}
})

module.exports = mongoose.model("Transaction" , TransactionSchema)