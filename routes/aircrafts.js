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

// Bring in User Model
let User = require('../models/user')

// Render Aircrafts Page
router.get('/', async(req, res) => {
    let aircraft = await Aircraft.findOne({}, (err) => {
        if(err) {
            console.log(err)
            req.flash('error', 'No aircrafts were found')
            res.redirect('/')
        }
    })

    let allAircrafts = await loadSideNav()
    res.render('aircrafts', { expressFlash: req.flash(), sessionFlash: res.locals.sessionFlash, allAircrafts, aircraft})
})

// Get Current Aircraft
router.get('/model/:id', async(req, res) => {
    let aircraft = await Aircraft.findById(req.params.id, (err) => {
        if(err) {
            console.log(err)
            req.flash('error', 'No aircraft was found with the given id')
            res.redirect('/aircrafts')
        }
    })

    let allAircrafts = await loadSideNav()

    res.render('aircrafts', { expressFlash: req.flash(), sessionFlash: res.locals.sessionFlash, aircraft, allAircrafts})
})

// Render Spec Modal
router.get('/model/:id/:spec', async(req, res) => {
    const aircraftId = req.params.id
    const spec = req.params.spec

    let aircraft = await Aircraft.findById(aircraftId, (err) => {
        if(err) {
            console.log(err)
            req.flash('error', 'No aircraft was found with the given id')
            res.redirect('/aircrafts')
        }
    })

    let newestSubmissions = await Submission.find(
        {aircraft: aircraftId, aircraft_spec: spec, $or: [{type: "add-information" }, {type: "change-information"}], status: "approved"},
        (err) => {
            if(err) {
                console.log(err)
                req.flash('error', 'No spec was found with the given name or no aircraft was found')
                res.redirect('/aircrafts')
            }
        }).sort({ 'date_created' : -1 }).lean().exec()

    for(let key in newestSubmissions) {
        let userId = newestSubmissions[key].user

        let currentUser = await User.findById(userId, (err) => {
            if(err) {
                console.log(err)
                req.flash('error', 'No user was found with the given id')
                res.redirect(`/aircrafts/model/${aircraftId}`)
            }
        })

        let username = currentUser.username
        let readableDate = (newestSubmissions[key].date_created).toDateString()

        newestSubmissions[key].username = username
        newestSubmissions[key].readableDate = readableDate
    }

    let newestSubmission = newestSubmissions[0]

    let allAircrafts = await loadSideNav()

    res.render('aircrafts', { expressFlash: req.flash(), sessionFlash: res.locals.sessionFlash, aircraft, allAircrafts, newestSubmission, spec, openModal: "yes"})    
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

//  Load Side-Nav Data Function
async function loadSideNav() {
    let manufacturers = await Manufacturer.find({}, (err) => {
        if(err) {
            console.log(err)
            req.flash('error', 'No manufacturers were found')
            res.redirect('/')
        }
    })
    let allAircrafts = {}

    for(let key in manufacturers) {
        let manufacturer = manufacturers[key].name

        let manufacturerAircrafts = await Aircraft.find({manufacturer_name: manufacturer}, {name: 1, _id: 1}, (err) => {
            if(err) {
                console.log(err)
                req.flash('error', 'No aircrafts were found')
                res.redirect('/')
            }
        })

        allAircrafts[manufacturer] = manufacturerAircrafts
    }

    return allAircrafts
}

module.exports = router