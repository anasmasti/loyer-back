const moment = require('moment');
const Contrat = require('../../models/contrat/contrat.model');
const generatePdf = require('../helpers/generatePdf')


module.exports = {
    repriseCaurionReporting: async (req , res) => {
        await Contrat.find({})
        .then()
    }
}