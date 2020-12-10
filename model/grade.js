  
const mongoose = require('mongoose') 
const Schema   = mongoose.Schema 

const GradeSchema = new Schema({
    school: {type: Schema.Types.ObjectId, ref: 'School'},
    session : {type : Schema.Types.ObjectId, ref : 'SchoolSession'},
    term : {type : Schema.Types.ObjectId, ref : 'Term'},
    rangeLowest: Number,
    rangeHighest: Number,
    grade: String
})

module.exports = mongoose.model('Grade' , GradeSchema)
 