const Proprietaire = require('../../models/proprietaire/proprietaire.model')
const Foncier = require('../../models/foncier/foncier.model')
const Lieu = require('../../models/lieu/lieu.model')
const Contrat = require('../../models/contrat/contrat.model')

module.exports = {

    //Chercher touts les propriétaires
    getAllProprietaire: async (req, res) => {
        await Proprietaire.find({ deleted: false }).populate({ path: "proprietaire_list"}).sort( {updatedAt: 'desc'} )
            .then((data) => {
                // console.log('test' , data);
                res.send(data)
            })
            .catch((error) => {
                res.status(200).send({ message: `Aucun Propriétaire trouvé` || error })
            })
    },

    getAllProprietairefromContrat: async (req, res) => {
        // Contrat.aggregate([
        //     {
        //       $match: {
        //         // $and: [
        //           deleted: false
        //         //   {
        //         //     $or: [
        //         //       {
        //         //         foncier: { $exists: true, $not: { $size: 0 } },
        //         //         "foncier.lieu": { $exists: true, $not: { $size: 0 } },
        //         //         "etat_contrat.libelle": "Résilié",
        //         //         date_debut_loyer: {
        //         //           $lte: currentDate,
        //         //         },
        //         //         "etat_contrat.etat.date_resiliation": {
        //         //           $gte: currentDate,
        //         //         },
        //         //       },
        //         //       {
        //         //         foncier: { $exists: true, $not: { $size: 0 } },
        //         //         "foncier.lieu": { $exists: true, $not: { $size: 0 } },
        //         //         date_debut_loyer: {
        //         //           $lte: currentDate,
        //         //         },
        //         //         date_fin_contrat: {
        //         //           $gte: currentDate,
        //         //         },
        //         //       },
        //         //       {
        //         //         foncier: { $exists: true, $not: { $size: 0 } },
        //         //         "foncier.lieu": { $exists: true, $not: { $size: 0 } },
        //         //         date_debut_loyer: {
        //         //           $lte: currentDate,
        //         //         },
        //         //         date_fin_contrat: null,
        //         //       },
        //         //     ],
        //         //   },
        //         // ],
        //       },
        //     },
        //     {
        //       $lookup: {
        //         from: Foncier.collection.name,
        //         localField: "foncier",
        //         foreignField: "_id",
        //         as: "foncier",
        //       },
        //     },
        //     {
        //       $lookup: {
        //         from: Lieu.collection.name,
        //         localField: "foncier.lieu.lieu",
        //         foreignField: "_id",
        //         as: "populatedLieu",
        //       },
        //     },
        //     {
        //         $lookup: {
        //           from: Proprietaire.collection.name,
        //           localField: "foncier.proprietaire",
        //           foreignField: "_id",
        //           as: "populatedProprietaire",
        //         },
        //       },
        //       {
        //         $lookup: {
        //           from: Proprietaire.collection.name,
        //           localField: "foncier.proprietaire.proprietaire_list",
        //           foreignField: "_id",
        //           as: "populatedProprietaireList",
        //         },
        //       },
        //     {
        //       $project: {
        //         deleted: 1,
        //         numero_contrat: 1,
        //         montant_loyer: 1,
        //         date_debut_loyer: 1,
        //         date_fin_contrat: 1,
        //         etat_contrat: 1,
        //         updatedAt: 1,
        //         createdAt: 1,
        //         foncier: {
        //           $map: {
        //             input: {
        //               $filter: {
        //                 input: "$foncier",
        //                 as: "foncierfillter",
        //                 cond: {
        //                   $eq: ["$$foncierfillter.deleted", false ],
        //                 },
        //               },
        //             },
        //             as: "fonciermap",
        //             in: {
        //               deleted: "$$fonciermap.deleted",
        //               type_lieu: "$$fonciermap.type_lieu",
        //               lieu: {
        //                 $map: {
        //                   input: {
        //                     $filter: {
        //                       input: "$$fonciermap.lieu",
        //                       as: "lieufillter",
        //                       cond: { $eq: ["$$lieufillter.deleted", false] },
        //                     },
        //                   },
        //                   as: "lieumap",
        //                   in: {
        //                     deleted: "$$lieumap.deleted",
        //                     transferer: "$$lieumap.transferer",
        //                     lieu: {
        //                       $arrayElemAt: [
        //                         "$populatedLieu",
        //                         {
        //                           $indexOfArray: [
        //                             "$populatedLieu._id",
        //                             "$$lieumap.lieu",
        //                           ],
        //                         },
        //                       ],
        //                     },
        //                   },
        //                 },
        //               },
        //               proprietaire: {
        //                 $map: {
        //                     input: {
        //                       $filter: {
        //                         input: "$populatedProprietaire",
        //                         as: "proprietairefillter",
        //                         cond: { $eq: ["$$proprietairefillter.deleted", false] },
        //                       },
        //                     },
        //                     as: "proprietairemap",
        //                     in: {
        //                       numero_contrat: 1,
        //                       _id: "$$proprietairemap._id",
        //                       deleted: "$$proprietairemap.deleted",
        //                       is_mandataire: "$proprietairemap.is_mandataire",
        //                       has_mandataire: "$proprietairemap.has_mandataire",
        //                       cin: "$$proprietairemap.cin",
        //                       passport: "$$proprietairemap.passport",
        //                       carte_sejour: "$$proprietairemap.carte_sejour",
        //                       nom_prenom: "$$proprietairemap.nom_prenom",
        //                       raison_social: "$$proprietairemap.raison_social",
        //                       n_registre_commerce: "$$proprietairemap.n_registre_commerce",
        //                       telephone: "$$proprietairemap.telephone",
        //                       fax: "$$proprietairemap.fax",
        //                       adresse: "$$proprietairemap.adresse",
        //                       n_compte_bancaire: "$$proprietairemap.n_compte_bancaire",
        //                       banque: "$$proprietairemap.banque",
        //                       taux_impot: "$$proprietairemap.taux_impot",
        //                       retenue_source: "$$proprietairemap.retenue_source",
        //                       montant_apres_impot: "$$proprietairemap.montant_apres_impot",
        //                       montant_loyer: "$$proprietairemap.montant_loyer",
        //                       nom_agence_bancaire: "$$proprietairemap.nom_agence_bancaire",
        //                       montant_avance_proprietaire:
        //                         "$$proprietairemap.montant_avance_proprietaire",
        //                       tax_avance_proprietaire:
        //                         "$$proprietairemap.tax_avance_proprietaire",
        //                       tax_par_periodicite: "$$proprietairemap.tax_par_periodicite",
        //                       pourcentage: "$$proprietairemap.pourcentage",
        //                       caution_par_proprietaire:
        //                         "$$proprietairemap.caution_par_proprietaire",
        //                       proprietaire_list: 
        //                     //   "$$proprietairemap.proprietaire_list"
        //                       {
        //                         $map: {
        //                             input: {
        //                               $filter: {
        //                                 input: "$populatedProprietaireList",
        //                                 as: "proprietairelistfillter",
        //                                 cond: { $eq: ["$$proprietairelistfillter.deleted", false] },
        //                               },
        //                             },
        //                             as: "proprietairelistmap",
        //                             in: {
        //                               numero_contrat: 1,
        //                               _id: "$$proprietairelistmap._id",
        //                               deleted: "$$proprietairelistmap.deleted",
        //                               is_mandataire: "$proprietairelistmap.is_mandataire",
        //                               has_mandataire: "$proprietairelistmap.has_mandataire",
        //                               cin: "$$proprietairelistmap.cin",
        //                               passport: "$$proprietairelistmap.passport",
        //                               carte_sejour: "$$proprietairelistmap.carte_sejour",
        //                               nom_prenom: "$$proprietairelistmap.nom_prenom",
        //                               raison_social: "$$proprietairelistmap.raison_social",
        //                               n_registre_commerce: "$$proprietairelistmap.n_registre_commerce",
        //                               telephone: "$$proprietairelistmap.telephone",
        //                               fax: "$$proprietairelistmap.fax",
        //                               adresse: "$$proprietairelistmap.adresse",
        //                               n_compte_bancaire: "$$proprietairelistmap.n_compte_bancaire",
        //                               banque: "$$proprietairelistmap.banque",
        //                               taux_impot: "$$proprietairelistmap.taux_impot",
        //                               retenue_source: "$$proprietairelistmap.retenue_source",
        //                               montant_apres_impot: "$$proprietairelistmap.montant_apres_impot",
        //                               montant_loyer: "$$proprietairelistmap.montant_loyer",
        //                               nom_agence_bancaire: "$$proprietairelistmap.nom_agence_bancaire",
        //                               montant_avance_proprietaire:
        //                                 "$$proprietairelistmap.montant_avance_proprietaire",
        //                               tax_avance_proprietaire:
        //                                 "$$proprietairelistmap.tax_avance_proprietaire",
        //                               tax_par_periodicite: "$$proprietairelistmap.tax_par_periodicite",
        //                               pourcentage: "$$proprietairelistmap.pourcentage",
        //                               caution_par_proprietaire:
        //                                 "$$proprietairelistmap.caution_par_proprietaire",
        //                               proprietaire_list: "$$proprietairelistmap.proprietaire_list",
        //                             },
        //                           },
        //                       }
        //                       ,
        //                     },
        //                   },
        //               },
        //             },
        //           },
        //         },
        //       },
        //     },
            
        //   ])
        await Contrat.find({ deleted: false, numero_contrat: "666/dr666" } , "_id numero_contrat")
        .populate({ path: "foncier", populate: { path: "proprietaire", populate:{ path: "proprietaire_list", match:{ deleted: false }  } , match:{ deleted: false } } })
        .populate({ path: "foncier", populate: { path: "lieu", populate:{ path: "lieu", select:"_id intitule_lieu", match:{ deleted: false } }, match:{ deleted: false } }, select: "proprietaire lieu" })
        .sort({ updatedAt: "desc" })
        .then((data) => {
          res.json(data);
        })
        .catch((error) => {
          res.status(402).send({ message: error.message });
        });
        //   .then((data) => {
        //     res.send(data)
        //   }) 
        //   .catch((error) => {
        //     res.status(200).send({ message: error.message })
        //   })
    },

    getIdFoncierByProprietaire : async (req , res) => {
         await Foncier.find({ deleted: false , proprietaire: req.params.Id } , '_id')
         .then((data) => {
            res.send(data)
        })
        .catch((error) => {
            res.status(200).send({ message: `Aucun Lieu trouvé` || error })
        })
    },

    //Chercher propriétaires par ID
    getProprietairePerID: async (req, res) => {
        await Proprietaire.findById(req.params.Id)
            .then((data) => {
                res.send(data)
            })
            .catch((error) => {
                res.status(500).send({ message: `Aucun Propriétaire trouvé` || error })
            })
    },

    getCountProprietaire: async (req, res) => {
        await Proprietaire.countDocuments({deleted: false})
            .then((data) => {
                res.json(data)
            })
            .catch((error) => {
                res.status(402).send({message: error.message})
            })
    }

}
