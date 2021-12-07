const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const reportingSchema = new Schema({
    reporting_paths:[],
    mois:{
        type:Number
    },
    annee: {
        type:Number
    }
})

const Reporting = mongoose.model('Reporting', reportingSchema);

module.exports = Reporting;