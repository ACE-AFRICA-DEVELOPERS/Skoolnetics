'use strict' 

const FileHandler = require('./file')
const SchoolAdmin = require('../model/schoolAdmin')
const Subject = require('../model/subject')
const ClassSchool = require('../model/classchool')
const Student = require('../model/student')
const Session = require('../model/session')
const Term = require('../model/term')

class App {

    getSubjects = async(req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                if(session){
                    const term = await Term.findOne({school: schoolAdmin._id, session: session._id, current: true})
                    if(term){
                        const subjects = await Subject.findOne({school : schoolAdmin._id})
                        res.render('school-subjects', {title : "Subjects", session_active : "active",
                        schoolAdmin : schoolAdmin, subjects : subjects, success : req.flash('success'),
                        subject_active: 'active', opensession_active: "pcoded-trigger",
                        sessS: session.name, termS: term.name})
                    }else{
                        res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'Subjects',
                        session_active: 'active', opensession_active: "pcoded-trigger",
                        subject_active: 'active'})
                    }
                }else{
                    res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'Subjects',
                    session_active: 'active', opensession_active: "pcoded-trigger",
                    subject_active: 'active'})
                }
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    addASubject = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                try{ 
                    const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                    const subjects = await Subject.findOne({school : schoolAdmin._id}) 
                    Subject.findByIdAndUpdate(subjects._id, {
                        $addToSet : {
                            subjects : [req.body.subject] }
                    }, {new : true, useAndModify : false}, (err , item) => {
                        if(err){
                            res.status(500)
                            return
                        }else {
                            req.flash('success', "Added successfully.")
                            res.redirect(303, '/school/subjects/')
                        }
                    })	
                }catch(err){
                    res.send(err.message)
                }
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    removeSubject = async (req, res, next) => {
        try{
            if(req.session.schoolCode){ 
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const subjects = await Subject.findOne({school : schoolAdmin._id}) 
                const allSubjects = subjects.subjects
                let mapIt = allSubjects.find( elem => elem == req.params.subjectname)
                Subject.findByIdAndUpdate(subjects._id, {
                    $pullAll : {
                        subjects : [mapIt] }
                }, {new : true, useAndModify : false}, (err , item) => {
                    if(err){
                        res.status(500)
                        return
                    }else {
                        req.flash('success', "Your deletion was successful.") 
                        res.redirect(303, '/school/subjects')
                    }
                })
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    getClasses = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const className = await ClassSchool.find({school : schoolAdmin._id})
                const subjects = await Subject.findOne({school : schoolAdmin._id})
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                if(session){
                    const term = await Term.findOne({school: schoolAdmin._id, session: session._id, current: true})
                    if(term){
                        res.render('admin-class', {title : "Classes", schoolAdmin : schoolAdmin, className : className,
                        error : req.flash('error'), success : req.flash('success'), 
                        class_active : "active", subjects : subjects,
                        session_active: 'active', opensession_active: "pcoded-trigger",
                        sessS: session.name, termS: term.name})
                    }else{
                        res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'Classes',
                        session_active: 'active', opensession_active: "pcoded-trigger",
                        class_active: 'active'})
                    }
                }else{
                    res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'Classes',
                    session_active: 'active', opensession_active: "pcoded-trigger",
                    class_active: 'active'})
                }
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    postClasses = async (req , res , next) => { 
        try {
		    if(req.session.schoolCode){
                const school = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const classchool = await ClassSchool.findOne({name : req.body.name, school : school._id})
                if(classchool){
                    req.flash('error', "You have this class saved already.")
                    res.redirect('/school/class')
                    return 
                }else{	 
                    const className = await new ClassSchool({
                        name : req.body.name,
                        subjects : req.body.subjects,
                        school : school._id
                    })
                    const saveClass = await className.save()
                    if ( saveClass ) { 
                         
                        FileHandler.createDirectory("./public/uploads/schools/" + req.session.schoolCode + "/staffs/")
                        FileHandler.createDirectory("./public/uploads/schools/" + req.session.schoolCode + "/" + saveClass.name) 

                        req.flash('success', "Your record has been saved successfully.")
                        res.redirect('/school/class')
                        return 
                    }else {
                        throw {
                            message : "Unable to save this Class"
                        }
                        return 
                    }
                }
			}
            else {
                res.redirect(303, '/school')
            }
        }
        catch(error) {
            res.render('error-page', {error : error})
        }
	} 

    getStudentClass = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                let title = `Students in ${req.params.classname}`
                let singleClass = await ClassSchool.findOne({name : req.params.classname, school : schoolAdmin._id})
                let totalStudent = await Student.find({className : singleClass._id, school : schoolAdmin._id}) 
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                const term = await Term.findOne({session: session._id, current: true})
                res.render("class-students" , {
                    students : totalStudent,
                    title : title,
                    schoolAdmin : schoolAdmin,
                    mainClass : req.params.classname,
                    class_active : "active",
                    session_active: 'active', 
                    opensession_active: "pcoded-trigger",
                    sessS: session.name,
                    termS: term.name})
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    deleteClass = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const classchool = await ClassSchool.findOne({name : req.params.classname, school : schoolAdmin._id})
                let theID = classchool._id
                let students = await Student.find({className : theID, school : schoolAdmin._id})
                if(students.length == 0){
                    ClassSchool.findByIdAndDelete(theID, err => {
                        if(err){
                            res.send(err)
                        }
                        req.flash('success' , 'Class has been deleted successfully.')
                        res.redirect('/school/class')
                    })	
                }else {
                    req.flash('success' , 'You have registered students here already. Unable to delete.')
                    res.redirect('/school/class')
                }
			}
            else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    subjectsClass = async (req , res , next) => {
        try{
            if(req.session.schoolCode){
                let title = `Subjects offered in ${req.params.classname}`
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                let classchool = await ClassSchool.findOne({name : req.params.classname, school : schoolAdmin._id})
                res.render("subject-class", {title : title, schoolAdmin : schoolAdmin, 
                    classchools : classchool, success : req.flash('success'), 
                    mainClass : req.params.classname, class_active : "active",
                    session_active: 'active', opensession_active: "pcoded-trigger"}) 
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    addSubject = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const classchool = await ClassSchool.findOne({name : req.params.classname, school : schoolAdmin._id}) 
                ClassSchool.findByIdAndUpdate(classchool._id, {
                    $addToSet : {
                        subjects : [req.body.subject] }
                }, {new : true, useAndModify : false}, (err , item) => {
                    if(err){
                        res.status(500)
                        return
                    }else {
                        req.flash('success', "Added successfully.")
                        let redirectUrl = '/school/class/' + req.params.classname+ '/subjects' 
                        res.redirect(303, redirectUrl)
                    }
                })	
            }
            else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    deleteSubject = async (req, res, next) => {
        try{
            if(req.session.schoolCode){ 
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const classchool = await ClassSchool.findOne({name : req.params.classname, school : schoolAdmin._id})
                const allSubjects = classchool.subjects
                let mapIt = allSubjects.find( elem => elem == req.params.subjectname)
                ClassSchool.findByIdAndUpdate(classchool._id, {
                    $pullAll : {
                        subjects : [mapIt] }
                }, {new : true, useAndModify : false}, (err , item) => {
                    if(err){
                        res.status(500)
                        return
                    }else {
                        req.flash('success', "Your deletion was successful.")
                        let redirectUrl = '/school/class/' + req.params.classname+ '/subjects' 
                        res.redirect(303, redirectUrl)
                    }
                })
            }
            else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }
    
}


const returnApp = new App()

module.exports = returnApp 