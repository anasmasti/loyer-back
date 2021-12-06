const Contrat = require("../../models/contrat/contrat.model");
const Foncier = require("../../models/foncier/foncier.model");
const Lieu = require("../../models/lieu/lieu.model");
const Proprietaire = require("../../models/proprietaire/proprietaire.model");

module.exports = {
  etatLoyerSiege: async (req, res) => {
    let CompareDate,
      CurrentMonthContrats = [];

    let Result = [];
    let TotalMontantLoyer = 0;
    let ArrayTest = [{ Test: 1 }, { Test: 2 }, { Test: 3 }, { Test: 4 }];


    Contrat.aggregate([
      {
        $match: { deleted: false },
      },
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
          numero_contrat: 1,
          updatedAt: 1,
          createdAt: 1,
          foncier: {
            $map: {
              input: "$foncier",
              as: "fonciermap",
              in: {
                deleted: "$$fonciermap.deleted",
                lieu: {
                  $map: {
                    input: "$$fonciermap.lieu",
                    as: 'lieumap',
                    in: {
                      deleted: "$$lieumap.deleted",
                      transferer: "$$lieumap.transferer",
                      lieu: {
                        $arrayElemAt: [
                          "$populatedLieu",
                          { $indexOfArray: ["$populatedLieu._id", "$$lieumap.lieu"] },
                        ],
                      },
                    }
                  }
                },

              },
            },
          },
        },
      },
    ])

      // ])
      .limit(1)
      .then((data) => {
        return res.json(data);
        for (let i = 0; i < data.length; i++) {
          // Get the Compare Date between
          // date_comptabilisation / date_premier_paiement / date_debut_loyer
          if (data[i].foncier != null) {
            if (data[i].date_comptabilisation != null) {
              console.log("test1");
              CompareDate = new Date(data[i].date_comptabilisation);
              console.log(CompareDate);
            } else {
              if (data[i].date_premier_paiement != null) {
                console.log("test2");
                CompareDate = new Date(data[i].date_premier_paiement);
              } else {
                console.log("test3");
                CompareDate = new Date(data[i].date_debut_loyer);
              }
            }

            CompareDate.setMonth(CompareDate.getMonth() - 1);

            //   if (
            //     CompareDate.getMonth() + 1 == req.params.mois &&
            //     CompareDate.getFullYear() == req.params.annee
            //   ) {
            CurrentMonthContrats.push(data[i]); //!!!!!!!!!!!!!!!!!!!!!!!
            //  }
          }
        }
        // return res.json(CurrentMonthContrats);
        if (CurrentMonthContrats.length > 0) {
          for (let i = 0; i < CurrentMonthContrats.length; i++) {
            for (
              let j = 0;
              j < CurrentMonthContrats[i].foncier.lieu.length;
              j++
            ) {
              if (CurrentMonthContrats[i].foncier.lieu.deleted != null) {
                TotalMontantLoyer += CurrentMonthContrats[i].montant_loyer;
                Result.push({
                  intitule_lieu:
                    CurrentMonthContrats[i].foncier.lieu[j].lieu.intitule_lieu,
                  value: CurrentMonthContrats[i].montant_loyer,
                });
              }
            }
          }
        } else res.status(422).json({ message: " Date invalide " });
        Result.push({
          total_montant_loyer: TotalMontantLoyer,
        });
        res.json(Result);
      })
      .catch((error) => {
        res.status(403).json({ message: error.message });
      });
  },
};
