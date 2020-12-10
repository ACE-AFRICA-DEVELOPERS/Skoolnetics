const mongoose = require('mongoose') 
const Schema   = mongoose.Schema 

const StaffSchema = new Schema ({
    school : {type : Schema.Types.ObjectId, ref : 'SchoolAdmin'},
    staffID : {type : String},
    firstName : {type : String},
    lastName : {type : String}, 
    otherName : {type : String},
    email : {type : String},    
    mobile : {type : Number},
    password : {type : String},
    gender : {type : String},
    qualifications : {type : String},
    role : {type : String},
    classHead : {type : Schema.Types.ObjectId, ref : 'Classchool'},
    teaching : [
        {
            className: String,
            subject: String
        }
    ],
    profilePhoto : {type : String} ,
    status : {type : String , enum : ['Resigned' , 'Sacked' , 'Active' ,'Retired'] , default : 'Active'} ,
    terminationDate : {type : String} ,
    DateCreated : {type : Date , default : Date.now()}
})

module.exports = mongoose.model("Staff" , StaffSchema)