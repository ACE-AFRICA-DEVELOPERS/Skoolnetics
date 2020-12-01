  
const mongoose = require('mongoose') 
const Schema   = mongoose.Schema 

const StudentResultSchema = new Schema({
    school: {type: Schema.Types.ObjectId, ref: 'School'},
    student: {type: Schema.Types.ObjectId, ref: 'Student'},
    session: {type: Schema.Types.ObjectId, ref: 'SchoolSession'},
    term: {type: Schema.Types.ObjectId, ref: 'Term'},
    classSchool: {type: Schema.Types.ObjectId, ref: 'Classchool'},  
	results: []
})

module.exports = mongoose.model('StudentResult' , StudentResultSchema)
 