const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const loyerComptabilisationSchema = new Schema({

    nom_de_piece: {
        type: String
    },
    date_gl: {
        type: String
    },
    date_operation: {
        type: String
    },
    type: {
        type: String
    },
    origine: {
        type: String
    },
    devise: {
        type: String
    },
    description_ligne: {
        type: String
    },
    etablissement: {
        type: String
    },
    compte: {
        type: String
    },
    centre_de_cout: {
        type: String
    },
    supervision: {
        type: String
    },
    branch: {
        type: String
    },
    montant_brut: {
        type: Number
    },
    montant_net: {
        type: Number
    },
    montant_tax: {
        type: String
    },
    sens: {
        type: String
    }

})


const loyerComptabilisation = mongoose.model('loyerComptabilisation', loyerComptabilisationSchema)

module.exports = loyerComptabilisation