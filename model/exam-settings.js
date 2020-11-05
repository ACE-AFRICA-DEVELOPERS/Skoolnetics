  
const mongoose = require('mongoose') 
const Schema   = mongoose.Schema 

const ComputeSchema = new Schema({
    school: {type: Schema.Types.ObjectId, ref: 'School'},
    session : {type : Schema.Types.ObjectId, ref : 'SchoolSession'},
    term : {type : Schema.Types.ObjectId, ref : 'Term'},
    name: String,
    total: Number
})

module.exports = mongoose.model('Compute' , ComputeSchema)
 