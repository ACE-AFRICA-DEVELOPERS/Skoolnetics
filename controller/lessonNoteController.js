const SchoolAdmin = require('../model/schoolAdmin')
const Staff = require("../model/staff")
const LessonNote = require('../model/lessonNote')
const ClassSchool = require('../model/classchool')
const Session = require('../model/session')
const Term = require('../model/term')
const Student = require("../model/student")

const FileHandler = require('./file')

class App {

    getLessonNotePage = async(req, res, next) => {
        try{ 
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({school : school._id, current : true})
                const term = await Term.findOne({session : session._id, current: true})
                res.render('lessonNote', {title: "Lesson Notes", staff: staff, code : school, session: session,
                    term: term, notes_active : "active", sessS: session.name, termS: term.name, lessonNote_active : "active",
                    note_active : "pcoded-trigger", make_active : "active"})
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    makeLessonNote = async (req, res, next) => {
        try{ 
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                console.log(staff)
                console.log(school)
                const session = await Session.findOne({school : school._id, current : true})
                console.log(session)
                const term = await Term.findOne({session : session._id, current : true})
                console.log(term)
                const lessonNote = await LessonNote.find({school : staff.school, staff: staff._id,
                    session : session._id, term : term._id})

                res.render('make-lesson-note', {title: "Lesson Notes", staff: staff, code : school, session: session,
                term: term, notes_active : "active", lessonNote : lessonNote, sessS: session.name, termS: term.name,
                lessonNote_active : "active", note_active : "pcoded-trigger", make_active : "active"})
                
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    postLessonNote = async(req, res, next) =>{
        try{ 
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({school : school._id, current : true})
                const term = await Term.findOne({session : session._id, current: true})
                const{subject,week, date, topic, materials, contentTopic, 
                    contentDetail, presentation,evaluation,conclusion} = req.body
                let findClass = staff.teaching.find(s => s._id == subject)
                if(staff) {
                    let lessonNote =await new LessonNote({
                        school: school._id,
                        staff: staff._id,
                        subject: findClass.subject,
                        session : session._id,
                        term: term._id,
                        className: findClass.className,
                        date: date,
                        week: week,
                        topic: topic,
                        materials: materials,
                        content : {
                            contentTopic: contentTopic,
                            contentDetail: contentDetail
                        },
                        presentation : presentation,
                        evaluation : evaluation,
                        conclusion : conclusion
                    })
                    let ret = await lessonNote.save()
                    if(ret){
                        let redirectUrl = '/staff/lesson-note/all'
                        res.redirect(303, redirectUrl)
                    }else{
                        throw{
                            message : "Cannot add Lesson Note"
                        }
                    }
                }else{
                    throw{
                        message: "Cannot accesss write a lesson note"
                    }
                }
            }else{
                throw{
                    message: "Cannot access this page"
                }
            }
        }catch(err){
            res.json(err.message)
        }
    }

    getUploadNote = async(req, res, next) => {
        try{ 
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({school : school._id, current : true})
                const term = await Term.findOne({session : session._id, current : true})
                const lessonNote = await LessonNote.find({school : staff.school, staff: staff._id,
                    session : session._id, term : term._id})

                res.render('upload-lesson-note', {title: "Lesson Notes", staff: staff, code : school, session: session,
                    term: term, notes_active : "active", lessonNote : lessonNote, sessS: session.name, termS: term.name,
                    lessonNote_active : "active", note_active : "pcoded-trigger", make_active : "active"})
                
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    postUploadNote = async(req, res, next) => {
        try{
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({school : school._id, current : true})
                const term = await Term.findOne({session : session._id, current: true})
                const{subject, week, date} = req.body

                FileHandler.createDirectory("./public/uploads/schools/" + school.schoolCode + "/lesson-note/")
                FileHandler.createDirectory("./public/uploads/schools/" + school.schoolCode + "/lesson-note/" + staff.staffID)

                if(staff){
                    let findClass = staff.teaching.find(s => s._id == subject)
                    if(req.file){
                        let originalName = req.file.filename
                        let lessonNote =await new LessonNote({
                            school: school._id,
                            staff: staff._id,
                            subject: findClass.subject,
                            session : session._id,
                            term: term._id,
                            className: findClass.className,
                            date: date,
                            week: week,
                            image : originalName
                        })
                        let ret = await lessonNote.save()
                        if(ret){
                            FileHandler.moveFile(originalName ,  "./public/uploads/profile" , "./public/uploads/schools/" + school.schoolCode + "/lesson-note/" + staff.staffID + "/")
                            const redirectUrl = '/staff/lesson-note/all'
                            res.redirect(303, redirectUrl)
                        }else{
                            throw{
                                message : "Cannot add Lesson Note"
                            }
                        }
                    }else{
                        throw{
                            message: "File cannot be uploaded"
                        }
                    }
                }else{
                    throw{
                        message : "You cannot access this page"
                    }
                }
            }else{
                res.redirect(303, '/login')
            }
        }catch(err){
            res.render("error-page", {error: err}) 
        }
    }


    getAllLessonNote = async (req, res, next) => {
        try{ 
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({school : school._id, current : true})
                const term = await Term.findOne({session : session._id, current : true})
                const lessonNote = await LessonNote.find({school : staff.school, staff: staff._id,
                    session : session._id, term : term._id})

                res.render("view-lesson-note", {staff: staff, code : school, lessonNotes : lessonNote,
                lessonNote_active : "active", session: session, term : term, sessS: session.name, termS: term.name,
                note_active : "pcoded-trigger", all_active : "active", title: 'Lesson Notes'})
               
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    getSingleLessonNote = async (req, res, next) => {
        try{ 
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({school : school._id, current : true})
                const term = await Term.findOne({session : session._id, current: true})
                const singleLessonNote = await LessonNote.findOne({_id : req.params.lessonNote})

                if(singleLessonNote){
                    res.render("view-single-lesson-note", {title: "Lesson Notes", staff: staff, school : school.schoolCode,
                    singleLessonNote : singleLessonNote, notes_active: "active", term: term, session: session, code : school,
                    lessonNote_active : "active", sessS: session.name, termS: term.name, note_active : "pcoded-trigger", all_active : "active"})
                }else{
                    throw{
                        message : "Note not found."
                    }
                }
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    getLessonNotes = async (req, res, next) => {
        try{
            if(req.session.regNumber){
                const student = await Student.findOne({studentID : req.session.regNumber})
                const school = await SchoolAdmin.findOne({_id : student.school})
                const className = await ClassSchool.findOne({_id : student.className})
                const session = await Session.findOne({school : student.school, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const lessonNotes = await LessonNote.find({
                    session : session._id, 
                    term : term._id, 
                    status : "Approved",
                    className: className.name
                })

                const staffs = await Staff.find({school : school._id})

                let staffName = {}
                staffs.map(elem => staffName[elem._id] = elem.firstName + " " + elem.lastName)

                res.render('lesson-notes', {title : "Lesson Notes", student: student, code : school,
                note_active : "active", lessonNotes : lessonNotes, session : session, term: term,
                className : className, staffName: staffName, sessS: session.name, termS: term.name,
                lessonNote_active : "active", note_active : "pcoded-trigger", all_active : "active"})
               
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    getSingleNote = async (req, res, next) => {
        try{
            if(req.session.regNumber){
                const student = await Student.findOne({studentID : req.session.regNumber})
                const school = await SchoolAdmin.findOne({_id : student.school})
                const className = await ClassSchool.findOne({_id : student.className})
                const session = await Session.findOne({school : student.school, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const staffs = await Staff.findOne({school : school._id})
                const singleNote = await LessonNote.findOne({_id : req.params.lessonNoteID})
                res.render('student-note', {title : "Lesson Note", student: student, code : school,
                note_active : "active", singleLessonNote : singleNote, session: session, term: term,
                className : className, staffs : staffs, school : school.schoolCode, sessS: session.name, 
                termS: term.name, note_active : "pcoded-trigger", make_active : "active"})
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }
}

const returnApp = new App()

module.exports = returnApp 