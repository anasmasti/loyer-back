const { number } = require('joi')
const mongoose = require('mongoose')
const Schema = mongoose.Schema



const SchemaFoncier = new Schema({

    proprietaire: {
        type: Schema.Types.ObjectId,
        ref: "Proprietaire"
    },
    type_foncier: {
        type: String
    },
    adresse: {
        type:String
    },
    description: {
        type:String
    },
    lieu: {
        type: Schema.Types.ObjectId,
        ref: "Lieu"
    },
    assure: {
        type: Boolean
    },
    etat_du_bien: {
        type: String
    },
    ville:{
        type:String
    },
    code_postal:{
        type:String
    },
    pays: {
        type:String
    },
    montant_loyer:{
        type: Number
    },
    meuble_equipe: {
        type: Boolean
    },
    deleted: {
        type: Boolean,
        default: false
    }
})

const Foncier = mongoose.model('Foncier', SchemaFoncier)

module.exports = Foncier