const Proprietaire = require("../../models/proprietaire/proprietaire.model");
const Contrat = require("../../models/contrat/contrat.model");
const AffectationProprietaire = require("../../models/affectation_proprietaire/affectation_proprietaire.schema");

module.exports = {
  getAllAffectationsProprietaire: async (req, res) => {
    await AffectationProprietaire.find({ deleted: false })
      .populate({
        path: "proprietaire",
      })
      .populate({
        path: "contrat",
      })
      .sort({ updatedAt: "desc" })
      .then((data) => {
        res.json(data);
      })
      .catch((error) => {
        res.status(402).send({ message: error.message });
      });
  },

  getAffectationProprietairePerID: async (req, res) => {
    await AffectationProprietaire.findById(req.params.Id)
      .pop.then((data) => {
        res.send(data);
      })
      .catch((error) => {
        res.status(500).send({ message: `Aucun Propriétaire trouvé` || error });
      });
  },

  getAPperProprietaireID: async (req, res) => {
    await Proprietaire.findOne(
      { _id: req.params.Id, deleted: false },
      "nom_prenom raison_social"
    )
      .then(async (proprietaire) => {
        await AffectationProprietaire.find({
          proprietaire: req.params.Id,
          deleted: false,
        })
          .populate({
            path: "contrat",
            select: "numero_contrat foncier",
            populate: {
              path: "foncier",
              select: "type_lieu",
            },
          })
          .populate({
            path: "proprietaire_list",
            match: {
              deleted: false,
            },
          })
          .sort({ updatedAt: "desc" })
          .then((affectations) => {
            if (affectations.length > 0) {
              res.send({ ...proprietaire["_doc"], affectations });
            } else {
              res.send(affectations);
            }
          })
          .catch((error) => {
            console.log(`${error.message}`);
            res.status(412).send({
              message: `Aucune affectation trouvée`,
            });
          });
      })
      .catch((error) => {
        console.log(`${error.message}`);
        res.status(500).send({
          message: `Aucun proprietaire trouvé`,
        });
      });
  },

  getProprietairesHasntMondataire: async (req, res) => {
    Contrat.findById({ _id: req.params.IdContrat })
      .populate({ path: "proprietaires", populate: { path: "proprietaire" } })
      .then((contrat) => {
        let proprietairesHasntMondataire = contrat.proprietaires.filter(
          (proprietaire) => {
            return (
              !proprietaire.is_mandataire && proprietaire.has_mandataire == null
            );
          }
        );
        res.json(proprietairesHasntMondataire);
      })
      .catch((error) => {
        res.status(500).send({ message: `Aucun contrat trouvé` || error });
      });
  },
};
