const Foncier = require("../../models/foncier/foncier.model");
const Proprietaire = require("../../models/proprietaire/proprietaire.model");
const Lieu = require('../../models/lieu/lieu.model');

module.exports = {
  //get all foncier and populated with proprietaire deleted: false
  getAllFoncier: async (_, res) => {
    Foncier.aggregate([
      {
        $match: { deleted: false }
      },
      {
        $lookup: [{
          from: Proprietaire.collection.name,
          localField: 'proprietaire',
          foreignField: '_id',
          as: 'proprietaire',
        },
        {
          from: Lieu.collection.name,
          localField: 'lieu',
          foreignField: '_id',
          as: 'lieu',
        }]
      },
      {
        $addFields: {
          "proprietaire": {
            $map: {
              input: {
                $filter: {
                  input: "$proprietaire",
                  as: "proprietairefillter",
                  cond: { $eq: ["$$proprietairefillter.deleted", false] }
                }
              },
              as: "proprietairemap",
              in: {
                "_id": '$$proprietairemap._id',
                "deleted": '$$proprietairemap.deleted',
                "is_mandataire": '$proprietairemap.is_mandataire',
                "has_mandataire": '$proprietairemap.has_mandataire',
                "cin": '$$proprietairemap.cin',
                "passport": '$$proprietairemap.passport',
                "carte_sejour": '$$proprietairemap.carte_sejour',
                "nom_prenom": '$$proprietairemap.nom_prenom',
                "raison_social": '$$proprietairemap.raison_social',
                "n_registre_commerce": '$$proprietairemap.n_registre_commerce',
                "telephone": '$$proprietairemap.telephone',
                "fax": '$$proprietairemap.fax',
                "adresse": '$$proprietairemap.adresse',
                "n_compte_bancaire": '$$proprietairemap.n_compte_bancaire',
                "banque": '$$proprietairemap.banque',
                "banque_rib": '$$proprietairemap.banque_rib',
                "ville_rib": '$$proprietairemap.ville_rib',
                "cle_rib": '$$proprietairemap.cle_rib',
                "taux_impot": '$$proprietairemap.taux_impot',
                "retenue_source": '$$proprietairemap.retenue_source',
                "montant_apres_impot": '$$proprietairemap.montant_apres_impot',
                "montant_loyer": '$$proprietairemap.montant_loyer',
                "nom_agence_bancaire": '$$proprietairemap.nom_agence_bancaire',
                "montant_avance_proprietaire": '$$proprietairemap.montant_avance_proprietaire',
                "tax_avance_proprietaire": '$$proprietairemap.tax_avance_proprietaire',
                "tax_par_periodicite": '$$proprietairemap.tax_par_periodicite',
                "pourcentage": '$$proprietairemap.pourcentage',
                "caution_par_proprietaire": '$$proprietairemap.caution_par_proprietaire',
                "proprietaire_list": '$$proprietairemap.proprietaire_list',
              }
              
            }
          }
        }
      }
    ])
      .then((data) => {
        res.json(data);
      })
      .catch((error) => {
        res.status(422).send({ message: error.message });
      });
  },

  getFoncierById: async (req, res) => {
    Foncier.findById({ _id: req.params.IdFoncier })
      .then((data) => {
        res.json(data);
      })
      .catch((error) => {
        res.status(422).send({ message: error.message });
      });
  },
};
