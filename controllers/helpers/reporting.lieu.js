const Contrat = require("../../models/contrat/contrat.model");
const Foncier = require("../../models/foncier/foncier.model");
const Lieu = require("../../models/lieu/lieu.model");
const generatePdf = require("./generatePdf");
const moment = require("moment");

module.exports = {
  etatLoyer: async (req, res, TypeFoncier) => {
    let TotalMontantLoyer = 0;
    // Generation Date
    // let generationDate = new Date(
    //   req.params.annee +
    //     "-" +
    //     ("0" + parseInt(req.params.mois)).slice(-2) +
    //     "-01T00:00:00.000Z"
    // );

    let generationDate = new Date();
    // let generationDate = new Date()
    // let generationDate = req.params.annee + '-0' + (parseInt(req.params.mois)) + '-21T10:08:54.416Z'

    // return res.json(generationDate)

    // Contrat.aggregate([
    //   {
    //     $lookup: {
    //       from: Foncier.collection.name,
    //       localField: "foncier",
    //       foreignField: "_id",
    //       as: "foncier",
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: Lieu.collection.name,
    //       localField: "foncier.lieu.lieu",
    //       foreignField: "_id",
    //       as: "populatedLieu",
    //     },
    //   },
    //   {
    //     $project: {
    //       deleted: 1,
    //       numero_contrat: 1,
    //       montant_loyer: 1,
    //       date_debut_loyer: 1,
    //       date_fin_contrat: 1,
    //       etat_contrat: 1,
    //       updatedAt: 1,
    //       createdAt: 1,
    //       foncier: {
    //         $map: {
    //           input: {
    //             $filter: {
    //               input: "$foncier",
    //               as: "foncierfillter",
    //               cond: {
    //                 $eq: ["$$foncierfillter.type_lieu", TypeFoncier],
    //               },
    //             },
    //           },
    //           as: "fonciermap",
    //           in: {
    //             deleted: "$$fonciermap.deleted",
    //             type_lieu: "$$fonciermap.type_lieu",
    //             lieu: {
    //               $map: {
    //                 input: {
    //                   $filter: {
    //                     input: "$$fonciermap.lieu",
    //                     as: "lieufillter",
    //                     cond: { $eq: ["$$lieufillter.deleted", false] },
    //                   },
    //                 },
    //                 as: "lieumap",
    //                 in: {
    //                   deleted: "$$lieumap.deleted",
    //                   transferer: "$$lieumap.transferer",
    //                   lieu: {
    //                     $arrayElemAt: [
    //                       "$populatedLieu",
    //                       {
    //                         $indexOfArray: [
    //                           "$populatedLieu._id",
    //                           "$$lieumap.lieu",
    //                         ],
    //                       },
    //                     ],
    //                   },
    //                 },
    //               },
    //             },
    //           },
    //         },
    //       },
    //     },
    //   },
    //   {
    //     $match: {
    //       $and: [
    //         { deleted: false },
    //         {
    //           $or: [
    //             {
    //               foncier: { $exists: true, $not: { $size: 0 } },
    //               "foncier.lieu": { $exists: true, $not: { $size: 0 } },
    //               "etat_contrat.libelle": "Résilié",
    //               date_debut_loyer: {
    //                 $lte: generationDate,
    //               },
    //               "etat_contrat.etat.date_resiliation": {
    //                 $gte: generationDate,
    //               },
    //             },
    //             {
    //               foncier: { $exists: true, $not: { $size: 0 } },
    //               "foncier.lieu": { $exists: true, $not: { $size: 0 } },
    //               "etat_contrat.libelle": "Actif",
    //               date_debut_loyer: {
    //                 $lte: generationDate,
    //               },
    //               date_fin_contrat: {
    //                 $gte: generationDate,
    //               },
    //             },
    //             {
    //               foncier: { $exists: true, $not: { $size: 0 } },
    //               "foncier.lieu": { $exists: true, $not: { $size: 0 } },
    //               "etat_contrat.libelle": "Actif",
    //               date_debut_loyer: {
    //                 $lte: generationDate,
    //               },
    //               date_fin_contrat: null,
    //             },
    //           ],
    //         },
    //       ],
    //     },
    //   },
    // ])
    //   .then((data) => {
    //     if (data.length > 0) {
    //       for (let i = 0; i < data.length; i++) {
    //         TotalMontantLoyer += data[i].montant_loyer;
    //         Result.push({
    //           numero_contrat: data[i].numero_contrat,
    //           intitule_lieu: data[i].foncier[0].lieu[0].lieu.intitule_lieu,
    //           montant_loyer: data[i].montant_loyer,
    //         });
    //       }

    //       let etatReporting;
    //       switch (TypeFoncier) {
    //         case "Supervision":
    //           etatReporting = "supervisions";
    //           break;
    //         case "Siège":
    //           etatReporting = "siège";
    //           break;
    //         case "Point de vente":
    //           etatReporting = "points_de_vente";
    //           break;
    //         case "Logement de fonction":
    //           etatReporting = "logements_de_fonction";
    //           break;
    //         case "Direction régionale":
    //           etatReporting = "directions_régionales";
    //           break;

    //         default:
    //           break;
    //       }
    //       res.json(data);
    //       // generatePdf(
    //       //   {
    //       //     // mois: currentDate.getMonth() + 1,
    //       //     // annee: currentDate.getFullYear(),
    //       //     mois: req.params.mois,
    //       //     annee: req.params.annee,
    //       //     total_montant_loyer: TotalMontantLoyer,
    //       //     lieu_data: Result,
    //       //   },
    //       //   etatReporting
    //       // );
    //     } else
    //       res
    //         .status(422)
    //         .json({ message: " Il n'existe aucun contrat durant cette date " });
    //   })
    //   .catch((error) => {
    //     res.status(403).json({ message: error.message });
    //   });

    Lieu.find({ deleted: false, type_lieu: TypeFoncier })
      .then((data) => {
        if (data.length > 0) {
          let etatReporting;
          switch (TypeFoncier) {
            case "Supervision":
              etatReporting = "supervisions";
              break;
            case "Siège":
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
          res.json(data);
          generatePdf(
            {
              mois: generationDate.getMonth() + 1,
              annee: generationDate.getFullYear(),
              lieu_data: data,
            },
            etatReporting
          );
        } else res.status(422).json({ message: " Il n'existe aucune entité " });
      })
      .catch((error) => {
        res.status(403).json({ message: error.message });
      });
  },
};
