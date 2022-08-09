const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SignaletiqueSchema = new Schema({
    raison_sociale: {
        type: String,
        required: true
    },
    if: {
        type: String,
        required: true
    },
    rib:{
        type: String,
        required: true
    },
    adresse: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        required: false,
        default: false
    },
    deleted:{
        type: Boolean,
        default: false
    }
},
    { timestamps: true }
)

const Signaletique = mongoose.model('Signaletique', SignaletiqueSchema)

module.exports = Signaletique;