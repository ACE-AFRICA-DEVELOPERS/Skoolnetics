const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ExamPassSchema = new Schema ({
    school : {type : Schema.Types.ObjectId, ref : 'SchoolAdmin'},
    exam : {type : Schema.Types.ObjectId , ref : 'Exam'},
    course: {type: Schema.Types.ObjectId, ref: 'Course'},
    student : {type : Schema.Types.ObjectId, ref : 'Student'},
    courseName : String,
    className : String,
    password: String,
    status: {type: Boolean, default: false},
    expired: {type: Boolean, default: false}
})

module.exports = mongoose.model("ExamPass" , ExamPassSchema)