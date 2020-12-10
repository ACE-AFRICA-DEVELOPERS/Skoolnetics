
const mongoose = require('mongoose') 
const Schema   = mongoose.Schema 


const AdminSchema = new Schema({
	email: String,
	password : String,
	username: String,
	superAdmin: {type: Boolean, default: false}
})

module.exports = mongoose.model('Admin' , AdminSchema)
 