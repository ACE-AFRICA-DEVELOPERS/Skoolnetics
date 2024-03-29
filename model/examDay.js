const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ExamDaySchema = new Schema ({
    nameOfDay : Date ,
    school : {type : Schema.Types.ObjectId, ref : 'SchoolAdmin'},
    session : {type : Schema.Types.ObjectId, ref : 'SchoolSession'},
    term: {type : Schema.Types.ObjectId, ref : 'Term'},
})

module.exports = mongoose.model("ExamDay" , ExamDaySchema)