const mongoose = require('mongoose')
const Schema = mongoose.Schema

const AssignmentSchema = new Schema({
    school : {type : Schema.Types.ObjectId, ref : 'schoolAdmin'},
    staff : {type : Schema.Types.ObjectId, ref : 'staff'},
    session : {type : Schema.Types.ObjectId, ref : 'SchoolSession'},
    term : {type : Schema.Types.ObjectId, ref : 'Term'},
    subject : { type : String},
    className : { type : String},
    releaseDate : {type : Date},
    submissionDate : {type : Date},
    content :{
        contentDetail: String
    },
    image : {type : String}
})

module.exports = mongoose.model("Assignment" , AssignmentSchema)