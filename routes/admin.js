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
router.get('/review-submissions', async(req, res) => {
    let addSubmissions = await Submission.find({"type": "add-information", "status": "pending"}, (err) => {
        if(err) {
            console.log(err)
            req.flash('error', 'No "add submissions" were found')
            res.redirect('/admin')
        }
    }).sort({"date_created": -1}).lean().exec()

    for(let addKey in addSubmissions) {
        let currentAddSubmissionAircraft = addSubmissions[addKey].aircraft

        let addSubmissionAircraft = await Aircraft.findById(currentAddSubmissionAircraft, {name: 1}, (err, aircraft) => {
            if(err) {
                console.log(err)
                req.flash('error', 'No aircraft was found with the given ID')
                res.redirect('/admin')
            }
            
            addSubmissions[addKey].aircraft_name = aircraft.name
        })
    }

    let changeSubmittions = await Submission.find({"type": "change-information", "status": "pending"}, (err) => {
        if(err) {
            console.log(err)
            req.flash('error', 'No "change submissions" were found')
            res.redirect('/admin')
        }
    }).sort({"date_created": -1}).lean().exec()

    for(let addKey in changeSubmittions) {
        let currentChangeSubmissionAircraft = changeSubmittions[addKey].aircraft

        let changeSubmissionAircraft = await Aircraft.findById(currentChangeSubmissionAircraft, {name: 1}, (err, aircraft) => {
            if(err) {
                console.log(err)
                req.flash('error', 'No aircraft was found with the given ID')
                res.redirect('/admin')
            }
            
            changeSubmittions[addKey].aircraft_name = aircraft.name
        })
    }

    let removeSubmittions = await Submission.find({"type": "remove-information", "status": "pending"}, (err) => {
        if(err) {
            console.log(err)
            req.flash('error', 'No "remove submissions" were found')
            res.redirect('/admin')
        }
    }).sort({"date_created": -1}).lean().exec()

    for(let addKey in removeSubmittions) {
        let currentRemoveSubmissionAircraft = removeSubmittions[addKey].aircraft

        let changeSubmissionAircraft = await Aircraft.findById(currentRemoveSubmissionAircraft, {name: 1}, (err, aircraft) => {
            if(err) {
                console.log(err)
                req.flash('error', 'No aircraft was found with the given ID')
                res.redirect('/admin')
            }
            
            removeSubmittions[addKey].aircraft_name = aircraft.name
        })
    }

    res.render('review-submissions', {addSubmissions, changeSubmittions, removeSubmittions})
})

// Render All Add Submissions
router.get('/add-submissions', async(req, res) => {
    let submissionType = "add-information"

    renderAllSubmissions(submissionType).then((value) => {
        let submissions = value

        res.render('all-submissions', { expressFlash: req.flash(), sessionFlash: res.locals.sessionFlash, submissions, submissionType })
    })
})

// Render Add Submission Form
router.get('/add-submissions/:id', ensureAuthenticated, async(req, res) => {
    let submissionId = req.params.id
    let submissionType = 'add-submission'

    renderSubmissionReviewForm(submissionId).then((value) => {
        let submission = value[0]
        let aircraftName = value[1]
        let currentValue = value[2]

        res.render('submission', {submission, submissionType, aircraftName, currentValue})
    })
})

// Add Submission Functionality
router.post('/add-submission/:id', ensureAuthenticated, async(req, res) => {
    let submissionId = req.body.submission_id
    let aircraftId = req.body.aircraft_id
    let aircraftSpec = req.body.aircraft_spec
    let value = req.body.value
    let action = req.body.action

    submissionReview(submissionId, aircraftId, aircraftSpec, value, action).then((value) => {
        if(value == "approve") {
            res.redirect(`/aircrafts/model/${aircraftId}`)
        } else {
            res.redirect('/admin/review-submissions')
        }
    })
})

// Render All Change Submissions
router.get('/change-submissions', async(req, res) => {
    let submissionType = "change-information"

    renderAllSubmissions(submissionType).then((value) => {
        let submissions = value

        res.render('all-submissions', { expressFlash: req.flash(), sessionFlash: res.locals.sessionFlash, submissions, submissionType })
    })
})


// Render Change Submission Form
router.get('/change-submissions/:id', ensureAuthenticated, async(req, res) => {
    let submissionId = req.params.id
    let submissionType = 'change-submission'

    renderSubmissionReviewForm(submissionId).then((value) => {
        let submission = value[0]
        let aircraftName = value[1]
        let currentValue = value[2]

        res.render('submission', {submission, submissionType, aircraftName, currentValue})
    })
})

