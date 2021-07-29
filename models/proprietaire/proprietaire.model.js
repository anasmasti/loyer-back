const mongoose = require('mongoose')
const Schema = mongoose.Schema
const uniqueValidator = require('mongoose-unique-validator')

//Mandataire Schema
const MandataireSchema = new Schema({
    cin_mandataire: {
        type: String,
    },
    nom_prenom_mandataire: {
        type: String
    },
    raison_social_mandataire: {
        type: String,
    },
    telephone_mandataire: {
        type: Number,
    },
    fax_mandataire: {
        type: Number,
    },
    adresse_mandataire: {
        type: String,
    },
    n_compte_bancaire_mandataire: {
        type: Number,
    },
});

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
    banque: {
        type: String,
        required: true
    },
    nom_agence_bancaire: {
        type: String,
    },
    deleted: {
        type: Boolean,
        default: false
    },
    has_mandataire: {
        type: Boolean,
        default: false
    },
    mandataire: {
        type: [MandataireSchema],
        index: false,
        default: null,
        required: false,
    },
},
    { timestamps: true, },
);

ProprietaireSchema.plugin(uniqueValidator);
const Proprietaire = mongoose.model('Proprietaire', ProprietaireSchema);
module.exports = Proprietaire;