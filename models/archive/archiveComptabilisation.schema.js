const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const archiveComptabilisationSchema = new Schema({
    comptabilisation_loyer_crediter: [],
    comptabilisation_loyer_debiter: [],
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

const ArchiveComptabilisation = mongoose.model("ArchiveComptabilisation", archiveComptabilisationSchema)

module.exports = ArchiveComptabilisation