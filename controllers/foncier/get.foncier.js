const Foncier = require("../../models/foncier/foncier.model");
const Proprietaire = require("../../models/proprietaire/proprietaire.model");
const Lieu = require("../../models/lieu/lieu.model");
const Contrat = require("../../models/contrat/contrat.model");
const mongoose = require("mongoose");

module.exports = {
  //get all foncier and populated with proprietaire deleted: false
  getAllFoncier: async (_, res) => {
    Foncier.aggregate([
      {
        $match: { deleted: false },
      },
      {
        $lookup: {
          from: Proprietaire.collection.name,
          localField: "proprietaire",
          foreignField: "_id",
          as: "proprietaire",
        },
      },
      {
        $lookup: {
          from: Contrat.collection.name,
          localField: "contrat",
          foreignField: "_id",
          as: "populatedContrat",
        },
      },
      {
        $lookup: {
          from: Lieu.collection.name,
          localField: "lieu.lieu",
          foreignField: "_id",
          as: "populatedLieu",
        },
      },
      {
        $lookup: {
          from: Lieu.collection.name,
          localField: "populatedLieu.attached_DR",
          foreignField: "_id",
          as: "attachedDR",
        },
      },
      {
        $lookup: {
          from: Lieu.collection.name,
          localField: "populatedLieu.attached_SUP",
          foreignField: "_id",
          as: "attachedSUP",
        },
      },
      // {
      //   $addFields: {
      //     proprietaire: {
      //       $map: {
      //         input: {
      //           $filter: {
      //             input: "$proprietaire",
      //             as: "proprietairefillter",
      //             cond: { $eq: ["$$proprietairefillter.deleted", false] },
      //           },
      //         },
      //         as: "proprietairemap",
      //         in: {
      //           _id: "$$proprietairemap._id",
      //           deleted: "$$proprietairemap.deleted",
      //           is_mandataire: "$proprietairemap.is_mandataire",
      //           has_mandataire: "$proprietairemap.has_mandataire",
      //           cin: "$$proprietairemap.cin",
      //           passport: "$$proprietairemap.passport",
      //           carte_sejour: "$$proprietairemap.carte_sejour",
      //           nom_prenom: "$$proprietairemap.nom_prenom",
      //           raison_social: "$$proprietairemap.raison_social",
      //           n_registre_commerce: "$$proprietairemap.n_registre_commerce",
      //           telephone: "$$proprietairemap.telephone",
      //           fax: "$$proprietairemap.fax",
      //           adresse: "$$proprietairemap.adresse",
      //           n_compte_bancaire: "$$proprietairemap.n_compte_bancaire",
      //           banque: "$$proprietairemap.banque",
      //           // banque_rib: "$$proprietairemap.banque_rib",
      //           // ville_rib: "$$proprietairemap.ville_rib",
      //           // cle_rib: "$$proprietairemap.cle_rib",
      //           taux_impot: "$$proprietairemap.taux_impot",
      //           retenue_source: "$$proprietairemap.retenue_source",
      //           montant_apres_impot: "$$proprietairemap.montant_apres_impot",
      //           montant_loyer: "$$proprietairemap.montant_loyer",
      //           nom_agence_bancaire: "$$proprietairemap.nom_agence_bancaire",
      //           montant_avance_proprietaire:
      //             "$$proprietairemap.montant_avance_proprietaire",
      //           tax_avance_proprietaire:
      //             "$$proprietairemap.tax_avance_proprietaire",
      //           tax_par_periodicite: "$$proprietairemap.tax_par_periodicite",
      //           part_proprietaire: "$$proprietairemap.part_proprietaire",
      //           caution_par_proprietaire:
      //             "$$proprietairemap.caution_par_proprietaire",
      //           proprietaire_list: "$$proprietairemap.proprietaire_list",
      //           statut: "$$proprietairemap.statut",
      //         },
      //       },
      //     },
      //   },
      // },
      {
        $project: {
          // proprietaire: 1,
          has_amenagements: 1,
          deleted: 1,
          adresse: 1,
          ville: 1,
          desc_lieu_entrer: 1,
          imgs_lieu_entrer: 1,
          superficie: 1,
          longitude: 1,
          latitude: 1,
          etage: 1,
          amenagement: 1,
          type_lieu: 1,
          updatedAt: 1,
          createdAt: 1,
          contrat: {
            $map: {
              input: "$populatedContrat",
              as: "contratmap",
              in: {
                numero_contrat: "$$contratmap.numero_contrat",
                validation2_DAJC: "$$contratmap.validation2_DAJC",
                old_contrat: "$$contratmap.old_contrat",
                etat_contrat: "$$contratmap.etat_contrat",
                _id: "$$contratmap._id",
              },
            },
          },
          lieu: {
            $map: {
              // input: "$lieu",
              input: {
                $filter: {
                  input: "$lieu",
                  as: "lieufillter",
                  cond: { $eq: ["$$lieufillter.deleted", false] },
                },
              },
              as: "lieumap",
              in: {
                deleted: "$$lieumap.deleted",
                etat_lieu: "$$lieumap.etat_lieu",
                foncierID: "$$lieumap.lieu",
                lieu: {
                  // $arrayElemAt: [
                  //   "$populatedLieu",
                  //   { $indexOfArray: ["$populatedLieu._id", "$$lieumap.lieu"] },
                  // ],
                  $map: {
                    input: {
                      $filter: {
                        input: "$populatedLieu",
                        as: "populatedLieufillter",
                        cond: {
                          $eq: ["$$populatedLieufillter._id", "$$lieumap.lieu"],
                        },
                      },
                    },
                    // "$populatedLieu",
                    as: "populatedLieuMap",
                    in: {
                      _id: "$$populatedLieuMap._id",
                      deleted: "$$populatedLieuMap.deleted",
                      attached_DR: {
                        $map: {
                          input: "$attachedDR",
                          as: "attachedDRMap",
                          in: {
                            _id: "$$attachedDRMap._id",
                            deleted: "$$attachedDRMap.deleted",
                            code_lieu: "$$attachedDRMap.code_lieu",
                            intitule_lieu: "$$attachedDRMap.intitule_lieu",
                            type_lieu: "$$attachedDRMap.type_lieu",
                          },
                        },
                      },
                      attached_SUP: {
                        $map: {
                          input: "$attachedSUP",
                          as: "attachedSUPMap",
                          in: {
                            _id: "$$attachedSUPMap._id",
                            deleted: "$$attachedSUPMap.deleted",
                            code_lieu: "$$attachedSUPMap.code_lieu",
                            intitule_lieu: "$$attachedSUPMap.intitule_lieu",
                            type_lieu: "$$attachedSUPMap.type_lieu",
                          },
                        },
                      },
                      code_lieu: "$$populatedLieuMap.code_lieu",
                      intitule_lieu: "$$populatedLieuMap.intitule_lieu",
                      type_lieu: "$$populatedLieuMap.type_lieu",
                    },
                  },
                },
              },
            },
          },
        },
      },
    ])
      // Foncier.find({ deleted: false })
      .sort({ updatedAt: "desc" })
      .then((data) => {
        res.json(data);
      })
      .catch((error) => {
        res.status(422).send({ message: error.message });
      });
  },

  getFoncierById: async (req, res) => {
    Foncier.findById({ _id: req.params.IdFoncier })
      .populate(
        "proprietaire",
        "cin nom_prenom n_registre_commerce raison_social -_id is_mandataire"
      )
      .populate({
        path: "lieu",
        populate: {
          path: "lieu",
          populate: { path: "attached_DR" },
          select: "-_id intitule_lieu type_lieu code_lieu",
        },
      })
      .populate({
        path: "contrat",
        select: "numero_contrat montant_loyer",
      })
      .then((data) => {
        res.json(data);
      })
      .catch((error) => {
        res.status(422).send({ message: error.message });
      });
  },
};
