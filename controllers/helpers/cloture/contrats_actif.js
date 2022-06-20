const traitementCloture = require("./traitement_cloture");

module.exports = {
  clotureContratActif: (
    res,
    Contrat,
    dateGenerationDeComptabilisation,
    ContratSchema,
    Cloture,
    treatmentMonth,
    treatmentAnnee,
    isOverdued,
    calculCaution
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

      // if (Contrat.is_overdued) {
      //   return checkContrats.lateContratTreatment(
      //     res,
      //     Contrat,
      //     dateGenerationDeComptabilisation,
      //     periodicite,
      //     ContratSchema,
      //     Cloture,
      //     treatmentMonth,
      //     treatmentAnnee
      //   );
      // } else {
      return traitementCloture.traitementClotureActif(
        res,
        Contrat,
        dateGenerationDeComptabilisation,
        periodicite,
        ContratSchema,
        Cloture,
        treatmentMonth,
        treatmentAnnee,
        isOverdued,
        calculCaution
      );
      // }
    } catch (error) {
      res.status(402).json({ messssssage: error.message });
    }
  },
};
