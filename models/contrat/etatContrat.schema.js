const mongoose = require('mongoose')
const Schema = mongoose.Schema

//contrat Schema
const EtatContratSchema = new Schema({
    intitule_lieu: {
        type: String,
    },
    reprise_caution: {
        type: String,
    },
    date_resiliation: {
        type: Date,
    },
    etat_lieu_sortie: {
        type: String,
    },
    images_etat_lieu_sortie: {
        type: String,
    },
    preavis: {
        type: String,
    },
    lettre_resiliation_pj: {
        type: String,
    },
    date_suspension: {
        type: Date,
    },
    duree_suspension: {
        type: Number,
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
});
module.exports = EtatContratSchema;