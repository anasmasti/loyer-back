const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const archiveComptabilisationLoyerSchema = new Schema({
    archive_comptabilisation_loyer: [{
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
        devises: {
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
        direction_regional: {
            type: String
        },
        point_de_vente: {
            type: String
        },
        montant: {
            type: Number
        },
        sens: {
            type: String
        },
        date_comptabilisation: {
            type: Date
        }
    }],
    mois: {
        type: String
    },
    annee: {
        type: String
    }
}, { timestamps: true })

const ArchiveComptabilisationLoyer = mongoose.model("ArchiveComptabilisationLoyer", archiveComptabilisationLoyerSchema)

module.exports = ArchiveComptabilisationLoyer