const mongoose = require('mongoose')

// User Schema
const UserSchema = mongoose.Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        default: 'user'
    },
    rank: {
        type: String,
        required: true,
        default: 'passenger'
    },
    favorite_aircraft: {
        type: String
    }
})

const User = module.exports = mongoose.model('User', UserSchema)