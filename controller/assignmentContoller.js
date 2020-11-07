const SchoolAdmin = require('../model/schoolAdmin')
const Staff = require("../model/staff")
const Assignment = require('../model/assignment')
const ClassSchool = require('../model/classchool')
const Session = require('../model/session')
const Term = require('../model/term')
const Student = require("../model/student")

const FileHandler = require('./file')

class App {
    getAssignmentPage = async(req, res, next) => {
        try{ 
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({school : school._id, current : true})
                const term = await Term.findOne({session : session._id, current: true})

                res.render('assignmentNote', {title: "Assignment", staff: staff, code : school.schoolCode,
                    session: session,term: term, assignment_active : "active", sessS: session.name, termS: term.name,
                    assign_active : "pcoded-trigger", make_active : "active"})
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    makeAssignment = async (req, res, next) => {
        try{ 
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({school : school._id, current : true})
                const term = await Term.findOne({session : session._id, current : true})
                const assignment = await Assignment.find({school : staff.school, staff: staff._id,
                    session : session._id, term : term._id})

                res.render('make-assignment', {title: "Assignment", staff: staff, code : school.schoolCode, 
                    session: session, term: term, assignment_active : "active", assignment : assignment, sessS: session.name, 
                    termS: term.name, assign_active : "pcoded-trigger", make_active : "active"})
                
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    postAssignment = async(req, res, next) =>{
        try{ 
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({school : school._id, current : true})
                const term = await Term.findOne({session : session._id, current : true})
                if(staff){
                    const{subject, week, className, releaseDate, submissionDate, contentDetail} = req.body
                    let assignment =await new Assignment({
                        school: school._id,
                        staff: staff._id,
                        subject: subject,
                        session : session._id,
                        term: term._id,
                        className: className,
                        releaseDate : releaseDate,
                        submissionDate : submissionDate,
                        content : {
                            contentDetail: contentDetail
                        },
                    })
                    let ret = await assignment.save()
                    if(ret){
                        let redirectUrl = '/staff/assignment/' + req.params.term + '/all'
                        res.redirect(303, redirectUrl)
                    }else{
                        throw{
                            message : "Error in saving."
                        }
                    }
                }else{
                    throw{
                        message : "Cannot add Assignment"
                    }
                }
            }
        }catch(err){
            res.json(err.message)
        }
    }

    uploadAssignment = async (req, res, next) => {
        try{ 
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({school : school._id, current : true})
                const term = await Term.findOne({session : session._id, current : true})
                const assignment = await Assignment.find({school : staff.school, staff: staff._id,
                    session : session._id, term : term._id})

                res.render('upload-assignment', {title: "Assignment", staff: staff, code : school.schoolCode, 
                    session: session, term: term, assignment_active : "active", assignment : assignment,
                    sessS: session.name, termS: term.name, assign_active : "pcoded-trigger", make_active : "active"})
                
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    postUploadAssignment = async(req, res, next) => {
        try{
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({school : school._id, current : true})
                const term = await Term.findOne({session : session._id, current: true})
                const{subject, week, className, releaseDate, submissionDate} = req.body

                FileHandler.createDirectory("./public/uploads/schools/" + school.schoolCode + "/assignment/")
                FileHandler.createDirectory("./public/uploads/schools/" + school.schoolCode + "/assignment/" + staff.staffID)


                if(staff){
                    if(req.file){
                        let originalName = req.file.filename
                        let lessonNote =await new Assignment({
                            school: school._id,
                            staff: staff._id,
                            subject: subject,
                            session : session._id,
                            term: term._id,
                            className: className,
                            releaseDate : releaseDate,
                            submissionDate : submissionDate,
                            image : originalName
                        })
                        let ret = await lessonNote.save()
                        if(ret){
                            FileHandler.moveFile(originalName ,  "./public/uploads/profile" , "./public/uploads/schools/" + school.schoolCode + "/assignment/" + staff.staffID + "/")
                            const redirectUrl = '/staff/assignment/' + req.params.term + '/all'
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
                throw{
                    message : "You cannot access this page"
                } 
            }
        }catch(err){
            res.render("error-page", {error: err}) 
        }
    }

    getAllAssignment = async (req, res, next) => {
        try{ 
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({school : school._id, current : true})
                const term = await Term.findOne({session : session._id, current : true})
                const assignment = await Assignment.find({school : staff.school, staff: staff._id,
                    session : session._id, term : term._id})
                if(assignment.length > 0){
                    res.render("view-assignment", {title: "Assignment", staff: staff, code : school.schoolCode, 
                        assignments : assignment, assignment_active : "active", session: session, term : term,
                        sessS: session.name, termS: term.name, assign_active : "pcoded-trigger", all_active : "active"})
                }else{
                    res.render("view-assignment", {title: "Assignment", staff: staff, code : school.schoolCode, 
                        noAssignment: "No Assignment has been created.", assignment_active : "active", 
                        session: session, term : term, sessS: session.name, termS: term.name, assign_active : "pcoded-trigger", all_active : "active"})
                }
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    getSingleAssignment = async (req, res, next) => {
        try{ 
            if(req.session.staffCode){
                const staff = await Staff.findOne({staffID : req.session.staffCode})
                const school = await SchoolAdmin.findOne({_id : staff.school})
                const session = await Session.findOne({school : school._id, current : true})
                const term = await Term.findOne({session : session._id, current : true})
                const singleAssignment = await Assignment.findOne({_id : req.params.assignment})
                if(singleAssignment){
                    res.render("view-single-assignment", {title: "Assignment", staff: staff, school : school.schoolCode, term: term,
                        singleAssignment : singleAssignment, assignment_active: "active", session: session ,
                        sessS: session.name, termS: term.name, assign_active : "pcoded-trigger", all_active : "active"})
                }else{
                    throw{
                        message : "Assignment not found."
                    }
                }
            }else{
                res.redirect(303, '/staff')
            }
        }catch(err){
            res.render("error-page", {error: err})
        }
    }

    getAssignments = async (req, res, next) => {
        try{
            if(req.session.regNumber){
                const student = await Student.findOne({studentID : req.session.regNumber})
                const school = await SchoolAdmin.findOne({_id : student.school})
                const className = await ClassSchool.findOne({_id : student.className})
                console.log(student)
                const session = await Session.findOne({school : student.school, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const assignments = await Assignment.find({session : session._id, term : term._id, school: student.school})

                const staffs = await Staff.find({school : school._id})

                let staffName = {}
                staffs.map(elem => staffName[elem._id] = elem.firstName + " " + elem.lastName)

                if(assignments.length > 0){
                    res.render('assignments', {title : "Assignments", student: student, 
                    assignment_active : "active", assignments : assignments, session : session, term: term,
                    className : className, staffName: staffName, sessS: session.name, termS: term.name,
                    assign_active : "pcoded-trigger", all_active : "active"})
                }else{
                    res.render('assignments', {title : "Assignments", student: student, 
                    assignemnt_active : "active", noAssignment : "No assignments found.", session : session, term: term,
                    className : className, staffName: staffName, sessS: session.name, termS: term.name,
                    assign_active : "pcoded-trigger", all_active : "active"})
                }
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    getChildAssignment = async (req, res, next) => {
        try{
            if(req.session.regNumber){
                const student = await Student.findOne({studentID : req.session.regNumber})
                const school = await SchoolAdmin.findOne({_id : student.school})
                const className = await ClassSchool.findOne({_id : student.className})
                console.log(className)
                const session = await Session.findOne({school : student.school, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                const singleAssignment = await Assignment.findOne({_id : req.params.assignmentId})
                console.log(singleAssignment)
                const staffs = await Staff.findOne({school : school._id})
                console.log(staffs)
                res.render('assignment', {title : "Assignments", student: student, 
                    assignment_active : "active", singleAssignment : singleAssignment, session: session, term: term,
                    className : className, staffs: staffs, school : school.schoolCode, sessS: session.name, 
                    termS: term.name, assign_active : "pcoded-trigger", make_active : "active"})
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