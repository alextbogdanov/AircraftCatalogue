const mongoose = require('mongoose')
const Schema = mongoose.Schema

// Aircraft Schema
const AircraftSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    manufacturer_name: {
        type: String,
        required: true
    },
    family: {
        type: String,
        default: ""
    },
    type: {
        type: String,
        default: ""
    },
    iata_code: {
        type: String,
        default: ""
    },
    first_flight: {
        type: String,
        default: ""
    },
    first_delivery: {
        type: String,
        default: ""
    },
    unit_cost: {
        type: String,
        default: ""
    },
    max_capacity: {
        type: String,
        default: ""
    },
    cockpit_crew: {
        type: String,
        default: ""
    },
    length: {
        type: String,
        default: ""
    },
    height: {
        type: String,
        default: ""
    },
    wingspan: {
        type: String,
        default: ""
    },
    wing_area: {
        type: String,
        default: ""
    },
    cabin_width: {
        type: String,
        default: ""
    },
    fuselage_width: {
        type: String,
        default: ""
    },
    maximum_speed: {
        type: String,
        default: ""
    },
    cruise_speed: {
        type: String,
        default: ""
    },
    engines: {
        type: String,
        default: ""
    },
    max_range: {
        type: String,
        default: ""
    },
    max_range_with_max_payload: {
        type: String,
        default: ""
    },
    operating_empty_weight: {
        type: String,
        default: ""
    },
    maximum_payload: {
        type: String,
        default: ""
    },
    maximum_takeoff_weight: {
        type: String,
        default: ""
    },
    maximum_landing_weight: {
        type: String,
        default: ""
    },
    standard_fuel_capacity: {
        type: String,
        default: ""
    },
    manufacturer_id: {
        type: Schema.Types.ObjectId,
        ref: 'manufacturers'
    }
})

const Aircraft = module.exports = mongoose.model('Aircraft', AircraftSchema)