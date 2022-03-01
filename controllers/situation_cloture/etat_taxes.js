const etatTaxes = require("../../models/situation_cloture/etatTaxes.schema");
const generatePdf = require("../helpers/cloture/generateSituationPdf");

module.exports = {
  etatMonsuelTaxes: async (req, res) => {
    await etatTaxes
      .find({
        mois: req.body.mois,
        annee: req.body.annee,
      })
      .then((data) => {
        if (data.length > 0) {
          res.json(data);
          generatePdf(data, "état_taxes");
        } else res.status(402).json({ message: "Empty data" });
      })
      .catch((error) => {
        res.status(402).json({ message: error.message });
      });
  },
};
