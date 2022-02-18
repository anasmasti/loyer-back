const Contrat = require("../../../models/contrat/contrat.model");
const ordreVirementArchive = require("../../../models/archive/archiveVirement.schema");
const archiveComptabilisation = require("../../../models/archive/archiveComptabilisation.schema");
const { required } = require("joi");
const traitementCloture = require("./cloture_traitement")
const traitementMensuelle = require("./mensuelle")
const traitementTrimestrielle = require("./mensuelle")
const traitementAnnuelle = require("./mensuelle")

module.exports = {
  clotureContratActif: async (req, res, Contrat ) => {
    try {
          //traitement du periodicite Mensuelle
          if (contrat[i].periodicite_paiement == "mensuelle") {
            traitementCloture.traitementCloture(req, res, Contrat, 1)
          }

          //traitement du periodicite trimestrielle
          if (contrat[i].periodicite_paiement == "trimestrielle") {
            traitementCloture.traitementCloture(req, res, Contrat, 3)
          }
          
          //traitement pour la periodicite annuelle
          if (contrat[i].periodicite_paiement == "annuelle") {
            
          }

    } catch (error) {
      res.status(402).json({ message: error.message })
    }
  },
};
