const express = require('express')
const router = express.Router()
const ensureAuthenticated = require('../helpers/ensureAuthenticated')

// Bring in Manufacturer Model
let Manufacturer = require('../models/manufacturer')

// Bring in Aircraft Model
let Aircraft = require('../models/aircraft')

// Bring in Submission Model
let Submission = require('../models/submission')

router.get('/', ensureAuthenticated, (req, res) => {
    res.render('admin', { expressFlash: req.flash(), sessionFlash: res.locals.sessionFlash })
})

// Render Add Manufacturer Form
router.get('/add-manufacturer', ensureAuthenticated, (req, res) => {
    res.render('add-manufacturer', { expressFlash: req.flash(), sessionFlash: res.locals.sessionFlash })
})

// Add Manufacturer
router.post('/add-manufacturer', ensureAuthenticated, (req, res) => {
    const name = req.body.name

    req.checkBody('name', 'Manufacturer Name is required').notEmpty()

    let errors = req.validationErrors()

    if(errors) {
        res.render('admin', {
            errors: errors
        })
    } else {
        let newManufacturer = new Manufacturer({
            name: name
        })

        newManufacturer.save(function(err) {
            if(err) {
                console.log(err)
                return
            } else {
                req.flash('success', 'You have added another manufacturer')
                res.redirect('/aircrafts')
            }
        })
    }
})

// Render Add Aircraft Form
router.get('/add-aircraft', ensureAuthenticated, (req, res) => {
    Manufacturer.find({}, (err, manufacturers) => {
        if(err) {
            console.log(err)
            req.flash('error', 'You must add a manufacturer first')
            res.redirect('/admin/add-manufacturer')
        }
        res.render('add-aircraft', {manufacturers: manufacturers})
    })
})

// Add Aircraft
router.post('/add-aircraft', ensureAuthenticated, (req, res) => {
    const aircraftName = req.body.aircraft
    const manufacturerName = req.body.manufacturer

    req.checkBody('aircraft', 'Aircraft Name is required').notEmpty()
    req.checkBody('manufacturer', 'Manufacturer Name is required').notEmpty()

    let errors = req.validationErrors()

    if(errors) {
        console.log(errors)
        res.render('admin', {
            errors: errors
        })
    } else {
        let manufacturerId

        Manufacturer.findOne({"name": manufacturerName}, (err, manufacturer) => {
            if(err) {
                console.log(err)
                req.flash('error', 'An error occured, please try again')
                res.redirect('/admin')
            }
            manufacturerId = manufacturer._id
        })

        let newAircraft = new Aircraft({
            name: aircraftName,
            manufacturer_name: manufacturerName,
            manufacturer_id: manufacturerId
        })

        newAircraft.save(function(err) {
            if(err) {
                console.log(err)
                return
            } else {
                req.flash('success', 'You have added another aircraft')
                res.redirect('/aircrafts')
            }
        })
    }
})

// Render Review Submitions
router.get('/review-submissions', (req, res) => {
    Submission.find({"type": "add-information"}, (err, addSubmissions) => {
        if(err) {
            console.log(err)
            req.flash('error', 'An error occured, please try again')
            res.redirect('/admin')
        }

        Submission.find({"type": "change-information"}, (err, changeSubmittions) => {
            if(err) {
                console.log(err)
                req.flash('error', 'An error occured, please try again')
                res.redirect('/admin')
            }

            Submission.find({"type": "remove-information"}, (err, removeSubmittions) => {
                if(err) {
                    console.log(err)
                    req.flash('error', 'An error occured, please try again')
                    res.redirect('/admin')
                }

                res.render('review-submissions', {addSubmissions, changeSubmittions, removeSubmittions})
            })
        })
    })
})

module.exports = router