// Change Submission Functionality
router.post('/change-submission/:id', ensureAuthenticated, async(req, res) => {
    let submissionId = req.body.submission_id
    let aircraftId = req.body.aircraft_id
    let aircraftSpec = req.body.aircraft_spec
    let value = req.body.value
    let action = req.body.action

    submissionReview(submissionId, aircraftId, aircraftSpec, value, action).then((value) => {
        if(value == "approve") {
            res.redirect(`/aircrafts/model/${aircraftId}`)
        } else {
            res.redirect('/admin/review-submissions')
        }
    })
})

// Render All Remove Submissions
router.get('/remove-submissions', async(req, res) => {
    let submissionType = "remove-information"

    renderAllSubmissions(submissionType).then((value) => {
        let submissions = value

        res.render('all-submissions', { expressFlash: req.flash(), sessionFlash: res.locals.sessionFlash, submissions, submissionType })
    })
})


// Render Remove Submission Form
router.get('/remove-submissions/:id', ensureAuthenticated, async(req, res) => {
    let submissionId = req.params.id
    let submissionType = 'remove-submission'

    renderSubmissionReviewForm(submissionId).then((value) => {
        let submission = value[0]
        let aircraftName = value[1]
        let currentValue = value[2]

        res.render('submission', {submission, submissionType, aircraftName, currentValue})
    })
})

// Remove Submission Functionality
router.post('/remove-submission/:id', ensureAuthenticated, async(req, res) => {
    let submissionId = req.body.submission_id
    let aircraftId = req.body.aircraft_id
    let aircraftSpec = req.body.aircraft_spec
    let value = ""
    let action = req.body.action

    submissionReview(submissionId, aircraftId, aircraftSpec, value, action).then((value) => {
        if(value == "approve") {
            res.redirect(`/aircrafts/model/${aircraftId}`)
        } else {
            res.redirect('/admin/review-submissions')
        }
    })
})

// Submission Review Functionality Function
async function submissionReview(submissionId, aircraftId, aircraftSpec, value, action) {
    let result

    if(action == "approve") {
        let newAircraft = {}
        newAircraft[aircraftSpec] = value

        await Aircraft.updateOne({_id: aircraftId}, newAircraft, function(err, numberAffected, rawResponse) {
            if(err) {
                console.log(err)
            }
        })

        await Submission.updateOne({_id: submissionId}, {
            status: 'approved'
        }, function(err, numberAffected, rawResponse) {
            if(err) {
                console.log(err)
            }
        })

        result = "approve"
    } else if(action == "view") {
        result = "view"
    } else if(action == "reject") {

        await Submission.updateOne({_id: submissionId}, {
            status: 'rejected'
        }, function(err, numberAffected, rawResponse) {
            if(err) {
                console.log(err)
            }
        })

        result = "reject"
    }
    return result
}

// Render Submission Form Function
async function renderSubmissionReviewForm(submissionId) {
    let submission = await Submission.findById(submissionId, (err) => {
        if(err) {
            console.log(err)
            req.flash('error', 'No submission was found with the given id')
            res.redirect('/admin')
        }
    })

    let aircraft = await Aircraft.findById(submission.aircraft, (err) => {
        if(err) {
            console.log(err)
            req.flash('error', 'No aircraft was found with the given id')
            res.redirect('/admin')
        }
    })

    let currentValue = aircraft[submission.aircraft_spec]
    let aircraftName = aircraft.name

    return [submission, aircraftName, currentValue]
}

// Render All Submissions
async function renderAllSubmissions(submissionType) {
    let submissions = await Submission.find({type: submissionType}, (err) => {
        if(err) {
            console.log(err)
            req.flash('error', 'No "add-information" submissions were found')
            res.redirect('/admin/review-submissions')
        }
    }).sort({"date_created": -1}).lean().exec()

    for(let key in submissions) {
        let aircraftId = submissions[key].aircraft

        let aircraftName = await Aircraft.findById(aircraftId, {name: 1}, (err) => {
            if(err) {
                console.log(err)
                req.flash('error', 'No aircraft was found with the given ID')
                res.redirect('/admin/review-submissions')
            }
        })

        submissions[key].aircraft_name = aircraftName.name
    }

    return submissions
}

module.exports = router