const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const archiveComptabilisationLoyerSchema = new Schema({
    comptabilisation_paiement_loyer: [],
    date_generation_de_comptabilisation: {
        type: Date
    },
    mois: {
        type:Number
    },
    annee:{
        type:Number
    }
}, { timestamps: true })

const ArchiveComptabilisationLoyer = mongoose.model("ArchiveComptabilisationLoyer", archiveComptabilisationLoyerSchema)

module.exports = ArchiveComptabilisationLoyer