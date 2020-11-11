const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PaymentProofSchema = new Schema ({
    school : {type : Schema.Types.ObjectId, ref : 'SchoolAdmin'},
    student: {type : Schema.Types.ObjectId, ref: 'Student'},
    session: {type : Schema.Types.ObjectId, ref: 'Session'},
    term: {type: Schema.Types.ObjectId, ref: 'Term'},
    className : { type : Schema.Types.ObjectId, ref : 'Classchool'},
    amountPaid: Number,
    description: String,
    proof: String,
    recorded: {type: Boolean, default: false}
})

module.exports = mongoose.model("PaymentProof" , PaymentProofSchema)