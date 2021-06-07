const mongoose = require('mongoose')
const Schema = mongoose.Schema




const MandataireSchema = new Schema({
    cin: {
        type: String,
        unique: true,
    },
    nom: {
        type: String
    },
    prenom: {
        type: String
    },
    raison_social: {
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
        unique: true
    },
});


const ProtrietaireSchema = new Schema({
    cin: {
        type: String,
        unique: true,
    },
    passport: {
        type: String,
        unique: true,
    },
    carte_sejour: {
        type: String,
        unique: true,
    },
    nom: {
        type: String,
    },
    prenom: {
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
    has_mandataire: {
        type: Boolean,
        default: false
    },
    mandataire: {
        type: [MandataireSchema],
        required: false,
    },
},
    { timestamps: true, }
);

const Propietaire = mongoose.model('Propietaire', ProtrietaireSchema)


module.exports = Propietaire