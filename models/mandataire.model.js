const mongoose = require('mongoose')
const Schema = mongoose.Schema


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

const Mandataire = mongoose.model('Mandataire', MandataireSchema)


module.exports = Mandataire