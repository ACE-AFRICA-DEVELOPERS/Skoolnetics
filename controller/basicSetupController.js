const SchoolAdmin = require('../model/schoolAdmin')
const Session = require('../model/session')
const Term = require('../model/term')
const ExamCompute = require('../model/exam-settings')
const Grade = require('../model/grade')

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
                        session_active: 'active', sessS: session.name, termS: term.name})
                    }else{
                        res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'Logo and Stamp',
                        logo_active: 'active', opensession_active: "pcoded-trigger",
                        session_active: 'active'})
                    }
                }else{
                    res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'Exam Settings',
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
                res.render('school-logo', {schoolAdmin: schoolAdmin})
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
                        res.render('school-roles', {schoolAdmin: schoolAdmin, roles_active: 'active', opensession_active: "pcoded-trigger",
                        session_active: 'active', sessS: session.name, termS: term.name})
                    }else{
                        res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'Logo and Stamp',
                        roles_active: 'active', opensession_active: "pcoded-trigger",
                        session_active: 'active'})
                    }
                }else{
                    res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'Exam Settings',
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

    postRoles = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode: req.session.schoolCode})
                res.render('school-logo', {schoolAdmin: schoolAdmin})
            }else{
                res.redirect(303, '.school')
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
                        const gradeCompute = await Grade.find({school: schoolAdmin._id, session: session._id, term: term._id})
                        res.render('grade-computation', {schoolAdmin: schoolAdmin, gradeCompute: gradeCompute, title: 'Grade Settings',
                        grade_active: 'active', opensession_active: "pcoded-trigger",
                        sessS: session.name, termS: term.name, session_active: 'active'})
                    }else{
                        res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'Exam Settings',
                        grade_active: 'active', opensession_active: "pcoded-trigger",
                        session_active: 'active'})
                    }
                }else{
                    res.render('sess-term-error', {schoolAdmin: schoolAdmin, title: 'Exam Settings',
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
                        res.render('exam-settings', {schoolAdmin: schoolAdmin, title: 'Exam Settings', 
                        examCompute: examCompute, session_active: 'active', opensession_active: "pcoded-trigger",
                        ca_active: 'active', sessS: session.name, termS: term.name})
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
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                const term = await Term.findOne({school: schoolAdmin._id, session: session._id, current: true})
                const examCompute = await new ExamCompute({
                    school : schoolAdmin._id,  
                    session: session._id,
                    term: term._id,
                    name : req.body.name, 
                    total : req.body.total
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
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    postGradeComputations = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({school: schoolAdmin._id, current: true})
                const term = await Term.findOne({school: schoolAdmin._id, session: session._id, current: true})
                const gradeCompute = await new Grade({
                    school : schoolAdmin._id,  
                    session: session._id,
                    term: term._id,
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

}

const returnApp = new App()

module.exports = returnApp 