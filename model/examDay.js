const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ExamDaySchema = new Schema ({
    nameOfDay : Date ,
    school : {type : Schema.Types.ObjectId, ref : 'SchoolAdmin'},
})

module.exports = mongoose.model("ExamDay" , ExamDaySchema)