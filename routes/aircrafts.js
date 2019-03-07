const express = require('express')
const router = express.Router()
const path = require('path')
const ensureAuthenticated = require('../helpers/ensureAuthenticated')

// Bring in Manufacturer Model
let Manufacturer = require('../models/manufacturer')

// Bring in Aircraft Model
let Aircraft = require('../models/aircraft')

// Bring in Submission Model
let Submission = require('../models/submission')

// Render Aircrafts Page
router.get('/', (req, res) => {
    Aircraft.find({}, function(err, aircrafts) {
        if(err) {
            console.log(err)
            req.flash('error', 'No aircrafts were found')
            res.redirect('/')
        }
        
        let firstAircraft = aircrafts[0]

        res.render('aircrafts', { expressFlash: req.flash(), sessionFlash: res.locals.sessionFlash, aircrafts, aircraft: firstAircraft})
    })
})

// Get Current Aircraft
router.get('/model/:id', (req, res) => {
    Aircraft.findById(req.params.id, (err, aircraft) => {
        if(err) {
            console.log(err)
            req.flash('error', 'No aircraft was found with given ID')
            res.redirect('/aircrafts')
        }

        Aircraft.find({}, function(err, aircrafts) {
            if(err) {
                console.log('err')
                req.flash('error', 'No aircrafts were found')
                res.redirect('/aircrafts')
            }
            
            res.render('aircrafts', { expressFlash: req.flash(), sessionFlash: res.locals.sessionFlash, aircrafts, aircraft})
        })
    })
})

// Render Add Aircraft Spec
router.get('/add-spec/:spec_type/:aircraft_id', ensureAuthenticated, (req, res) => {
    const specType = req.params.spec_type
    const aircraftId = req.params.aircraft_id

    Aircraft.findById(aircraftId, (err, aircraft) => {
        if(err) {
            console.log('err')
            req.flash('error', 'No such spec or aircraft was found')
            res.redirect('/aircrafts')
        }

        res.render('add-spec', {xpressFlash: req.flash(), sessionFlash: res.locals.sessionFlash, specType, aircraft})
    })
})

// Add Aircraft Spec Functionality
router.post('/add-spec/:spec_type/:aircraft_id', ensureAuthenticated, (req, res) => {
    const aircraftId = req.body.aircraft_id
    const aircraftSpec = req.body.aircraft_spec
    const value = req.body.value
    const source = req.body.source
    const action = req.body.action
    const userId = req.user._id

    let newSubmission = new Submission({
        type: action,
        aircraft_spec: aircraftSpec,
        value: value,
        source: source,
        user: userId,
        aircraft: aircraftId
    })

    newSubmission.save(function(err) {
        if(err) {
            console.log(err)
            return
        } else {
            req.flash('success', 'You have submitted the request!')
            res.redirect('/aircrafts')
        }
    })
})

// Render Change Aircraft Spec
router.get('/change-spec/:spec_type/:aircraft_id', ensureAuthenticated, (req, res) => {
    const specType = req.params.spec_type
    const aircraftId = req.params.aircraft_id

    Aircraft.findById(aircraftId, (err, aircraft) => {
        if(err) {
            console.log('err')
            req.flash('error', 'No such spec or aircraft was found')
            res.redirect('/aircrafts')
        }

        const currentValue = aircraft[specType]

        res.render('change-spec', {xpressFlash: req.flash(), sessionFlash: res.locals.sessionFlash, specType, aircraft, currentValue})
    })
})

// Change Aircraft Spec Functionality
router.post('/change-spec/:spec_type/:aircraft_id', ensureAuthenticated, (req, res) => {
    const aircraftId = req.params.aircraft_id
    const aircraftSpec = req.body.aircraft_spec
    const value = req.body.new_value
    const source = req.body.source
    const action = req.body.action
    const userId = req.user._id

    let newSubmission = new Submission({
        type: action,
        aircraft_spec: aircraftSpec,
        value: value,
        source: source,
        user: userId,
        aircraft: aircraftId
    })

    newSubmission.save(function(err) {
        if(err) {
            console.log(err)
            return
        } else {
            req.flash('success', 'You have submitted the request!')
            res.redirect('/aircrafts')
        }
    })
})

// Render Remove Aircraft Spec
router.get('/remove-spec/:spec_type/:aircraft_id', ensureAuthenticated, (req, res) => {
    const specType = req.params.spec_type
    const aircraftId = req.params.aircraft_id

    Aircraft.findById(aircraftId, (err, aircraft) => {
        if(err) {
            console.log('err')
            req.flash('error', 'No such spec or aircraft was found')
            res.redirect('/aircrafts')
        }

        const currentValue = aircraft[specType]

        res.render('remove-spec', {xpressFlash: req.flash(), sessionFlash: res.locals.sessionFlash, specType, aircraft, currentValue})
    })
})

// Remove Aircraft Spec Functionality
router.post('/remove-spec/:spec_type/:aircraft_id', ensureAuthenticated, (req, res) => {
    const aircraftId = req.params.aircraft_id
    const aircraftSpec = req.body.aircraft_spec
    const value = req.body.explanation
    const source = req.body.source
    const action = req.body.action
    const userId = req.user._id

    let newSubmission = new Submission({
        type: action,
        aircraft_spec: aircraftSpec,
        value: value,
        source: source,
        user: userId,
        aircraft: aircraftId
    })

    newSubmission.save(function(err) {
        if(err) {
            console.log(err)
            return
        } else {
            req.flash('success', 'You have submitted the request!')
            res.redirect('/aircrafts')
        }
    })
})

module.exports = router