const mongoose = require('mongoose')
const Schema = mongoose.Schema

const directeurRegionalSchema = new Schema({
    matricule: {
        type: String
    },
    nom: {
        type: String
    },
    prenom: {
        type: String
    },
    deleted_directeur: {
        type: Boolean,
        default: false
    }
})

module.exports = directeurRegionalSchema;