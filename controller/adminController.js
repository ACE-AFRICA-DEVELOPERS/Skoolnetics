'use strict' 

const bcrypt = require('bcryptjs')
const FileHandler = require('./file')
const GenerateAccount = require('./accountGenerator')
const Admin = require('../model/admin')
const SchoolAdmin = require('../model/schoolAdmin')
const Subject = require('../model/subject')

class App {

    getAdminPage = async (req, res, next) => {
        const admin = await Admin.find({})
        if(admin.length > 0){
            res.render('admin', {title : "Admin Portal"})
        }else{
            res.redirect('/202007/admin/new')
        }
    }

    getNewAdmin = async (req, res, next) => {
        const admin = await Admin.find({})
        if(admin.length == 0){
            res.render('admin-signup', {title : "Admin Portal"})
        }else{
            res.redirect('/202007/admin')
        }
    }

    postAdmin = async (req , res , next) => { 
        try {
            let admin = await Admin.findOne({email: req.body.email})
            if(admin){
                let validAdmin = await bcrypt.compare(req.body.password , admin.password)
                if(validAdmin){
                    req.session.adminEmail = admin.email
                    res.redirect('/admin/dashboard')
                }else{
                    res.render('admin' , {error : "Invalid Credentials"}) 
                    return
                }
            }else{
                res.render('admin' , {error : "Invalid Credentials"}) 
                return 
            }  
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    postNewAdmin = async (req , res , next) => { 
        try{
            const {email, password, c_password} = req.body
            if(password != c_password){
                res.render('admin-signup', {title: 'Admin Portal', message: 'Passwords does not match.'})
                return
            }
            const adminPass = await bcrypt.hash(password , 10)
            const admin = await new Admin({
                email: email,
                password: adminPass
            })
            const saveAdmin = await admin.save()
            if ( saveAdmin ) { 
                res.redirect(303, '/202007/admin')
            }else{
                throw{
                    message : "Unable to save the admin"
                }
            }
        }catch(err){
            res.render('error-page', {error : err})
        }
    }

    getAdminDashboard = async (req , res , next) => {
        if(req.session.adminEmail){
            try{
                const validAdmin = await Admin.findOne({email : req.session.adminEmail})
                if(validAdmin){
                    const newSchools = await SchoolAdmin.find({approved : false})
                    const approvedSchools = await SchoolAdmin.find({approved : true})
                    res.render('adminDashboard', {admin : validAdmin, title : "Dashboard", newSchools : newSchools.length, 
                        approvedSchools : approvedSchools.length, dash_active : "active"})
                }else{
                    throw{
                        message: "Session not found or expired"
                    }
                }
            }catch(err){
                res.json(err.message)
            }
        }else{
            res.redirect(303, '/202007/admin')
        }
    }

    getNewSchool = async (req , res , next) => {
        if(req.session.adminEmail){
            try{
                const validAdmin = await Admin.findOne({email : req.session.adminEmail})
                const newSchools = await SchoolAdmin.find({approved : false})
                    
                res.render('admin-new-schools', {admin : validAdmin, title : "New Schools", 
                newSchools : newSchools, new_active : "active"})
                
            }catch(err){
                res.json(err.message)
            }
        }else{
            res.redirect(303, '/202007/admin')
        }
    }

    getApprovedSchool = async (req , res , next) => {
        if(req.session.adminEmail){
            try{
                const validAdmin = await Admin.findOne({email : req.session.adminEmail})
                const approvedSchools = await SchoolAdmin.find({approved : true})

                res.render('admin-approved-schools', {admin : validAdmin, title : "Approved Schools", 
                approvedSchools : approvedSchools, approved_active : "active"})
                    
            }catch(err){
                res.json(err.message)
            }
        }else{
            res.redirect(303, '/202007/admin')
        }
    }

    getSingleSchool = async (req , res , next) => {
        if(req.session.adminEmail){
            try{
                if(req.params.schoolID){
                    const validAdmin = await Admin.findOne({email : req.session.adminEmail})
                    const school = await SchoolAdmin.findOne({_id : req.params.schoolID})
                    res.render('single-school', {admin : validAdmin, title : school.schoolName, 
                        school : school, success : req.flash('success')})
                }else{
                    throw{
                        message: "You can't access this page."
                    }
                }
            }catch(err){
                res.json({message : err.message})
            }
        }else{
            res.redirect(303, '/202007/admin')
        }
    }

    approveSchool = async (req, res, next) => {
        if(req.session.adminEmail){
            try{
                const totalSchool = await SchoolAdmin.find({approved : true})
                const code = GenerateAccount(totalSchool, "001", "schoolCode", 1, 3)
                SchoolAdmin.findByIdAndUpdate(req.params.schoolID , {
                    approved : true, schoolCode : code
                } ,{new : true, useAndModify : false}, (err , item) => {
                    if(err){
                        res.status(500)
                        return
                    }else{
                        FileHandler.createDirectory("./public/uploads/schools/" + code)

                        let subjects = new Subject({
                            school : req.params.schoolID,
                            subjects : [
                                "English Language", "Mathematics", "Quantitative Reasoning", "Verbal Reasoning",
                                "Basic Science", "Basic Technology", "History", "Yoruba Language", "French",
                                "Cultural and creative art", "Business Studies", "Home Economics", "Economics",
                                "Physical Health Education", "Christian Religious Studies", "Agricultural Science",
                                "Social Studies", "Literature in English", "Computer Studies", "Civic Education",
                                "Physics", "Chemistry", "Biology", "Techincal Drawing", "Marketing", "Further Mathematics",
                                "Commerce", "Government"
                            ]
                        })
                        subjects.save()

                        req.flash('success', "You have approved this account. School is now free to login.")
                        let redirectUrl = '/admin/school/' + req.params.schoolID 
                        res.redirect(303, redirectUrl)
                    }
                })
            }catch(err){
                res.send(err)
            }
        }else{
            res.redirect(303, '/202007/admin')
        }
    }

    getAdminLogout = (req , res , next ) => {
        try {
            if (req.session.adminEmail) {
                delete req.session.adminEmail 
                res.redirect(303 , '/202007/admin')
            }else {
                throw new Error("Problem signing out. We will handle this shortly")
            }
        }catch(error) {
            res.status(400).send(error)
        }
    }
    
}


const returnApp = new App()

module.exports = returnApp 