const SchoolAdmin = require('../model/schoolAdmin')
const Period = require('../model/period')
const ClassTimetable = require('../model/classTimetable')
const ClassSchool = require('../model/classchool')
const Session = require('../model/session')
const Subject = require('../model/subject')
const Term = require('../model/term')
const Day = require('../model/day')
const ExamTimetable = require('../model/examTimetable')
const ExamDay = require('../model/examDay')
const Staff = require('../model/staff')
const Student = require('../model/student')


class App {
    getPeriodPage = async (req , res , next) => {
        if(req.session.schoolCode) {
            try{
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({school : schoolAdmin._id, current: true})
                if(session) {
                    const term = await Term.findOne({school: schoolAdmin._id, session: session._id, current: true})
                    if(term) {
                        const periods = await Period.find({school : schoolAdmin._id}).sort([['startTime' , 'ascending']]) 
                        res.render("period-page" , {
                            periods : periods ,
                            title : "Timetable Periods" ,
                            schoolAdmin : schoolAdmin ,
                            sessS: session.name,
                            termS: term.name ,
                            success : req.flash('success'),
                            period_active: 'active',
                            timetable_active : "active" ,
                            opentimetable_active: "pcoded-trigger",
                        })
                    }else{
                        res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'Exam Settings',
                        period_active: 'active', opentimetable_active: "pcoded-trigger",
                        timetable_active : "active"})
                    }
                }else{
                    res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'Exam Settings',
                    period_active: 'active', opentimetable_active: "pcoded-trigger",
                    timetable_active : "active"})
                }
            }catch(err){
                res.send(err.message)
            }
            
        }else{
            res.redirect(303 , '/school')
        }
    }

    postPeriodPage = async (req , res , next) => {
        if(req.session.schoolCode) {
            try{
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const {day , periodNum , startTime , endTime , weekday } = req.body
                const periodd = await Period.findOne({ school : schoolAdmin._id })
                if(!periodd) {
                    const period = new Period({
                        weekday : [{
                            day : day ,
                            periodNum : periodNum ,
                            startTime : startTime ,
                            endTime : endTime ,
                        }],
                        school : schoolAdmin._id
                    })
                    const savePeriod = await period.save()
                    if (savePeriod) {
                        req.flash('success', 'Period successfully created!')
                        res.redirect(303 , '/school/period')
                        return
                    }else {
                        throw {
                            message : 'Unable to save Period'
                        }
                    }
                }
                if(periodd){
                    Period.findByIdAndUpdate(periodd._id, {
                        $addToSet : {
                            weekday : [{
                                day : day ,
                                periodNum : periodNum ,
                                startTime : startTime ,
                                endTime : endTime ,
                            }],
                        }
                    }, {new : true, useAndModify : false}, (err , item) => {
                        if(err){
                            res.status(500)
                            return
                        }else {
                            req.flash('success', 'Period successfully created!')
                            res.redirect(303, '/school/period/')
                        }
                    })	
                }
            }catch(err) {
                res.send(err.message)
            }
        }else {
            res.redirect(303 , '/school')
        }
    }

    removePeriod = async (req, res, next) => {
        try{
            if(req.session.schoolCode){ 
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const periods = await Period.findOne({school : schoolAdmin._id}) 
                const allPeriods = periods.weekday
                let mapIt = allPeriods.find( elem => elem._id == req.params.day)
                Period.findByIdAndUpdate(periods._id, {
                    $pullAll : {
                        weekday : [mapIt] }
                }, {new : true, useAndModify : false}, (err , item) => {
                    if(err){
                        res.status(500) 
                        return
                    }else {
                        req.flash('success', "Your deletion was successful.") 
                        res.redirect(303, '/school/period')
                    }
                })
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    getDayPage = async (req , res , next) => {
        if(req.session.schoolCode) {
            try{
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({school : schoolAdmin._id, current: true})
                if(session) {
                    const term = await Term.findOne({school: schoolAdmin._id, session: session._id, current: true})
                    if(term) {
                        const days = await Day.find({school : schoolAdmin._id})
                        res.render("day-page" , {
                            days : days ,
                            title : "Set Weekdays" ,
                            schoolAdmin : schoolAdmin ,
                            sessS: session.name,
                            termS: term.name ,
                            success : req.flash('success'),
                            period_active: 'active',
                            timetable_active : "active" ,
                            opentimetable_active: "pcoded-trigger",
                        })    
                    }else{
                        res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'Exam Settings',
                        period_active: 'active', opentimetable_active: "pcoded-trigger",
                        timetable_active : "active"})
                    }
                }else{
                    res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'Exam Settings',
                    period_active: 'active', opentimetable_active: "pcoded-trigger",
                    timetable_active : "active"})
                }
            }catch(err){
                res.send(err.message)
            }
        }else{
            res.redirect(303 , '/school')
        }
    }

    postDayPage = async (req , res , next) => {
        if(req.session.schoolCode) {
            try{
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const {weekday } = req.body
                const day = new Day({
                    school : schoolAdmin._id ,
                    weekday : weekday
                })
                const saveDay = await day.save()
                if (saveDay) {
                    req.flash('success' , 'Weekday created successfully!')
                    res.redirect(303 , '/school/day')
                    return
                }else {
                    throw {
                        message : 'Unable to save Period'
                    }
                }
            }catch(err) {
                res.send(err.message)
            }
        }else {
            res.redirect(303 , '/school')
        }
    }
    
    deleteDay = async (req , res , next ) => {
        if(req.session.schoolCode) {
            const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
            try {
                let day = await Day.findById(req.params.dayID) 
                if ( day ) {
                    let delDay =  await Day.findByIdAndRemove(day._id) 
                    if ( delDay ) {
                        req.flash('success' , 'Weekday has been cancelled successfully.')
                        res.redirect(303 , '/school/day')
                    }else {
                        throw {
                            status : 500 ,
                            message : "Internal Server Error"
                        }
                    }
                }else {
                    throw {
                        status : 400 ,
                        message : "Something went wrong with the request "
                    }
                }
            }catch(error){
                res.sendStatus(error.status).json({message : error.message})
                return 
            }
        }
        else{
            res.redirect(303, '/school')
        }
    }

    getTimetablePage = async (req, res, next) => {
        if(req.session.schoolCode){
            try {
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({school : schoolAdmin._id, current: true})
                if(session) {
                    const term = await Term.findOne({school: schoolAdmin._id, session: session._id, current: true})
                    if(term) { 
                        const classchool = await ClassSchool.find({school : schoolAdmin._id})
                        res.render('timetable-page', {
                            title : 'Timetable', schoolAdmin : schoolAdmin,
                            classchool : classchool,
                             attendance_active: "active" ,
                             sessS: session.name,
                             termS: term.name ,
                             success : req.flash('success'),
                             time_active: 'active',
                             timetable_active : "active" ,
                             opentimetable_active: "pcoded-trigger",
                        })
                    }else{
                        res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'Exam Settings',
                        time_active: 'active', opentimetable_active: "pcoded-trigger",
                        timetable_active : "active"})
                    }
                }else{
                    res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'Exam Settings',
                    time_active: 'active', opentimetable_active: "pcoded-trigger",
                    timetable_active : "active"})
                }
            }catch(error){
                res.sendStatus(error.status).json({message : error.message})
                return 
            }
        }else{
            res.render(303, '/school')
        }
    }

    getClassTimetablePage = async (req , res , next) => {
        if(req.session.schoolCode) {
            try{
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({school : schoolAdmin._id, current: true})
                if(session) {
                    const term = await Term.findOne({school: schoolAdmin._id, session: session._id, current: true})
                    if(term) {  
                        const periods = await Period.find({school : schoolAdmin._id})
                        const subjects = await Subject.findOne({school : schoolAdmin._id})
                        const timetables = await ClassTimetable.findOne({school : schoolAdmin._id, class : req.params.classID})
                        const day = await Day.find({school : schoolAdmin._id})
                        const classSchools = await ClassSchool.findOne({school : schoolAdmin._id , _id : req.params.classID})
                        res.render("classtimetable-page" , {
                            timetables : timetables ,
                            subjects : subjects ,
                            periods : periods ,
                            day : day ,
                            title : "Timetable Periods" ,
                            schoolAdmin : schoolAdmin,
                            classSchools : classSchools ,
                            sessS: session.name,
                             termS: term.name ,
                             success : req.flash('success'),
                             time_active: 'active',
                             timetable_active : "active" ,
                             opentimetable_active: "pcoded-trigger",
                        })
                    }else{
                        res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'Exam Settings',
                        time_active: 'active', opentimetable_active: "pcoded-trigger",
                        timetable_active : "active"})
                    }
                }else{
                    res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'Exam Settings',
                    time_active: 'active', opentimetable_active: "pcoded-trigger",
                    timetable_active : "active"})
                }		
            }catch(err){
                res.send(err.message)
            }
            
        }else{
            res.redirect(303 , '/school')
        }
    }

    getDaySubjectPage = async (req , res , next) => {
        if(req.session.schoolCode) {
            try{
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({school : schoolAdmin._id, current: true})
                if(session) {
                    const term = await Term.findOne({school: schoolAdmin._id, session: session._id, current: true})
                    if(term) {  
                        const periods = await Period.findOne({school : schoolAdmin._id})
                        const subjects = await Subject.findOne({school : schoolAdmin._id})
                        const timetables = await ClassTimetable.findOne({school : schoolAdmin._id, class : req.params.classID , day : req.params.dayID})
                        const day = await Day.findOne({school : schoolAdmin._id , _id : req.params.dayID})
                        const classSchools = await ClassSchool.findOne({school : schoolAdmin._id , _id : req.params.classID}) 
                        let result         
                        if(timetables) {
                            result = timetables.subject.sort((a,b) => (a.periodNum - b.periodNum))
                        }  else {
                            result = null
                        }
                        res.render("daysubject-page" , {
                            timetables : result ,
                            subjects : subjects ,
                            periods : periods ,
                            day : day ,
                            title : "Timetable Periods" ,
                            schoolAdmin : schoolAdmin,
                            classSchools : classSchools ,
                            sessS: session.name,
                             termS: term.name ,
                             success : req.flash('success'),
                             time_active: 'active',
                             timetable_active : "active" ,
                             opentimetable_active: "pcoded-trigger",
                        })
                    }else{
                        res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'Exam Settings',
                        time_active: 'active', opentimetable_active: "pcoded-trigger",
                        timetable_active : "active"})
                    }
                }else{
                    res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'Exam Settings',
                    time_active: 'active', opentimetable_active: "pcoded-trigger",
                    timetable_active : "active"})
                }		
            }catch(err){
                res.send(err.message)
            }
            
        }else{
            res.redirect(303 , '/school')
        }
    }

    postTimetablePage = async (req , res , next) => {
        if(req.session.schoolCode) {
            try{
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const classSchool = await ClassSchool.findOne({school : schoolAdmin._id , _id : req.params.classID}) 
                const session = await Session.findOne({school : schoolAdmin._id , current : true}) 
                const subjects = await Subject.find({school : schoolAdmin._id})
                const term = await Term.findOne({school : schoolAdmin._id}) 
                const day = await Day.findOne({school : schoolAdmin._id , _id : req.params.dayID})
    
                const {nameOfDay , periodNum , subjectName } = req.body
                const periodd = await ClassTimetable.findOne({ school : schoolAdmin._id , class : req.params.classID , day : req.params.dayID })
                if(!periodd) {  
                    const classTimetable = new ClassTimetable({
                        subject : [{
                            subjectName : subjectName ,
                            periodNum : periodNum ,
                        }],
                        nameOfDay : nameOfDay ,
                        day :  day._id,
                        school : schoolAdmin._id ,
                        session : session._id ,
                        term : term._id ,
                        class : classSchool._id ,
    
    
                    })
                    const saveClassTimetable = await classTimetable.save()
                    if (saveClassTimetable) {
                        req.flash('success' , 'Data Entered Successfully!')
                        res.redirect(303 , '/school/timetable/class/' + classSchool._id + '/class-timetable/day/' +day._id + '/subject')
                        return
                    }else {
                        throw {
                            message : 'Unable to save Period'
                        }
                    }
                }
                if(periodd){
                    ClassTimetable.findByIdAndUpdate(periodd._id, {
                        $addToSet : {
                            subject : [{
                                subjectName : subjectName ,
                                periodNum : periodNum ,
                            }],
                        }
                    }, {new : true, useAndModify : false}, (err , item) => {
                        if(err){
                            res.status(500)
                            return
                        }else {
                            req.flash('success' , 'Data Entered Successfully!')
                            res.redirect(303 , '/school/timetable/class/' + classSchool._id + '/class-timetable/day/' +day._id + '/subject')
                        }
                    })	
                }
            }catch(err) {
                res.send(err.message)
            }
        }else {
            res.redirect(303 , '/school')
        }
    }
    
    removeDaySubject = async (req, res, next) => {
        try{
            if(req.session.schoolCode){ 
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const periods = await ClassTimetable.findOne({ school : schoolAdmin._id , class : req.params.classID , day : req.params.dayID })
                const classSchool = await ClassSchool.findOne({school : schoolAdmin._id , _id : req.params.classID}) 
                const day = await Day.findOne({school : schoolAdmin._id , _id : req.params.dayID})
                
                const allPeriods = periods.subject
                let mapIt = allPeriods.find( elem => elem._id == req.params.subjectID)
                ClassTimetable.findByIdAndUpdate(periods._id, {
                    $pullAll : {
                        subject : [mapIt] }
                }, {new : true, useAndModify : false}, (err , item) => {
                    if(err){
                        res.status(500) 
                        return
                    }else {
                        req.flash('success', "Your deletion was successful.") 
                        res.redirect(303 , '/school/timetable/class/' + classSchool._id + '/class-timetable/day/' +day._id + '/subject')
                    }
                })
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }
    
    getAllTimetables = async (req , res , next) => {
        if(req.session.schoolCode) {
            try{
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({school : schoolAdmin._id, current: true})
                if(session) {
                    const term = await Term.findOne({school: schoolAdmin._id, session: session._id, current: true})
                    if(term) {  
                        const periods = await Period.find({school : schoolAdmin._id})
                        const subjects = await Subject.findOne({school : schoolAdmin._id})
                        const timetables = await ClassTimetable.find({school : schoolAdmin._id , class : req.params.classID })
                        const day = await Day.find({school : schoolAdmin._id})
                        const classSchools = await ClassSchool.findOne({school : schoolAdmin._id , _id : req.params.classID })
                        let resArr    
                        if(timetables) {
                            resArr = timetables.map(item => {
                                console.log(item.subject)
                                item.subject = item.subject.sort((a,b) => (a.periodNum - b.periodNum)) 
                                return item
                            })
                            console.log(resArr)
                        }  else {
                            result = null
                        }
            
                        res.render("all-time" , {
                            timetables : resArr ,
                            subjects : subjects ,
                            periods : periods ,
                            day : day ,
                            title : `Timetable Periods for ${classSchools.name}` ,
                            schoolAdmin : schoolAdmin,
                            classSchools : classSchools ,
                            sessS: session.name,
                            termS: term.name ,
                            time_active: 'active',
                            timetable_active : "active" ,
                            opentimetable_active: "pcoded-trigger",
                        })
                    } else{
                        res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'Exam Settings',
                        time_active: 'active', opentimetable_active: "pcoded-trigger",
                        timetable_active : "active"})
                    }
                }else{
                    res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'Exam Settings',
                    time_active: 'active', opentimetable_active: "pcoded-trigger",
                    timetable_active : "active"})
                }	
            }catch(err){
                res.send(err.message)
            }
            
        }else{
            res.redirect(303 , '/school')
        }
    }

    getExamTimetablePage = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({school : schoolAdmin._id, current: true})
                if(session) {
                    const term = await Term.findOne({school: schoolAdmin._id, session: session._id, current: true})
                    if(term) {  
                        const classchool = await ClassSchool.find({school : schoolAdmin._id})
                        res.render('examtimetable-page', {title : 'Exam Timetable', schoolAdmin : schoolAdmin,
                            classchool : classchool ,
                            sessS: session.name,
                            termS: term.name ,
                            examtime_active: 'active',
                            timetable_active : "active" ,
                            opentimetable_active: "pcoded-trigger",
                        })
                    }else{
                        res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'Exam Settings',
                        examtime_active: 'active', opentimetable_active: "pcoded-trigger",
                        timetable_active : "active"})
                    }
                }else{
                    res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'Exam Settings',
                    examtime_active: 'active', opentimetable_active: "pcoded-trigger",
                    timetable_active : "active"})
                }	
    
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    getExamDayPage = async (req , res , next) => {
        if(req.session.schoolCode) {
            try{
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({school : schoolAdmin._id, current: true})
                if(session) {
                    const term = await Term.findOne({school: schoolAdmin._id, session: session._id, current: true})
                    if(term) {  
                        const days = await ExamDay.find({school : schoolAdmin._id}).sort([['nameOfDay' , 'ascending']]) 
                        res.render("examday-page" , {
                            days : days ,
                            title : "Set Exam Days" ,
                            schoolAdmin : schoolAdmin ,
                            sessS: session.name,
                            termS: term.name ,
                            success : req.flash('success'),
                            examtime_active: 'active',
                            timetable_active : "active" ,
                            opentimetable_active: "pcoded-trigger",
                        })
                    }else{
                        res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'Exam Settings',
                        examtime_active: 'active', opentimetable_active: "pcoded-trigger",
                        timetable_active : "active"})
                    }
                }else{
                    res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'Exam Settings',
                    examtime_active: 'active', opentimetable_active: "pcoded-trigger",
                    timetable_active : "active"})
                }	
            }catch(err){
                res.send(err.message)
            }
            
        }else{
            res.redirect(303 , '/school')
        }
    }
    
    postExamDayPage = async (req , res , next) => {
        if(req.session.schoolCode) {
            try{
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const {nameOfDay } = req.body
                const day = new ExamDay({
                    school : schoolAdmin._id ,
                    nameOfDay : nameOfDay
                })
                const saveDay = await day.save()
                if (saveDay) {
                    req.flash('success' , 'Data Entered Successfully!')
                    res.redirect(303 , '/school/exam-day')
                    return
                }else {
                    throw {
                        message : 'Unable to save Exam Date'
                    }
                }
            }catch(err) {
                res.send(err.message)
            }
        }else {
            res.redirect(303 , '/school')
        }
    }

    deleteExamDay = async (req , res , next ) => {
        if(req.session.schoolCode) {
            const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
            try {
                let examDay = await ExamDay.findById(req.params.examDayID) 
                if ( examDay ) {
                    let delDay =  await ExamDay.findByIdAndRemove(examDay._id) 
                    if ( delDay ) {
                        req.flash('success' , 'Exam day has been cancelled successfully.')
                        res.redirect(303 , '/school/exam-day')
                    }else {
                        throw {
                            status : 500 ,
                            message : "Internal Server Error"
                        } 
                    }
                }else {
                    throw {
                        status : 400 ,
                        message : "Something went wrong with the request "
                    }
                }
            }catch(error){
                res.sendStatus(error.status).json({message : error.message})
                return 
            }
        }
        else{
            res.redirect(303, '/school')
        }
    }

    getClassExamTimetablePage = async (req , res , next) => {
        if(req.session.schoolCode) {
            try{
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({school : schoolAdmin._id, current: true})
                if(session) {
                    const term = await Term.findOne({school: schoolAdmin._id, session: session._id, current: true})
                    if(term) {  
                        const timetables = await ExamTimetable.findOne({school : schoolAdmin._id, class : req.params.classID})
                        const day = await ExamDay.find({school : schoolAdmin._id}).sort([['nameOfDay' , 'ascending']])
                        const classSchools = await ClassSchool.findOne({school : schoolAdmin._id , _id : req.params.classID})
                        res.render("classexamtimetable-page" , {
                            timetables : timetables ,
                            day : day ,
                            title : "Exam Days" ,
                            schoolAdmin : schoolAdmin,
                            classSchools : classSchools ,
                            sessS: session.name,
                            termS: term.name ,
                            success : req.flash('success'),
                            examtime_active: 'active',
                            timetable_active : "active" ,
                            opentimetable_active: "pcoded-trigger",
                        })
                    }else{
                        res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'Exam Settings',
                        examtime_active: 'active', opentimetable_active: "pcoded-trigger",
                        timetable_active : "active"})
                    }
                }else{
                    res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'Exam Settings',
                    examtime_active: 'active', opentimetable_active: "pcoded-trigger",
                    timetable_active : "active"})
                }		
            }catch(err){
                res.send(err.message)
            }
            
        }else{
            res.redirect(303 , '/school')
        }
    }

    getExamDaySubjectPage = async (req , res , next) => {
        if(req.session.schoolCode) {
            try{
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({school : schoolAdmin._id, current: true})
                if(session) {
                    const term = await Term.findOne({school: schoolAdmin._id, session: session._id, current: true})
                    if(term) {  
                        const subjects = await Subject.findOne({school : schoolAdmin._id})
                        const session = await Session.findOne({school : schoolAdmin._id , current : true}) 
                        const timetables = await ExamTimetable.findOne({school : schoolAdmin._id, class : req.params.classID , examDay : req.params.examDayID})
                        const examDay = await ExamDay.findOne({school : schoolAdmin._id , _id : req.params.examDayID})
                        const classSchools = await ClassSchool.findOne({school : schoolAdmin._id , _id : req.params.classID}) 
                        let result         
                        if(timetables) {
                            result = timetables.subject.sort((a,b) => (a.periodNum - b.periodNum))
                        }  else {
                            result = null
                        }
            
                        res.render("examdaysubject-page" , {
                            timetables : result ,
                            subjects : subjects ,
                            examDay : examDay ,
                            title : "Timetable Periods" ,
                            schoolAdmin : schoolAdmin,
                            classSchools : classSchools ,
                            sessS: session.name,
                            termS: term.name ,
                            success : req.flash('success'),
                            examtime_active: 'active',
                            timetable_active : "active" ,
                            opentimetable_active: "pcoded-trigger",
                        })
                    } else{
                        res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'Exam Settings',
                        examtime_active: 'active', opentimetable_active: "pcoded-trigger",
                        timetable_active : "active"})
                    }
                }else{
                    res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'Exam Settings',
                    examtime_active: 'active', opentimetable_active: "pcoded-trigger",
                    timetable_active : "active"})
                }		
            }catch(err){
                res.send(err.message)
            }
            
        }else{
            res.redirect(303 , '/school')
        }
    }
    
    
    postExamTimetablePage = async (req , res , next) => {
        if(req.session.schoolCode) {
            try{
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const classSchool = await ClassSchool.findOne({school : schoolAdmin._id , _id : req.params.classID}) 
                const session = await Session.findOne({school : schoolAdmin._id , current : true}) 
                const subjects = await Subject.find({school : schoolAdmin._id})
                // const term = await Term.findOne({school : schoolAdmin._id , current : true}) 
                const examDay = await ExamDay.findOne({school : schoolAdmin._id , _id : req.params.examDayID})
    
                const {nameOfDay , periodNum , subjectName , endTime , startTime} = req.body
                const periodd = await ExamTimetable.findOne({ school : schoolAdmin._id , class : req.params.classID , examDay : req.params.examDayID })
                if(!periodd) {  
                    const examTimetable = new ExamTimetable({
                        subject : [{
                            subjectName : subjectName ,
                            periodNum : periodNum ,
                            startTime : startTime ,
                            endTime : endTime
                        }],
                        nameOfDay : nameOfDay ,
                        examDay :  examDay._id,
                        school : schoolAdmin._id ,
                        session : session._id ,
                        // term : term._id ,
                        class : classSchool._id ,
    
    
                    })
                    const saveExamTimetable = await examTimetable.save()
                    if (saveExamTimetable) {
                        req.flash('success' , 'Data Entered Successfully!')
                        res.redirect(303 , '/school/exam-timetable/class/' + classSchool._id + '/day/' +examDay._id + '/subject')
                        return
                    }else {
                        throw {
                            message : 'Unable to save Subject'
                        }
                    }
                }
                if(periodd){
                    // if (periodd.day)
                    ExamTimetable.findByIdAndUpdate(periodd._id, {
                        $addToSet : {
                            subject : [{
                                subjectName : subjectName ,
                                periodNum : periodNum ,
                                startTime : startTime ,
                                endTime : endTime
                            }],
                        }
                    }, {new : true, useAndModify : false}, (err , item) => {
                        if(err){
                            res.status(500)
                            return
                        }else {
                            res.redirect(303 , '/school/exam-timetable/class/' + classSchool._id + '/day/' +examDay._id + '/subject')
                        }
                    })	
                }
            }catch(err) {
                res.send(err.message)
            }
        }else {
            res.redirect(303 , '/school')
        }
    }
    
    removeExamDaySubject = async (req, res, next) => {
        try{
            if(req.session.schoolCode){ 
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const periods = await ExamTimetable.findOne({ school : schoolAdmin._id , class : req.params.classID , examDay : req.params.examDayID })
                const classSchool = await ClassSchool.findOne({school : schoolAdmin._id , _id : req.params.classID}) 
                const examDay = await ExamDay.findOne({school : schoolAdmin._id , _id : req.params.examDayID})
                
                const allPeriods = periods.subject
                let mapIt = allPeriods.find( elem => elem._id == req.params.subjectID)
                // console.log(mapIt)
                ExamTimetable.findByIdAndUpdate(periods._id, {
                    $pullAll : {
                        subject : [mapIt] }
                }, {new : true, useAndModify : false}, (err , item) => {
                    if(err){
                        res.status(500) 
                        return
                    }else {
                        req.flash('success', "Your deletion was successful.") 
                        res.redirect(303 , '/school/exam-timetable/class/' + classSchool._id + '/day/' +examDay._id + '/subject')
                    }
                })
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }
    
    getAllExamTimetables = async (req , res , next) => {
        if(req.session.schoolCode) {
            try{
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({school : schoolAdmin._id, current: true})
                if(session) {
                    const term = await Term.findOne({school: schoolAdmin._id, session: session._id, current: true})
                    if(term) {  
                        const timetables = await ExamTimetable.find({school : schoolAdmin._id , class : req.params.classID })
                        const examDay = await ExamDay.find({school : schoolAdmin._id})
                        const classSchools = await ClassSchool.findOne({school : schoolAdmin._id , _id : req.params.classID })
                        let resArr    
                        if(timetables) {
                            resArr = timetables.map(item => {
                                console.log(item.subject)
                                item.subject = item.subject.sort((a,b) => (a.periodNum - b.periodNum)) 
                                return item
                            })
                            console.log(resArr)
                        }  else {
                            result = null
                        }
            
                        res.render("allexam-time" , {
                            timetables : resArr ,
                            examDay : examDay ,
                            title : `Exam Timetable for ${classSchools.name}` ,
                            schoolAdmin : schoolAdmin,
                            classSchools : classSchools ,
                            schoolAdmin : schoolAdmin,
                            classSchools : classSchools ,
                            sessS: session.name,
                            termS: term.name ,
                            success : req.flash('success'),
                            examtime_active: 'active',
                            timetable_active : "active" ,
                            opentimetable_active: "pcoded-trigger",
                            term : term
                        })
                    } else{
                        res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'Exam Settings',
                        examtime_active: 'active', opentimetable_active: "pcoded-trigger",
                        timetable_active : "active"})
                    }
                }else{
                    res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'Exam Settings',
                    examtime_active: 'active', opentimetable_active: "pcoded-trigger",
                    timetable_active : "active"})
                }	 		
            }catch(err){
                res.send(err.message)
            }
            
        }else{
            res.redirect(303 , '/school')
        }
    }

    getStaffTime = async (req, res , next) => {
        try{
            if(req.session.staffCode) {
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const school = await SchoolAdmin.findOne({_id: staff.school})
                const session = await Session.findOne({school : school._id, current: true})
                if(session) {
                    const term = await Term.findOne({school: school._id, session: session._id, current: true})
                    if(term) { 
                        const classchool = await ClassSchool.find({school : school._id })
                        res.render('stafftimetable-page', {
                            title : 'Timetable', staff : staff,
                            classchool : classchool,
                             sessS: session.name,
                             termS: term.name ,
                             success : req.flash('success'),
                             time_active: 'active',
                        })
                    }else{
                        res.render('sess-term-error', {staff: staff, title: 'Exam Settings',
                        time_active: 'active'})
                    }
                }else{
                    res.render('sess-term-error', {staff: staff, title: 'Exam Settings',
                    time_active: 'active'})
                }
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }
    
    getStaffAllTimetables = async (req , res , next) => {
        if(req.session.staffCode) {
            try{
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const school = await SchoolAdmin.findOne({_id: staff.school})
                const session = await Session.findOne({school : school._id, current: true})
                if(session) {
                    const term = await Term.findOne({school: school._id, session: session._id, current: true})
                    if(term) { 
                        const periods = await Period.find({school : school._id})
                        const subjects = await Subject.findOne({school : school._id})
                        const timetables = await ClassTimetable.find({school : school._id , class : req.params.classID })
                        const day = await Day.find({school : school._id})
                        const classSchools = await ClassSchool.findOne({school : school._id , _id : req.params.classID })
                        let resArr    
                        if(timetables) {
                            resArr = timetables.map(item => {
                                console.log(item.subject)
                                item.subject = item.subject.sort((a,b) => (a.periodNum - b.periodNum)) 
                                return item
                            })
                            console.log(resArr)
                        }  else {
                            result = null
                        }
            
                        res.render("staffall-time" , {
                            timetables : resArr ,
                            subjects : subjects ,
                            periods : periods ,
                            day : day ,
                            title : `Timetable Periods for ${classSchools.name}` ,
                            school : school,
                            staff : staff ,
                            classSchools : classSchools ,
                            sessS: session.name,
                            termS: term.name ,
                            time_active: 'active',
                        })
                    } else{
                        res.render('sess-term-error', {school: school, title: 'Exam Settings',
                        time_active: 'active'})
                    }
                }else{
                    res.render('sess-term-error', {school: school, title: 'Exam Settings',
                    time_active: 'active'})
                }	
            }catch(err){
                res.send(err.message)
            }
            
        }else{
            res.redirect(303 , '/staff')
        }
    }
    
    
    getStaffExamTime = async (req, res , next) => {
        try{
            if(req.session.staffCode) {
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const school = await SchoolAdmin.findOne({_id: staff.school})
                const session = await Session.findOne({school : school._id, current: true})
                if(session) {
                    const term = await Term.findOne({school: school._id, session: session._id, current: true})
                    if(term) { 
                        const classchool = await ClassSchool.find({school : school._id })
                        res.render('staffexamtimetable-page', {
                            title : 'Timetable', staff : staff,
                            classchool : classchool,
                             sessS: session.name,
                             termS: term.name ,
                             examtime_active: 'active',
                        })
                    }else{
                        res.render('sess-term-error', {staff: staff, title: 'Exam Settings',
                        examtime_active: 'active'})
                    }
                }else{
                    res.render('sess-term-error', {staff: staff, title: 'Exam Settings',
                    examtime_active: 'active'})
                }
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }
    
    getStaffAllExamTimetables = async (req , res , next) => {
        if(req.session.staffCode) {
            try{
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const school = await SchoolAdmin.findOne({_id: staff.school})
                const session = await Session.findOne({school : school._id, current: true})
                if(session) {
                    const term = await Term.findOne({school: school._id, session: session._id, current: true})
                    if(term) { 
                        const timetables = await ExamTimetable.find({school : school._id , class : req.params.classID })
                        const examDay = await ExamDay.find({school : school._id})
                        const classSchools = await ClassSchool.findOne({school : school._id , _id : req.params.classID })
                        let resArr    
                        if(timetables) {
                            resArr = timetables.map(item => {
                                console.log(item.subject)
                                item.subject = item.subject.sort((a,b) => (a.periodNum - b.periodNum)) 
                                return item
                            })
                            console.log(resArr)
                        }  else {
                            result = null
                        }
            
                        res.render("allexam-time" , {
                            timetables : resArr ,
                            examDay : examDay ,
                            title : `Timetable for ${classSchools.name}` ,
                            school : school,
                            classSchools : classSchools ,
                            sessS: session.name,
                            termS: term.name ,
                            examtime_active: 'active',
                            term : term ,
                            staff : staff 
                        })
                    } else{
                        res.render('sess-term-error', {school: school, title: 'Exam Settings',
                        examtime_active: 'active'})
                    }
                }else{
                    res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'Exam Settings',
                    examtime_active: 'active'})
                }	 		
            }catch(err){
                res.send(err.message)
            }
            
        }else{
            res.redirect(303 , '/staff')
        }
    }

    getStudentTimetable = async (req , res , next) => {
        if(req.session.regNumber) {
            try {
                const student = await Student.findOne({studentID : req.session.regNumber})
                const school = await SchoolAdmin.findOne({_id : student.school})
                const session = await Session.findOne({school: school._id, current: true})
                if(session){
                    const term = await Term.findOne({session: session._id, current: true})
                    if(term) {
                        const className = await ClassSchool.findOne({_id : student.className})
                        res.render('studenttimetable-page', {
                            title : 'Timetable', student : student,
                            className : className,
                             sessS: session.name,
                             termS: term.name ,
                             success : req.flash('success'),
                             time_active: 'active',
                        })
                    }else{
                        res.render('sess-term-error', {school: school, title: 'Exam Settings',
                        time_active: 'active'})
                    }
                }else{
                    res.render('sess-term-error', {school: school, title: 'Exam Settings',
                    time_active: 'active'})
                }
            }catch(err) {
                    res.send(err.message)
                }
        }else {
            res.redirect(303, '/student')
        }
    }
    
    getStudentAllTimetables = async (req , res , next) => {
        if(req.session.regNumber) {
            try{
                const student = await Student.findOne({studentID : req.session.regNumber})
                const school = await SchoolAdmin.findOne({_id : student.school})
                const session = await Session.findOne({school : school._id, current: true})
                if(session) {
                    const term = await Term.findOne({school: school._id, session: session._id, current: true})
                    if(term) { 
                        const periods = await Period.find({school : school._id})
                        const subjects = await Subject.findOne({school : school._id})
                        const timetables = await ClassTimetable.find({school : school._id , class : req.params.classID })
                        const day = await Day.find({school : school._id})
                        const className = await ClassSchool.findOne({_id : student.className})
                        let resArr    
                        if(timetables) {
                            resArr = timetables.map(item => {
                                console.log(item.subject)
                                item.subject = item.subject.sort((a,b) => (a.periodNum - b.periodNum)) 
                                return item
                            })
                            console.log(resArr)
                        }  else {
                            result = null
                        }
            
                        res.render("studentall-time" , {
                            timetables : resArr ,
                            subjects : subjects ,
                            periods : periods ,
                            day : day ,
                            title : `Timetable Periods for ${className.name}` ,
                            school : school,
                            student : student ,
                            className : className ,
                            sessS: session.name,
                            termS: term.name ,
                            time_active: 'active',
                        })
                    } else{
                        res.render('sess-term-error', {school: school, title: 'Exam Settings',
                        time_active: 'active'})
                    }
                }else{
                    res.render('sess-term-error', {school: school, title: 'Exam Settings',
                    time_active: 'active'})
                }	
            }catch(err){
                res.send(err.message)
            }
            
        }else{
            res.redirect(303 , '/student')
        }
    }
    
    getStudentExamTimetable = async (req , res , next) => {
        if(req.session.regNumber) {
            try {
                const student = await Student.findOne({studentID : req.session.regNumber})
                const school = await SchoolAdmin.findOne({_id : student.school})
                const session = await Session.findOne({school: school._id, current: true})
                if(session){
                    const term = await Term.findOne({session: session._id, current: true})
                    if(term) {
                        const className = await ClassSchool.findOne({_id : student.className})
                        res.render('studentexamtimetable-page', {
                            title : 'Timetable', student : student,
                            className : className,
                             sessS: session.name,
                             termS: term.name ,
                             examtime_active: 'active',
                        })
                    }else{
                        res.render('sess-term-error', {school: school, title: 'Exam Settings',
                        examtime_active: 'active'})
                    }
                }else{
                    res.render('sess-term-error', {school: school, title: 'Exam Settings',
                    examtime_active: 'active'})
                }
            }catch(err) {
                    res.send(err.message)
                }
        }else {
            res.redirect(303, '/student')
        }
    }
    
    getStudentAllExamTimetables = async (req , res , next) => {
        if(req.session.regNumber) {
            try{
                const student = await Student.findOne({studentID : req.session.regNumber})
                const school = await SchoolAdmin.findOne({_id : student.school})
                const session = await Session.findOne({school : school._id, current: true})
                if(session) {
                    const term = await Term.findOne({school: school._id, session: session._id, current: true})
                    if(term) { 
                        const timetables = await ExamTimetable.find({school : school._id , class : req.params.classID })
                        const examDay = await ExamDay.find({school : school._id})
                        const className = await ClassSchool.findOne({_id : student.className})
                        let resArr    
                        if(timetables) {
                            resArr = timetables.map(item => {
                                console.log(item.subject)
                                item.subject = item.subject.sort((a,b) => (a.periodNum - b.periodNum)) 
                                return item
                            })
                            console.log(resArr)
                        }  else {
                            result = null
                        }
            
                        res.render("student-allexam" , {
                            timetables : resArr ,
                            examDay : examDay ,
                            title : `Exam Timetable for ${className.name}` ,
                            school : school,
                            student : student ,
                            className : className ,
                            sessS: session.name,
                            termS: term.name ,
                            examtime_active: 'active',
                            term : term
                        })
                    } else{
                        res.render('sess-term-error', {school: school, title: 'Exam Settings',
                        examtime_active: 'active'})
                    }
                }else{
                    res.render('sess-term-error', {school: school, title: 'Exam Settings',
                    examtime_active: 'active'})
                }	
            }catch(err){
                res.send(err.message)
            }
            
        }else{
            res.redirect(303 , '/student')
        }
    }
}

const returnApp = new App()

module.exports = returnApp 