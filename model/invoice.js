const mongoose = require('mongoose')
const Schema = mongoose.Schema

const InvoiceSchema = new Schema ({
    school : {type : Schema.Types.ObjectId, ref : 'SchoolAdmin'},
    student: {type : Schema.Types.ObjectId, ref: 'Student'},
    session: {type: Schema.Types.ObjectId, ref: 'Session'},
    payment: {type : Schema.Types.ObjectId, ref: 'Payment'},
    invoiceNumber: String
})

module.exports = mongoose.model("Invoice" , InvoiceSchema) 
