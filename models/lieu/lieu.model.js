const mongoose = require('mongoose')
const Schema = mongoose.Schema
const fileSchema = require('../shared/file.schema')
const amenagementSchema = require('./amenagement.schema')
const directeurRegional = require('./directeur.schema')


const lieuSchema = new Schema({
    code_lieu: {
        type: String,
    },
    intitule_lieu: {
        type: String,
    },
    intitule_DR: {
        type: String
    },
    adresse: {
        type: String
    },
    ville: {
        type: String
    },
    code_localite: {
        type: String
    },
    desc_lieu_entrer: {
        type: String
    },
    imgs_lieu_entrer: {
        type: [fileSchema]
    },
    has_amenagements: {
        type: Boolean,
        default: false
    },
    superficie: {
        type: String
    },
    telephone: {
        type: String
    },
    fax: {
        type: String,
    },
    etage: {
        type: String
    },
    type_lieu: {
        type: String
    },
    code_rattache_DR: {
        type: String
    },
    code_rattache_SUP: {
        type: String
    },
    amenagement: {
        type: [amenagementSchema]
    },
    intitule_rattache_SUP_PV: {
        type: String
    },
    centre_cout_siege: {
        type: String
    },
    categorie_pointVente: {
        type: String
    },
    etat_logement_fonction: {
        type: String
    },
    directeur_regional: {
        type: [directeurRegional]
    },
    deleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

const Lieu = mongoose.model('Lieu', lieuSchema)

module.exports = Lieu