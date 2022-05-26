const traitementCloture = require("./traitement_cloture");
const clotureHelper = require("./cloture");

module.exports = {
  clotureContratActif: (
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

      // let date_premier_pai = {
      //   month: new Date(Contrat.date_premier_paiement).getMonth() + 1,
      //   year: new Date(Contrat.date_premier_paiement).getFullYear(),
      // };

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

      if (Contrat.is_late) {
        return clotureHelper.lateContratTreatment(
          res,
          Contrat,
          dateGenerationDeComptabilisation,
          periodicite,
          ContratSchema,
          Cloture,
          treatmentMonth,
          treatmentAnnee
        );
      } else {
        return traitementCloture.traitementClotureActif(
          res,
          Contrat,
          dateGenerationDeComptabilisation,
          periodicite,
          ContratSchema,
          Cloture,
          treatmentMonth,
          treatmentAnnee
        );
      }
    } catch (error) {
      res.status(402).json({ messssssage: error.message });
    }
  },
};
