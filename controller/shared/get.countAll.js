const Proprietaire = require("../../models/proprietaire/proprietaire.model");
const Lieu = require("../../models/lieu/lieu.model");
const Foncier = require("../../models/foncier/foncier.model");
const Contrat = require("../../models/contrat/contrat.model");

module.exports = {
  countAll: async (req, res) => {
    let totalCountAmenagements = 0,
      totalCountFournisseur = 0,
      totalCountDirecteurRegional = 0;
    try {
      const countProprietaire = await Proprietaire.countDocuments({
        deleted: false,
      });
      const countLieu = await Lieu.countDocuments({ deleted: false });
      const countFoncier = await Foncier.countDocuments({ deleted: false });
      const countContrat = await Contrat.countDocuments({ deleted: false });
      const countAmenagement = await Lieu.aggregate([
        { $match: { deleted: false, has_amenagements: true } },
        {
          $addFields: {
            amenagement: {
              $map: {
                input: {
                  $filter: {
                    input: "$amenagement",
                    as: "amenagementfillter",
                    cond: { $eq: ["$$amenagementfillter.deleted", false] },
                  },
                },
                as: "amenagementmap",
                in: {
                  nature_amenagement: "$$amenagementmap.nature_amenagement",
                  deleted: "$$amenagementmap.deleted",
                  _id: "$$amenagementmap._id",
                  montant_amenagement: "$$amenagementmap.montant_amenagement",
                  valeur_nature_chargeProprietaire:
                    "$$amenagementmap.valeur_nature_chargeProprietaire",
                  valeur_nature_chargeFondation:
                    "$$amenagementmap.valeur_nature_chargeFondation",
                  numero_facture: "$$amenagementmap.numero_facture",
                  numero_bon_commande: "$$amenagementmap.numero_bon_commande",
                  date_passation_commande:
                    "$$amenagementmap.date_passation_commande",
                  evaluation_fournisseur:
                    "$$amenagementmap.evaluation_fournisseur",
                  date_fin_travaux: "$$amenagementmap.date_fin_travaux",
                  images_apres_travaux: "$$amenagementmap.images_apres_travaux",
                  croquis_travaux: "$$amenagementmap.croquis_travaux",
                  fournisseur: {
                    $filter: {
                      input: "$$amenagementmap.fournisseur",
                      as: "fournisseur",
                      cond: { $eq: ["$$fournisseur.deleted", false] },
                    },
                  },
                },
              },
            },
          },
        },
        {
          $project: { amenagement: 1 },
        },
      ]);

      const countDirecteurRegional = await Lieu.aggregate([
        {
          $match: {
            deleted: false,
            directeur_regional: { $exists: true, $not: { $size: 0 } },
          },
        },
        {
          $addFields: {
            directeur_regional: {
              $map: {
                input: {
                  $filter: {
                    input: "$directeur_regional",
                    as: "directeur_regionalFillter",
                    cond: {
                      $eq: [
                        "$$directeur_regionalFillter.deleted_directeur",
                        false,
                      ],
                    },
                  },
                },
                as: "directeur_regionalMap",
                in: {
                  deleted_directeur:
                    "$$directeur_regionalMap.deleted_directeur",
                  _id: "$$directeur_regionalMap._id",
                  matricule: "$$directeur_regionalMap.matricule",
                  nom: "$$directeur_regionalMap.nom",
                  prenom: "$$directeur_regionalMap.prenom",
                },
              },
            },
          },
        },
        { $project: { directeur_regional: 1 } },
      ]);

      //count nombre total des amenagements
      for (let i = 0; i < countAmenagement.length; i++) {
        let lengthOfEachAmenageme = countAmenagement[i].amenagement;
        totalCountAmenagements += await lengthOfEachAmenageme.length;

        //count nombre des fournisseur
        for (let f = 0; f < countAmenagement[i].amenagement.length; f++) {
          let lengthOfEachFournisseur =
            countAmenagement[i].amenagement[f].fournisseur;
          totalCountFournisseur += await lengthOfEachFournisseur.length;
        }
      }

      //count total des directeurs regional
      totalCountDirecteurRegional = countDirecteurRegional.length;

      res.json({
        countProprietaire,
        countLieu,
        countFoncier,
        countContrat,
        totalCountAmenagements,
        totalCountFournisseur,
        totalCountDirecteurRegional,
      });
    } catch (error) {
      res.status(404).send({ message: error.message });
    }
  },
};
