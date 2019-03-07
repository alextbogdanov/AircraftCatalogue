const mongoose = require('mongoose')

// Manufacturer Schema
const ManufacturerSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    }
})

const Manufacturer = module.exports = mongoose.model('Manufacturer', ManufacturerSchema)