const SchoolAdmin = require('../model/schoolAdmin')
const Session = require('../model/session')
const Term = require('../model/term')

class App {

    getSessionPage = async(req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.find({school : schoolAdmin._id})
                const currentS = await Session.findOne({school: schoolAdmin, current: true})
                let sessS, termS
                if(currentS){
                    sessS = currentS.name
                    const currentT = await Term.findOne({session: currentS._id, current: true})
                    if(currentT){
                        termS = currentT.name
                    }else{
                        termS = "Term not set."
                    }
                }else{
                    sessS = "Session not set."
                }
                res.render('school-sessions', {title : "Sessions", session_active : "active",
                schoolAdmin : schoolAdmin, session : session, success : req.flash('success'),
                opensession_active: "pcoded-trigger", sessT_active: 'active', sessS: sessS,
                termS: termS})
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    postSession = async(req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
    
                const {name} = req.body
                
                const session = await new Session({
                    name : name,
                    school : schoolAdmin._id,
                })
                const saveSession = await session.save()
                if ( saveSession ) { 
                    res.redirect('/school/session')
                    return 
                }else {
                    throw {
                        message : "Unable to save the exam"
                    }
                    return 
                }
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    makeCurrent = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                Session.updateMany({school : schoolAdmin._id}, {
                        current : false
                }, {new : true, useAndModify : false}, (err , item) => {
                    if(err){
                        res.status(500)
                        return
                    }else {
                        Session.findByIdAndUpdate(req.params.sessionID, {
                            current : true
                        }, {new : true, useFindAndModify : false}, (err, item) => {
                            if(err){
                                console.log(err)
                            }
                            else{
                                let redirectUrl = '/school/session'
                                res.redirect(303, redirectUrl)
                            }
                        })
                    }
                })	
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    currentTerm = async (req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                Term.updateMany({school : schoolAdmin._id}, {
                        current : false
                }, {new : true, useAndModify : false}, (err , item) => {
                    if(err){
                        res.status(500)
                        return
                    }else {
                        Term.findByIdAndUpdate(req.params.termID, {
                            current : true
                        }, {new : true, useFindAndModify : false}, (err, item) => {
                            if(err){
                                console.log(err)
                            }
                            else{
                                let redirectUrl = '/school/session/' + req.params.sessionID
                                res.redirect(303, redirectUrl)
                            }
                        })
                    }
                })	
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    getTermPage = async(req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
                const session = await Session.findOne({school : schoolAdmin._id, _id : req.params.sessionID})
                const currentS = await Session.findOne({school: schoolAdmin, current: true})
                let sessS, termS
                if(currentS){
                    sessS = currentS.name
                    const currentT = await Term.findOne({session: currentS._id, current: true})
                    if(currentT){
                        termS = currentT.name
                    }else{
                        termS = "Term not set."
                    }
                }else{
                    sessS = "Session not set."
                }
                const term = await Term.find({session : session._id})
                res.render('school-term', {title : "Term", session_active : "active",  opensession_active: "pcoded-trigger",
                schoolAdmin : schoolAdmin, term : term, session : session, 
                success : req.flash('success'), sessT_active: 'active', termS: termS,
                sessS: sessS})
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    postTerm = async(req, res, next) => {
        try{
            if(req.session.schoolCode){
                const schoolAdmin = await SchoolAdmin.findOne({schoolCode : req.session.schoolCode})
    
                const {name, startDate, endDate} = req.body
                
                const term = await new Term({
                    name : name,
                    school : schoolAdmin._id,
                    startDate : startDate,
                    endDate : endDate,
                    session : req.params.sessionID
                })
                const saveTerm = await term.save()
                if ( saveTerm ) { 
                    let redirectUrl = "/school/session/" + req.params.sessionID
                    res.redirect(303, redirectUrl)
                    return 
                }else {
                    throw {
                        message : "Unable to save the Term."
                    }
                    return 
                }
            }else{
                res.redirect(303, '/school')
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    populateTerm = async (req, res, next) => {
        const term = await Term.find({session : req.body.session})
        res.json(term)
    }

}

const returnApp = new App()

module.exports = returnApp 