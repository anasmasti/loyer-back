const Contrat = require("../../models/contrat/contrat.model");
const generatePdfs = require("../helpers/shared/generate_pdfs");

module.exports = {
  cautionEnCoursReporting: async (req, res) => {
    await Contrat.find({ deleted: false, statut_caution: "En cours" })
      .then((data) => {
        res.json(data);
        generatePdfs.generateReportingPdf(data, "cautions_en_cours");
      })
      .catch((error) => {
        res.status(404).send({ message: error.message });
      });
  },
};
