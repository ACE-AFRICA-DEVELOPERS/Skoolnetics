const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PeriodSchema = new Schema ({
    school : {type : Schema.Types.ObjectId, ref : 'SchoolAdmin'},
    weekday : [{
        periodNum : Number ,
        startTime : String ,
        endTime : String ,
    }] 
})

module.exports = mongoose.model('Period' , PeriodSchema)