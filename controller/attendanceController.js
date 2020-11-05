
const SchoolAdmin = require('../model/schoolAdmin')
const Staff = require("../model/staff")
const Student = require('../model/student')
const Attendance = require('../model/attendance')
const ClassSchool = require('../model/classchool')
const Session = require('../model/session')
const Term = require('../model/term')

class App{
    attendanceSessionTerm = async (req, res, next) => {
        try{
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const classHead = await Staff.findOne({_id: staff._id, classHead: {$exists : true}})
                const allClass = await ClassSchool.find({school: school._id})
                const session = await Session.findOne({school: school._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})

                let className = {}
                allClass.map(s => className[s._id] = s.name)

                res.render('attendance-term', {staff: staff, code : school.schoolCode,
                    attendance_active : "active", title: 'Attendance', sessS: session.name,
                    classHead: classHead, className: className, termS: term.name
                })

            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    attendancePage = async (req, res, next) => {
        try{
            if(req.session.staffCode){
                let redirectUrl = '/staff/attendance/' + req.params.className + '/1'
                res.redirect(303, redirectUrl)
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    getAttendance = async(req, res, next) => {
        try{ 
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                if(staff.classHead){
                    const session = await Session.findOne({school : school._id, current : true})
                    const term = await Term.findOne({session : session._id, current: true})
                    const students = await Student.find({className : staff.classHead})
                    const attendance = await Attendance.find({
                        staff : staff._id, 
                        session : session._id, 
                        term : term._id
                    })
                    const classSchool = await ClassSchool.findOne({_id : staff.classHead})

                    let studentName = {}
                    students.map(student => 
                        studentName[student._id] = student.lastName + " " + student.firstName + " " + student.otherName
                    )
                    if(attendance.length > 0){

                        let week1Attendance = attendance.map(week => {
                            week.attendance = week.attendance.filter(w => {
                                return w.week == req.params.week
                            })
                            return week
                        })
                        const attendanceWeek = week1Attendance[0].attendance

                        let weekday = new Array(7)
                        weekday[0] = "M"
                        weekday[1] = "T"
                        weekday[2] = "W"
                        weekday[3] = "Th"
                        weekday[4] = "F"
                        weekday[5] = "S"
                        weekday[6] = "S"

                        res.render('staff-attendance', {staff: staff, code : school.schoolCode,
                        attendance_active : "active", attendance : week1Attendance, studentName : studentName,
                        classSchool : classSchool, attendanceWeek : attendanceWeek, week : req.params.week,
                        weekday: weekday, sessS: session.name, termS: term.name})   
                    }else{
                        res.render('staff-attendance', {staff: staff, code : school.schoolCode,
                            attendance_active : "active", classSchool : classSchool, 
                            noAttendance : "No attendance has been recorded.", week : req.params.week,
                            session : session, term : term, sessS: session.name, termS: term.name})
                    }
                }else{
                    res.render('staff-attendance', {staff: staff, code : school.schoolCode,
                        attendance_active : "active", noAttendance : "You can't access this page.",
                    })
                }
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }


    getMarkAttendance = async(req, res, next) => {
        try{ 
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({school : school._id, current : true})
                const term = await Term.findOne({session : session._id, current: true})
                const student = await Student.find({className : staff.classHead})

                res.render('mark-attendance', {staff: staff, students : student, 
                    code : school.schoolCode, attendance_active : "active", 
                    sessS : session.name, termS : term.name, pClass: req.params.className})
                
            }else{
                res.redirect(303, '/staff/attendance')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    postMarkAttendance = async(req, res, next) => {
        try{
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const session = await Session.findOne({school : staff.school, current : true})
                const term = await Term.findOne({session : session._id, current: true})
                const {targetStudents} = req.body 
                console.log(targetStudents)
                let studentIds = targetStudents.map(e => e.id)
                const students = await Student.find(
                    {_id : {$in : studentIds}}
                )
                const school = await SchoolAdmin.findOne({_id : staff.school}) 
                let count = targetStudents.length 
                while(count > 0){ 
                    for (let student of targetStudents){ 
                        const attendance = await Attendance.findOne({student : student.id}) 
                        if(!attendance){
                            const markedAttendance = await new Attendance({
                                student : student.id,
                                session : session._id,
                                term : term._id,
                                className : staff.classHead,
                                staff : staff._id,
                                school : staff.school,
                                attendance : [
                                    {
                                        date : student.date,
                                        week : student.week,
                                        mark : student.mark
                                    }
                                ]
                            })
                            await markedAttendance.save()  
                            console.log("The record was created")
                        }else {
                            await Attendance.findByIdAndUpdate(attendance._id, {
                                $addToSet : {
                                    attendance : [
                                        {
                                            date : student.date,
                                            week : student.week,
                                            mark : student.mark
                                        }
                                    ]}
                                }, {
                                    new : true, 
                                    useFindAndModify : false
                                }
                            ) 
                            console.log("The record was updated")
                        }
                        count -= 1 
                    }
                }
                res.json({message : "Your record was saved successfully."})
            }
        }catch(err){
            res.render("error-page", {error: err})
        }     
    }
}

const returnApp = new App()

module.exports = returnApp