const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const passport = require('passport')
const ensureAuthenticated = require('../helpers/ensureAuthenticated')

// Bring in User Model
let User = require('../models/user')

// Bring in Submission Model
let Submission = require('../models/submission')

// Bring in Aircraft Model
let Aircraft = require('../models/aircraft')

// Register Form
router.get('/register', function(req, res) {
    res.render('register')
})

// Register Process
router.post('/register', function(req, res) {
    const firstName = req.body.firstName
    const lastName = req.body.lastName
    const email = req.body.email
    const username = req.body.username
    const password = req.body.password
    const repeatPassword = req.body.repeatPassword

    req.checkBody('firstName', 'First Name is required').notEmpty()
    req.checkBody('lastName', 'Last Name is required').notEmpty()
    req.checkBody('email', 'Email is required').isEmail()
    req.checkBody('username', 'Username is required').notEmpty()
    req.checkBody('password', 'Password is required').notEmpty()
    req.checkBody('repeatPassword', 'Passwords do not match').equals(req.body.password)

    let errors = req.validationErrors()

    if(errors) {
        res.render('register', {
            errors: errors
        })
    } else {
        let newUser = new User({
            first_name: firstName,
            last_name: lastName,
            email: email,
            username: username,
            password: password
        })

        bcrypt.genSalt(10, function(err, salt) { 
            bcrypt.hash(newUser.password, salt, function(err, hash) {
                if(err) {
                    console.log(err)
                }
                newUser.password = hash
                newUser.save(function(err) {
                    if(err) {
                        console.log(err)
                        return
                    } else {
                        req.flash('success', 'You are now registered and can log in')
                        res.redirect('/users/login')
                    }
                })
            })
        })
    }
})

// Login Form
router.get('/login', function(req, res) {
    res.render('login', { expressFlash: req.flash(), sessionFlash: res.locals.sessionFlash })
})

// Login Process
router.post('/login', function(req, res, next) {
    passport.authenticate('local', {
      successRedirect: '/aircrafts',
      failureRedirect:'/users/login',
      failureFlash: 'Invalid username or password',
      successFlash: 'Welcome!'
    })(req, res, next)
});

// Logout Process
router.get('/logout', function(req, res) {
    req.logout()
    req.flash('success', 'You have successfully logged out')
    res.redirect('/users/login')
})

// My-Profile Page
router.get('/my-profile', ensureAuthenticated, async(req, res) => {
    let userId = req.user._id
    
    let latestSubmissions
    let totalSubmissions
    let pendingSubmissions
    let approvedSubmissions
    let rejectedSubmissions

    let submissions = getCurrentUserSubmissions(userId).then((value) => {
        latestSubmissions = value[0].slice(0, 10)

        totalSubmissions = value[1]
        pendingSubmissions = value[2]
        approvedSubmissions = value[3]
        rejectedSubmissions = value[4]

        let submissionsStats = {
            total: totalSubmissions,
            pending: pendingSubmissions.length,
            approved: approvedSubmissions.length,
            rejected: rejectedSubmissions.length
        }
    
        res.render('my-profile', { expressFlash: req.flash(), sessionFlash: res.locals.sessionFlash, submissions: value[0], submissionsStats, latestSubmissions})
    }).catch((err) => {
        if(err) {
            console.log(err)
            res.redirect('/')
        }
    })
})

// My Profile Submissions
router.get('/my-profile/submissions', ensureAuthenticated, async(req, res) => {
    let userId = req.user._id

    let user = await User.findById(userId, (err) => {
        if(err) {
            console.log(err)
            req.flash('error', 'No user was found with the given id')
            res.redirect('/users/login')
        }
    })

    getCurrentUserSubmissions(userId).then((value) => {
        res.render('user-submissions', { expressFlash: req.flash(), sessionFlash: res.locals.sessionFlash, submissions: value[0], user})
    }).catch((err) => {
        console.log(err)
        res.redirect('/')
    })
})

// Profile Page
router.get('/profile/:id', function(req, res) {
    User.findById(req.params.id, function(err, person) {
        if(err) {
            console.log(err)
            req.flash('error', 'No user found with given ID')
            res.redirect('/')
        }
        res.render('profile', { expressFlash: req.flash(), sessionFlash: res.locals.sessionFlash, user: person})
    })
})

// Get Current User Submissions
async function getCurrentUserSubmissions(userId) {
    let submissions = await Submission.find({user: userId}, (err) => {
        if(err) {
            console.log(err)
            req.flash('error', 'No submissions created by the user were found')
            res.redirect('/')
        }
    }).sort({"date_created": -1}).lean().exec()

    let totalSubmissions = submissions.length
    let pendingSubmissions = []
    let approvedSubmissions = []
    let rejectedSubmissions = []

    for(let key in submissions) {
        let currentSubmission = submissions[key]

        submissions[key].date_created = currentSubmission.date_created.toDateString()

        let currentAircraft = submissions[key].aircraft

        let aircraft = await Aircraft.findById(currentAircraft, {"name": 1, "manufacturer_name": 1}, (err) => {
            if(err) {
                console.log(err)
                req.flash('error', 'No aircraft was found with the given id')
                res.redirect('/users/my-profile')  
            }
        })

        submissions[key].aircraft_name = aircraft.name
        submissions[key].aircraft_manufacturer = aircraft.manufacturer_name

        if(currentSubmission.status == "pending") {
            pendingSubmissions.push(currentSubmission)
        } else if(currentSubmission.status == "approved") {
            approvedSubmissions.push(currentSubmission)
        } else if(currentSubmission.status == "rejected") {
            rejectedSubmissions.push(currentSubmission)
        }
    }

    return [submissions, totalSubmissions, pendingSubmissions, approvedSubmissions, rejectedSubmissions]
}

module.exports = router