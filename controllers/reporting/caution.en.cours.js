const Contrat = require('../../models/contrat/contrat.model');
const generatePdf = require('../../controllers/reporting/generatePdf')

module.exports = {
    cautionEnCoursReporting: async (req, res) => {
        await Contrat.find({ deleted: false, statut_caution: "En cours" })
            .then((data) => {
                generatePdf(data, 'cautions en cours')
            })
            .catch((error) => {
                res.status(404).send({ message: error.message });
            });
    },
}