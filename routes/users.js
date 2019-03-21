const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const passport = require('passport')
const ensureAuthenticated = require('../helpers/ensureAuthenticated')

// Bring in User Model
let User = require('../models/user')

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
router.get('/my-profile', ensureAuthenticated, function(req, res) {
    res.render('my-profile', { expressFlash: req.flash(), sessionFlash: res.locals.sessionFlash})
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

module.exports = router