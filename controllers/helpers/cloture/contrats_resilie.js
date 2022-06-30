const traitementCloture = require("./traitement_cloture");

module.exports = {
  clotureContratResilie: (
    res,
    Contrat,
    dateGenerationDeComptabilisation,
    ContratSchema,
    Cloture,
    treatmentMonth,
    treatmentAnnee
  ) => {
    try {
      let periodicite;

      //traitement du periodicite Mensuelle
      if (Contrat.periodicite_paiement == "mensuelle") {
        periodicite = 1;
      }

      //traitement du periodicite trimestrielle
      if (Contrat.periodicite_paiement == "trimestrielle") {
        periodicite = 3;
      }

      //traitement pour la periodicite annuelle
      if (Contrat.periodicite_paiement == "annuelle") {
        periodicite = 12;
      }

      return traitementCloture.traitementClotureResilie(
        res,
        Contrat,
        dateGenerationDeComptabilisation,
        periodicite,
        ContratSchema,
        Cloture,
        treatmentMonth,
        treatmentAnnee
      );
    } catch (error) {
      res.status(402).json({ messssssage: error.message });
    }
  },
};
