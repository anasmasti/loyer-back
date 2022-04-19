const Contrat = require("../../../models/contrat/contrat.model");
const User = require("../../../models/roles/roles.model");
const Proprietaire = require("../../../models/proprietaire/proprietaire.model");
const mail = require("../../../helpers/mail.send");

module.exports = {
  proprietaireASupprimer: async (contrat) => {
    contrat.etat_contrat.etat.deleted_proprietaires.forEach(
      async (proprietaire) => {
        await Proprietaire.findByIdAndUpdate(
          { _id: proprietaire },
          { statut: "À supprimer" }
        );
      }
    );
  },

  deleteProprietaire: async (req, res, proprietareId) => {
    await Proprietaire.findByIdAndUpdate(proprietareId, {
      deleted: true,
    }).catch((error) => {
      res.status(400).send({ message: error.message });
    });
  },
};
