const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const archiveVirementSchema = new Schema({
    ordre_virement: [],
    date_generation_de_virement: {
        type: Date
    },
     mois:{
        type:Number
    },
    annee:{
        type:Number
    }
},{timestamps: true})

const ArchiveVirement = mongoose.model("ArchiveVirement", archiveVirementSchema)

module.exports = ArchiveVirement