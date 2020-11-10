const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ExamTimetableSchema = new Schema ({
    school : {type : Schema.Types.ObjectId, ref : 'SchoolAdmin'},
    session : {type : Schema.Types.ObjectId, ref : 'Session'},
    term : {type : Schema.Types.ObjectId, ref : 'Term'},
    class : {type : Schema.Types.ObjectId, ref : 'Classchool'},
    examDay : {type : Schema.Types.ObjectId, ref : 'ExamDay'},
    nameOfDay: Date,
    subject: [
        {
            subjectName: String,
            startTime : String ,
            endTime : String ,
            periodNum: String
        }
    ]
})

module.exports = mongoose.model("ExamTimetable" , ExamTimetableSchema)