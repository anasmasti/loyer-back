const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const archiveComptabilisationCautionSchema = new Schema({
    archiveComptabilisationCaution: [{
        type: String
    }],
    mois:{
        type:String
    },
    annee:{
        type:String
    }
},{timestamps: true})

const ArchiveComptabilisationCaution = mongoose.model("ArchiveComtabilisationCaution", archiveComptabilisationCautionSchema)

module.exports = ArchiveComptabilisationCaution