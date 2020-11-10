const mongoose = require('mongoose')
const Schema  = mongoose.Schema

const paymentSchema = new Schema ({
    class : {
        type : Schema.Types.ObjectId,
        ref : "Classchool"
    },
    fees : [{
        paymentFor : String,
        amount : Number
        
    }] ,
    school : {
        type : Schema.Types.ObjectId,
        ref : "SchoolAdmin"
    },
    session : {
        type : Schema.Types.ObjectId,
        ref : "SchoolSession"
    },
    term : {
        type : Schema.Types.ObjectId,
        ref : "Term"
    },
})

module.exports = mongoose.model("Payment" , paymentSchema)