const traitementCloture = require("./traitement_cloture");

module.exports = {
  clotureContratActif: (
    req,
    res,
    Contrat,
    dateGenerationDeComptabilisation,
    ContratSchema
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

      return traitementCloture.traitementClotureActif(
        req,
        res,
        Contrat,
        dateGenerationDeComptabilisation,
        periodicite,
        ContratSchema
      );
    } catch (error) {
      res.status(402).json({ messssssage: error.message });
    }
  },
};
