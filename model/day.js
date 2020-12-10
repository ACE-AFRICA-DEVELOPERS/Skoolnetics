const mongoose = require('mongoose')
const Schema = mongoose.Schema

const DaySchema = new Schema ({
    weekday : String ,
    school : {type : Schema.Types.ObjectId, ref : 'SchoolAdmin'},
})

module.exports = mongoose.model("Day" , DaySchema)