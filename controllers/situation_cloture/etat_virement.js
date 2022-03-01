const etatVirement = require("../../models/situation_cloture/etatVirement.schema");
const generatePdf = require("../helpers/cloture/generateSituationPdf");

module.exports = {
  etatMonsuelVirement: async (req, res) => {
    await etatVirement
      .find({
        mois: req.body.mois,
        annee: req.body.annee,
      })
      .then((data) => {
        if (data.length > 0) {
          res.json(data);
          generatePdf(data, "état_virements");
        }
        else
          res.status(402).json({ message: "Empty data" });

      })
      .catch((error) => {
        res.status(402).json({ message: error.message });
      });
  },
};
