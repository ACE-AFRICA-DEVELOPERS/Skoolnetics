const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ResultSchema = new Schema ({
    school : {type : Schema.Types.ObjectId, ref : 'SchoolAdmin'},
    student : {type : Schema.Types.ObjectId, ref : 'Student'},
    exam : {type: Schema.Types.ObjectId, ref : 'Exam'},
    className : String,
    released : {type : Boolean, default : false},
    result : [{
        courseName : String,
        score : Number,
        total: Number,
        percentage: Number,
        option : []
    }],
    session : {
        type : Schema.Types.ObjectId,
        ref : "SchoolSession"
    },
    term : {
        type : Schema.Types.ObjectId,
        ref : "Term"
    },
})

module.exports = mongoose.model("Result" , ResultSchema)