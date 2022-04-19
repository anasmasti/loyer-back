const Lieu = require("../../models/lieu/lieu.model");
const Foncier = require("../../models/foncier/foncier.model");
const mongoose = require("mongoose");

module.exports = {
  modifierLieu: async (req, res, next) => {
    //check lieu if already exist
    const codeLieuExist = await Lieu.findOne({ code_lieu: req.body.code_lieu });

    let id = mongoose.Types.ObjectId(req.params.Id);

    await Lieu.find({
      $or: [{ attached_DR: req.params.Id }, { attached_SUP: req.params.Id }],
      deleted: false,
    }).then(async (lieux) => {
      if (lieux.length > 0) {
        return res
          .status(403)
          .send({ message: `Cette entité est attachée à une autre entité` });
      } else {
        await Foncier.aggregate([
          {
            $lookup: {
              from: Lieu.collection.name,
              localField: "lieu.lieu",
              foreignField: "_id",
              as: "populatedLieu",
            },
          },
          {
            $addFields: {
              lieu: {
                $map: {
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
                    lieu: {
                      $map: {
                        input: {
                          $filter: {
                            input: "$populatedLieu",
                            as: "populatedLieufillter",
                            cond: {
                              $eq: ["$$populatedLieufillter._id", id],
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
          {
            $project: {
              deleted: 1,
              lieu: 1,
            },
          },
          {
            $match: {
              deleted: false,
              "lieu.lieu": { $not: { $size: 0 } },
            },
          },
        ])
          .then(async (fonciers) => {
            if (fonciers.length > 0) {
              return res
                .status(403)
                .send({ message: "Cette entité est affectée à un local" });
            } else {
              //  update lieu
              if (codeLieuExist) {
                if (
                  codeLieuExist._id != req.params.Id &&
                  codeLieuExist.code_lieu != ""
                ) {
                  return res
                    .status(422)
                    .send({ message: "Le code lieu est deja pris" });
                }
              }

              await Lieu.findOne({ _id: req.params.Id }).then(
                async (lieuData) => {
                  if (lieuData.intitule_lieu != req.body.intitule_lieu.toUpperCase()) {
                    await Lieu.find({
                      type_lieu: "Logement de fonction",
                      attached_DR: lieuData._id,
                    }).then((LfData) => {
                      if (LfData.length > 0) {
                        LfData.forEach(async (lieuLF) => {
                          await Lieu.findByIdAndUpdate(
                            { _id: lieuLF._id },
                            {
                              intitule_lieu: `LF/${req.body.intitule_lieu.toUpperCase()}`,
                            }
                          );
                        });
                      }
                    });
                  }
                }
              );

              let directeurRegional = [],
                item = 0;

              for (item in req.body.directeur_regional) {
                directeurRegional.push({
                  matricule: req.body.directeur_regional[item].matricule,
                  nom: req.body.directeur_regional[item].nom,
                  prenom: req.body.directeur_regional[item].prenom,
                  deleted_directeur:
                    req.body.directeur_regional[item].deleted_directeur,
                });
              }

              await Lieu.findByIdAndUpdate(
                { _id: req.params.Id },
                {
                  code_lieu: req.body.code_lieu,
                  intitule_lieu: req.body.intitule_lieu.toUpperCase(),
                  code_localite: req.body.code_localite,
                  telephone: req.body.telephone,
                  fax: req.body.fax,
                  type_lieu: req.body.type_lieu,
                  // code_rattache_DR: req.body.code_rattache_DR,
                  // code_rattahce_SUP: req.body.code_rattahce_SUP,
                  attached_DR: req.body.attached_DR,
                  attached_SUP: req.body.attached_SUP,
                  intitule_rattache_SUP_PV: req.body.intitule_rattache_SUP_PV,
                  centre_cout_siege: req.body.centre_cout_siege,
                  categorie_pointVente: req.body.categorie_pointVente,
                  etat_logement_fonction: req.body.etat_logement_fonction,
                  directeur_regional: directeurRegional,
                  deleted: false,
                },
                { new: true }
              )
                .then((data) => {
                  res.json(data);
                })
                .catch((error) => {
                  res.status(402).send({ message: error.message });
                });
            }
          })
          .catch((error) => {
            res.status(403).send({ message: error.message });
          });
      }
    });
  },
};
