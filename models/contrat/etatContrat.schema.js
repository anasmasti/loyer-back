const mongoose = require('mongoose')
const Schema = mongoose.Schema
const fileSchema = require('../shared/file.schema')

//contrat Schema
const EtatContratSchema = new Schema({
    intitule_lieu: {
        type: String,
    },
    reprise_caution: {
        type: String,
    },
    etat_caution_consomme: {
        type: String
    },
    duree_consomme: {
        type: Number
    },
    duree_a_recupere: {
        type: Number
    },
    date_resiliation: {
        type: Date,
    },
    etat_lieu_sortie: {
        type: String,
    },
    preavis: {
        type: Date,
    },
    date_suspension: {
        type: Date,
    },
    duree_suspension: {
        type: String,
    },
    motif_suspension: {
        type: String,
    },
    n_avenant: {
        type: String,
    },
    motif: {
        type: String,
    },
    montant_nouveau_loyer: {
        type: Number,
    },
    signaletique_successeur: {
        type: String,
    },
    images_etat_res_lieu_sortie: {
        type: [fileSchema],
    },
    lettre_res_piece_jointe: {
        type: [fileSchema],
    },
    piece_jointe_avenant: {
        type: [fileSchema],
    },
    deleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });
module.exports = EtatContratSchema;