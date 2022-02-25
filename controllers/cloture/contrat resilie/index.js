// const Contrat = require("../../../models/Contrat/Contrat.model");
// const ordreVirementArchive = require("../../../models/archive/archiveVirement.schema");
// const archiveComptabilisation = require("../../../models/archive/archiveComptabilisation.schema");
// const { required } = require("joi");
const traitementCloture = require("../../helpers/traitement_cloture");
// const traitementMensuelle = require("./mensuelle");
// const traitementTrimestrielle = require("./mensuelle");
// const traitementAnnuelle = require("./mensuelle");

module.exports = {
  clotureContratResilie: (
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

      return traitementCloture.traitementClotureResilie(
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
