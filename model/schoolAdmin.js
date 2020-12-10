  
const mongoose = require('mongoose') 
const Schema   = mongoose.Schema 

const SchoolAdminSchema = new Schema({
    schoolCode : String,
    schoolName : String,
    schoolEmail : String,
    schoolAdmin : String,   
    password : String,
    schoolNumber : String,
    address : String,
    state : String,
    country : String,
    logo : String,
    stamp: String,
    verified : {type : Boolean , default : false},
    token : String,
    approved : {type : Boolean , default : false} ,
    demo : {type: Boolean, default: false},
    demoCode: String,
    expiryDate : Date ,
    creationDate: {type: Date, default: Date.now()},
    approvedBy: String
})

module.exports = mongoose.model('SchoolAdmin' , SchoolAdminSchema)
 