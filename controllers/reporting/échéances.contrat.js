const moment = require('moment');
const Contrat = require('../../models/contrat/contrat.model');
const generatePdfs = require("../helpers/shared/generate_pdfs");

module.exports = {
    echeancesContratReporting: async (req, res) => {
        let today = new Date()
        let todayAfterThreeMonths = new Date(moment(today.setMonth(today.getMonth() + 3)).format('YYYY-MM-DD[T]HH:mm:ss'))
        let date = new Date();

        await Contrat.find({
            $or: [
                { date_fin_contrat: { $gte: date, $lte: todayAfterThreeMonths } },
                { 'etat_contrat.etat.date_resiliation': { $gte: date, $lte: todayAfterThreeMonths } }
            ]
        })
            .then((data) => {
                res.json(data);
                generatePdfs.generateReportingPdf(data, 'échéances_de_contrats')
            })
            .catch((error) => {
                res.status(402).send({ message: error.message })
            })
    }
}