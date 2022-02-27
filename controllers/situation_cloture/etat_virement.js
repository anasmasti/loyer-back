const etatVirement = require("../../models/situation_cloture/etatVirement.schema");
const generatePdf = require("../helpers/generateSituationPdf");

module.exports = {
  etatMonsuelVirement: async (req, res) => {
    await etatVirement
      .find({
        mois: req.body.mois,
        annee: req.body.annee,
      })
      .then((data) => {
        res.json(data);
        generatePdf(data, "etat_virement");
      })
      .catch((error) => {
        res.status(402).json({ message: error.message });
      });
  },
};
