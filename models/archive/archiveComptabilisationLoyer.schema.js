const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const archiveComptabilisationLoyerSchema = new Schema({
    archiveComptabilisationLoyer: [{
        type: String
    }],
    mois:{
        type:String
    },
    annee:{
        type:String
    }
},{timestamps: true})

const ArchiveComptabilisationLoyer = mongoose.model("ArchiveComptabilisationLoyer", archiveComptabilisationLoyerSchema)

module.exports = ArchiveComptabilisationLoyer