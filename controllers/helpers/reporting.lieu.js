const Contrat = require("../../models/contrat/contrat.model");
const Foncier = require("../../models/foncier/foncier.model");
const Lieu = require("../../models/lieu/lieu.model");
const generatePdf = require("./generatePdf");

module.exports = {
  etatLoyer: async (req, res, TypeFoncier) => {
    let Result = [];
    let TotalMontantLoyer = 0;
    // Today's Date
    let currentDate = new Date();

    Contrat.aggregate([
      {
        $lookup: {
          from: Foncier.collection.name,
          localField: "foncier",
          foreignField: "_id",
          as: "foncier",
        },
      },
      {
        $lookup: {
          from: Lieu.collection.name,
          localField: "foncier.lieu.lieu",
          foreignField: "_id",
          as: "populatedLieu",
        },
      },
      {
        $project: {
          deleted: 1,
          numero_contrat: 1,
          montant_loyer: 1,
          date_debut_loyer: 1,
          date_fin_contrat: 1,
          etat_contrat: 1,
          updatedAt: 1,
          createdAt: 1,
          foncier: {
            $map: {
              input: {
                $filter: {
                  input: "$foncier",
                  as: "foncierfillter",
                  cond: {
                    $eq: ["$$foncierfillter.type_lieu", TypeFoncier],
                  },
                },
              },
              as: "fonciermap",
              in: {
                deleted: "$$fonciermap.deleted",
                type_lieu: "$$fonciermap.type_lieu",
                lieu: {
                  $map: {
                    input: {
                      $filter: {
                        input: "$$fonciermap.lieu",
                        as: "lieufillter",
                        cond: { $eq: ["$$lieufillter.deleted", false] },
                      },
                    },
                    as: "lieumap",
                    in: {
                      deleted: "$$lieumap.deleted",
                      transferer: "$$lieumap.transferer",
                      lieu: {
                        $arrayElemAt: [
                          "$populatedLieu",
                          {
                            $indexOfArray: [
                              "$populatedLieu._id",
                              "$$lieumap.lieu",
                            ],
                          },
                        ],
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        $match: {
          $and: [
            { deleted: false },
            {
              $or: [
                {
                  foncier: { $exists: true, $not: { $size: 0 } },
                  "etat_contrat.libelle": "Résilié",
                  date_debut_loyer: {
                    $lte: currentDate,
                  },
                  "etat_contrat.etat.date_resiliation": {
                    $gte: currentDate,
                  },
                  "foncier.lieu": { $exists: true, $not: { $size: 0 } },
                },
                {
                  foncier: { $exists: true, $not: { $size: 0 } },
                  "foncier.lieu": { $exists: true, $not: { $size: 0 } },
                  date_debut_loyer: {
                    $lte: currentDate,
                  },
                  date_fin_contrat: {
                    $gte: currentDate,
                  },
                },
              ],
            },
          ],
        },
      },
    ])
      .then((data) => {
        // return res.json(data)
        if (data.length > 0) {
          for (let i = 0; i < data.length; i++) {
            TotalMontantLoyer += data[i].montant_loyer;
            Result.push({
              numero_contrat: data[i].numero_contrat,
              intitule_lieu: data[i].foncier[0].lieu[0].lieu.intitule_lieu,
              montant_loyer: data[i].montant_loyer,
            });
          }
        } else res.status(422).json({ message: " Date invalide " });
        // Result.push({
        //   total_montant_loyer: TotalMontantLoyer,
        // });
        // res.json(Result);

        let etatReporting;
        switch (TypeFoncier) {
          case "Supervision":
            etatReporting = "supervisions";
            break;
          case "siège":
            etatReporting = "siège";
            break;
          case "Point de vente":
            etatReporting = "points_de_vente";
            break;
          case "Logement de fonction":
            etatReporting = "logements_de_fonction";
            break;
          case "Direction régionale":
            etatReporting = "directions_régionales";
            break;

          default:
            break;
        }
        generatePdf({
          mois: currentDate.getMonth() + 1,
          annee: currentDate.getFullYear(),
          total_montant_loyer: TotalMontantLoyer,
          lieu_data: Result,
        }, etatReporting)
        // res.json(Result);
      })
      .catch((error) => {
        res.status(403).json({ message: error.message });
      });
  },
};
