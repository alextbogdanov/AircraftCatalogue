const mongoose = require('mongoose')
const Schema = mongoose.Schema

// Submission Schema
const SubmissionSchema = mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    aircraft_spec: {
        type: String,
        required: true
    },
    value: {
        type: String,
        required: true
    },
    source: {
        type: String
    },
    date_created: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        default: 'pending'
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    aircraft: {
        type: Schema.Types.ObjectId,
        ref: 'aircrafts'
    },
    approved_by: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    approved_on: {
        type: Date
    }
})

const Submission = module.exports = mongoose.model('Submission', SubmissionSchema)