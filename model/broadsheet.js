const mongoose = require('mongoose')
const Schema = mongoose.Schema

const BroadSheetSchema = new Schema ({
    school : {type : Schema.Types.ObjectId, ref : 'SchoolAdmin'},
    session : {type : Schema.Types.ObjectId, ref : 'SchoolSession'},
    term : {type : Schema.Types.ObjectId, ref : 'Term'},
    student : {type : Schema.Types.ObjectId, ref : 'Student'},
    className : String,
    released: {type: Boolean, default: false},
    result : [
        {
            courseName : String,
            total : Number,
            grade : String,
            ca : Number,
            exam: Number
        }
    ]
})

module.exports = mongoose.model("BroadSheet" , BroadSheetSchema)