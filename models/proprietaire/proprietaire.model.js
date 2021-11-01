const mongoose = require('mongoose')
const Schema = mongoose.Schema
const uniqueValidator = require('mongoose-unique-validator')

//Protrietaire Schema
const ProprietaireSchema = new Schema({

    cin: {
        type: String
    },
    passport: {
        type: String,
    },
    carte_sejour: {
        type: String,
    },
    nom_prenom: {
        type: String,
    },
    raison_social: {
        type: String,
    },
    n_registre_commerce: {
        type: String,
    },
    telephone: {
        type: Number,
    },
    fax: {
        type: Number,
    },
    adresse: {
        type: String,
    },
    n_compte_bancaire: {
        type: Number,
        unique: true,
        required: true
    },
    banque_rib: {
        type: Number,
        required: true
    },
    ville_rib: {
        type: Number,
        required: true
    },
    cle_rib: {
        type: Number,
        required: true
    },
    taux_impot: {
        type: Number,
    },
    retenue_source: {
        type: Number,
    },
    montant_apres_impot: {
        type: Number,
    },
    banque: {
        type: String,
        required: true
    },
    montant_loyer: {
        type: Number,
    },
    nom_agence_bancaire: {
        type: String,
    },
    montant_avance_proprietaire: {
        type: Number,
    },
    tax_avance_proprietaire: {
        type: Number,
    },
    tax_par_periodicite: {
        type: Number,
    },
    deleted: {
        type: Boolean,
        default: false
    },
    mandataire: {
        type: Boolean,
        default: false
    }
},
    { timestamps: true, },
);

ProprietaireSchema.plugin(uniqueValidator);
const Proprietaire = mongoose.model('Proprietaire', ProprietaireSchema);
module.exports = Proprietaire;