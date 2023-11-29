const mongoose  = require('mongoose')
const Schema    = mongoose.Schema
const userSchema = new Schema({
    userName : {
        type: String,
        required: true,
        trim: true,
        default: null
    },
    password : {
        type: String,
        required: false,
        trim: true,
        minlength: 8,
        default: null
    },
    email : {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        default: null
    },
    phone : {
        type: String,
        required: false,
        maxlength: 11,
        default: null
    },
    tokens : [{
        type: String,
        required: true,
        default: null
    }],
    accountId: {
        type: String,
        required: false,
      },
    provider : {
        type: String,
        default: null
    }
    },
)


const User = mongoose.model('User', userSchema)
module.exports = User

