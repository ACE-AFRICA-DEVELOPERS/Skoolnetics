  
const mongoose = require('mongoose') 
const Schema   = mongoose.Schema 

const RoleSchema = new Schema({
    name: String,
    role: String,
    school : {type : Schema.Types.ObjectId, ref : 'SchoolAdmin'}
})

module.exports = mongoose.model('Role' , RoleSchema)
 