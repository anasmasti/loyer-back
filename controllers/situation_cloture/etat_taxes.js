const Contrat = require("../../models/contrat/contrat.model");

module.exports = {
  etatMonsuelTaxes: async (req, res) => {
    console.log("teeeeeeest");
    await Contrat.find({
      deleted: false,
      "etat_contrat.libelle": { $in: ["Actif"] },
      validation2_DAJC: true
    })
      .populate({
        path: "foncier",
        populate: [
          { path: "proprietaire", populate: { path: "proprietaire_list" } },
          { path: "lieu.lieu" },
        ],
      })
      .then((data) => {
        // return res.json(data);
        data.forEach((contrat) => {
          let dateComptabilisation = new Date(contrat.dateComptabilisation);
          if (
            contrat.date_comptabilisation == null ||
            (dateComptabilisation.getMonth() + 1 == req.body.mois &&
              dateComptabilisation.getFullYear() == req.body.annee)
          ) {

          }
        });
        if (condition) {
        }
      });
  },
};
