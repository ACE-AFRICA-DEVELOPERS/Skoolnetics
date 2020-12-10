const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ClassTimetableSchema = new Schema ({
    school : {type : Schema.Types.ObjectId, ref : 'SchoolAdmin'},
    session : {type : Schema.Types.ObjectId, ref : 'Session'},
    term : {type : Schema.Types.ObjectId, ref : 'Term'},
    class : {type : Schema.Types.ObjectId, ref : 'Classchool'},
    day : {type : Schema.Types.ObjectId, ref : 'Day'},

    nameOfDay: String,
    subject: [
        {
            subjectName: String,
            periodNum: String
        }
    ]
})

module.exports = mongoose.model("ClassTimetable" , ClassTimetableSchema)