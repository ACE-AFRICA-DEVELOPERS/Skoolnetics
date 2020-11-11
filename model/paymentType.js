const mongoose = require('mongoose')
const Schema  = mongoose.Schema

const PaymentTypeSchema = new Schema ({
    paymentFor : String,
    school : {type : Schema.Types.ObjectId, ref : 'SchoolAdmin'}, 
    importance: {type: String, enum: ['Compulsory', 'Optional']}
})

module.exports = mongoose.model("PaymentType" , PaymentTypeSchema)