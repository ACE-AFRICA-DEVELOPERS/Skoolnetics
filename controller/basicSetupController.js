
const FileHandler = require('./file')

const SchoolAdmin = require('../model/schoolAdmin')
const Session = require('../model/session')
const Term = require('../model/term')
const ExamCompute = require('../model/exam-settings')
const Grade = require('../model/grade')
const Role = require('../model/role')
const StudentResults = require('../model/studentResults')


class App {

    getLogo = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode: req.session.schoolCode})
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                if(session){
                    const term = await Term.findOne({school: schoolAdmin._id, session: session._id, current: true})
                    if(term){
                        res.render('school-logo', {schoolAdmin: schoolAdmin, logo_active: 'active', opensession_active: "pcoded-trigger",
                        session_active: 'active', sessS: session.name, termS: term.name, title: 'Logo and Stamp'})
                    }else{
                        res.render('sess-term-error', {schoolAdmin: schoolAdmin,
                        logo_active: 'active', opensession_active: "pcoded-trigger",
                        session_active: 'active', success: req.flash('success'), title: 'Logo and Stamp'})
                    }
                }else{
                    res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'Logo and Stamp',
                    logo_active: 'active', opensession_active: "pcoded-trigger",
                    session_active: 'active'})
                }
            }else{
                res.redirect(303, '.school')
            }
        }catch(err){
            res.render('error-page', {error: err})
        }
    }

    postLogo = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode: req.session.schoolCode})
                FileHandler.createDirectory("./public/uploads/schools/" + req.session.schoolCode + "/logo/")
                if(req.files){
                    FileHandler.deleteFile("./public/uploads/schools/"+ req.session.schoolCode + "/logo/" + schoolAdmin.logo) 
                    FileHandler.deleteFile("./public/uploads/schools/"+ req.session.schoolCode + "/logo/" + schoolAdmin.stamp) 
                    let logoName, stampName
                    if(req.files.logo){
                        logoName = req.files.logo[0].filename
                    }else{
                        logoName = schoolAdmin.logo
                    }
                    if(req.files.stamp){
                        stampName = req.files.stamp[0].filename
                    }else{
                        stampName = schoolAdmin.stamp
                    }
                    SchoolAdmin.findByIdAndUpdate(schoolAdmin._id, {
                        logo : logoName,
                        stamp: stampName
                    }, {new : true, useFindAndModify : false}, (err , item) => {
                        if(err){
                            console.log(err)
                        }else{
                            if(req.files.logo){
                                FileHandler.moveFile(req.files.logo[0].filename , "./public/uploads/profile" , "./public/uploads/schools/" + req.session.schoolCode + "/logo/") 
                            }
                            if(req.files.stamp){
                                FileHandler.moveFile(req.files.stamp[0].filename , "./public/uploads/profile" , "./public/uploads/schools/" + req.session.schoolCode + "/logo/") 
                            }
                            req.flash('success', 'Saved successfully.')
                            res.redirect(303, '/school/logo')
                        }
                    })
                }
            }else{
                res.redirect(303, '.school')
            }
        }catch(err){
            res.render('error-page', {error: err})
        }
    }

    getRoles = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode: req.session.schoolCode})
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                if(session){
                    const term = await Term.findOne({school: schoolAdmin._id, session: session._id, current: true})
                    if(term){
                        const role1 = await Role.findOne({school: schoolAdmin._id, role: 'r-1'})
                        const role2 = await Role.findOne({school: schoolAdmin._id, role: 'r-2'})
                        res.render('school-roles', {schoolAdmin: schoolAdmin, roles_active: 'active', opensession_active: "pcoded-trigger",
                        session_active: 'active', sessS: session.name, termS: term.name, role1: role1, title: 'Roles',
                        role2: role2})
                    }else{
                        res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'Roles',
                        roles_active: 'active', opensession_active: "pcoded-trigger",
                        session_active: 'active'})
                    }
                }else{
                    res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'Roles',
                    roles_active: 'active', opensession_active: "pcoded-trigger",
                    session_active: 'active'})
                }
            }else{
                res.redirect(303, '.school')
            }
        }catch(err){
            res.render('error-page', {error: err})
        }
    }

    createRole = async (req , res , next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const role = await Role.findOne({school: schoolAdmin._id, name: req.body.name})
                if(role){
                    res.json({message: 'Name already chosen'})
                }else{
                    const newRole = await new Role({
                        school : schoolAdmin._id ,  
                        name : req.body.name, 
                        role: req.body.role 
                    })
                    const saveRole = await newRole.save()
                    if ( saveRole ) { 
                        res.json({message: 'Role has been activated'})
                    }else{
                        throw 'Unable to save this.'
                    }
                }
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error: err})
        }
    }


    getGradeComputations = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                if(session){
                    const term = await Term.findOne({session: session._id, current: true})
                    if(term){
                        const gradeCompute = await Grade.find({school: schoolAdmin._id})
                        const studentResult = await StudentResults.find({school: schoolAdmin._id, session: session._id, term: term._id})
                        console.log(gradeCompute)
                        res.render('grade-computation', {schoolAdmin: schoolAdmin, gradeCompute: gradeCompute, title: 'Grade Settings',
                        grade_active: 'active', opensession_active: "pcoded-trigger", studentResult : studentResult, 
                        sessS: session.name, termS: term.name, session_active: 'active'})
                    }else{
                        res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'Grade Settings',
                        grade_active: 'active', opensession_active: "pcoded-trigger",
                        session_active: 'active'})
                    }
                }else{
                    res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'Grade Settings',
                    grade_active: 'active', opensession_active: "pcoded-trigger",
                    session_active: 'active'})
                }
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    getExamComputations = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
            
                if(session){
                    const term = await Term.findOne({school: schoolAdmin._id, session: session._id, current: true})
                    if(term){
                        const examCompute = await ExamCompute.find({school: schoolAdmin._id, session: session._id, term: term._id})
                        const studentResult = await StudentResults.find({school: schoolAdmin._id, session: session._id, term: term._id})

                        let sum = examCompute.reduce((a, b) => a + Number(b.total), 0)
                        if(sum > 100 ){
                            req.flash()
                        }
                        
                        res.render('exam-settings', {schoolAdmin: schoolAdmin, title: 'Exam Settings', 
                        error : req.flash('error'), success : req.flash('success') , examCompute: examCompute, session_active: 'active', opensession_active: "pcoded-trigger",
                        studentResult : studentResult , ca_active: 'active', sessS: session.name, termS: term.name})
                    }else{
                        res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'Exam Settings',
                        session_active: 'active', opensession_active: "pcoded-trigger",
                        ca_active: 'active'})
                    }
                }else{
                    res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'Exam Settings',
                    session_active: 'active', opensession_active: "pcoded-trigger",
                    ca_active: 'active'})
                }
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    postExamComputations = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const{name, total} = req.body
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                const term = await Term.findOne({school: schoolAdmin._id, session: session._id, current: true})
                
                const exam = await ExamCompute.findOne({name : name})
                if(!exam){

                    const examTotal = await ExamCompute.find({school: schoolAdmin._id, session: session._id, term: term._id})
                    let sum = examTotal.reduce((a, b) => a + Number(b.total), 0)
                    let w = sum + Number(total)

                    if(!(w > 100)) {
                        
                            const examCompute = await new ExamCompute({
                                school : schoolAdmin._id,  
                                session: session._id,
                                term: term._id,
                                name : name, 
                                total : total
                            })
                            const saveCompute = await examCompute.save()
                            if ( saveCompute ) { 
                                let redirectUrl = "/school/exam-settings"
                                res.redirect(303, redirectUrl)
                                return 
                            }else{
                                throw{
                                    message : "Unable to save the school admin"
                                }
                            }
                    }else{
                        req.flash('error', 'Sum of Exam Types cannot exceed 100.')
                        let redirectUrl = "/school/exam-settings"
                        res.redirect(303, redirectUrl)
                    }   
                }else{
                    req.flash('error', 'Cannot upload an existing Exam Type')
                    let redirectUrl = "/school/exam-settings"
                    res.redirect(303, redirectUrl)
                }
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    delExamComputations = async(req, res, next) => {
        try{
            if(req.session.schoolCode) {
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                const term = await Term.findOne({school: schoolAdmin._id, session: session._id, current: true})
                let exam = await ExamCompute.findById(req.params.examComputeId)
                const studentResult = await StudentResults.find({school: schoolAdmin._id, session: session._id, term: term._id})
                if(studentResult.length == 0){
                    let delExam = await ExamCompute.findByIdAndDelete(exam._id)
                    if(delExam){
                        let redirectUrl = "/school/exam-settings"
                        res.redirect(303, redirectUrl)
                    }else{
                        throw{
                            message : "Unable to save the school admin"
                        }
                    }
                }else{
                    req.flash('error' , `You can't delete an Exam Type that is in use`)
                    let redirectUrl = "/school/exam-settings"
                    res.redirect(303, redirectUrl)
                }
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err}) 
        }
    }

    usePreviousTermExam = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode: req.session.schoolCode})
                const session = await Session.findOne({current: true, school: schoolAdmin._id})
                const term = await Term.findOne({current: true, session: session._id})
                const findTerm = await Term.findOne({session: session._id, ended: true})
                if(findTerm){
                    const examCompute = await ExamCompute.find({
                        session: session._id, term: findTerm._id
                    })
                    if(examCompute.length > 0){
                        
                        let newCompute = examCompute.map(function(e){
                            return {session : e.session, term: term._id, 
                                    name: e.name, total: e.total, school: e.school}
                        })
                        console.log(newCompute)
                        await ExamCompute.insertMany(newCompute)

                        req.flash('success', 'Settings retrieved successfully.')
                        res.redirect(303, '/school/exam-settings')
                    }else{
                        req.flash('error', 'Cannot find settings from previous term')
                        res.redirect(303, '/school/exam-settings')
                    }
                }else{
                    req.flash('error', 'Cannot find a previous term.')
                    res.redirect(303, '/school/exam-settings')
                }
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error: err})
        }
    }

    postGradeComputations = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const gradeCompute = await new Grade({
                    school : schoolAdmin._id,  
                    grade : req.body.grade, 
                    rangeLowest : req.body.lowest,
                    rangeHighest: req.body.highest
                })
                const saveGrade = await gradeCompute.save()
                if ( saveGrade ) { 
                    let redirectUrl = "/school/grade-settings"
                    res.redirect(303, redirectUrl)
                    return 
                }else{
                    throw{
                        message : "Unable to save the school admin"
                    }
                }
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    deleteGrade = async(req, res, next) => {
        try{
            if(req.session.schoolCode) {
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                let grade = await Grade.findById(req.params.gradeId)
                if(grade){
                    let delGrade = await Grade.findByIdAndRemove(grade._id)
                    if(delGrade){
                        let redirectUrl = "/school/grade-settings"
                        res.redirect(303, redirectUrl)
                    }else{
                        throw{
                            message : "Unable to save the school admin"
                        }
                    }
                }else{
                    throw{
                        message : "This grade does not exist"
                    }
                }
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err}) 
        }
    }

    getUpdateGrade = async (req, res, next) => {
        try{
            if(req.session.schoolCode) {
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({current: true, school: schoolAdmin._id})
                const term = await Term.findOne({current: true, session: session._id})
                let grade = await Grade.findByOne({term : term._id})
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