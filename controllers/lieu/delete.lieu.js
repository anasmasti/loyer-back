const Lieu = require("../../models/lieu/lieu.model");
const Foncier = require("../../models/foncier/foncier.model");
const mongoose = require("mongoose");

module.exports = {
  deletedLieu: async (req, res) => {
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
              await Lieu.findByIdAndUpdate(
                { _id: req.params.Id },
                {
                  deleted: true,
                },
                { new: true }
              )
                .then((data) => {
                  res.json("Local supprimé avec succès");
                })
                .catch((error) => {
                  res.status(403).send({ message: error.message });
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
