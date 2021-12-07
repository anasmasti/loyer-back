const Contrat = require('../../models/contrat/contrat.model');
const generatePdf = require('../helpers/generatePdf')

module.exports = {
    cautionEnCoursReporting: async (req, res) => {
        await Contrat.find({ deleted: false, statut_caution: "En cours" })
            .then((data) => {
                generatePdf(data, 'cautions_en_cours')
            })
            .catch((error) => {
                res.status(404).send({ message: error.message });
            });
    },
}