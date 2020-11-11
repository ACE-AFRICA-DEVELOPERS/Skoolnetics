const mongoose = require('mongoose')
const Schema  = mongoose.Schema

const InvoiceSchema = new Schema ({
    payment : {type : Schema.Types.ObjectId, ref : "Payment"},
    student: { type: Schema.Types.ObjectId, ref: "Student"},
    school : { type : Schema.Types.ObjectId, ref : "SchoolAdmin"},
    invoiceNumber: String
})

module.exports = mongoose.model("Invoice" , InvoiceSchema)