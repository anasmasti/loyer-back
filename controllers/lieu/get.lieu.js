const Lieu = require('../../models/lieu/lieu.model')
const mongoose = require('mongoose')
const Contrat = require('../../models/contrat/contrat.model')



module.exports = {

    //get all lieu
    getAllLieu: (req, res) => {
        Lieu.find({ deleted: false }).sort( {updatedAt: 'desc'} )
            .then((data) => {
                res.json(data)
            })
            .catch((error) => {
                res.status(403).json({ message: error.message })
            })
    },

    //get lieu by Id
    getLieuById: (req, res) => {
        Lieu.findById(req.params.Id)
            .then((data) => {
                res.json(data)
            })
            .catch((error) => {
                res.status(403).json({ message: error.message })
            })

    },

    //get all Directions regionals and Supervision
    getAllDirectionsAndSupervions: async (req, res) => {
        try {
            const DR = await Lieu.find({ type_lieu: 'Direction régionale', deleted: false }, { _id: 1, code_lieu: 1, intitule_lieu: 1 })

            const SUP = await Lieu.find({ type_lieu: 'Supervision', deleted: false }, { _id: 0, code_lieu: 1, intitule_lieu: 1 })

            res.json({
                DR,
                SUP
            })

        } catch (error) {
            res.status(404).send({ message: error.message })
        }
    },

    // get coute lieu
    getCountLieu: async (req, res) => {
        await Lieu.countDocuments({ deleted: false })
            .then(data => {
                res.json(data)
            })
            .catch(error => {
                res.status(402).send({ message: error.message })
            })
    },

    //get all lieus
    // getAllLieu: async (req, res) => {
    //     await Lieu.aggregate([
    //         {
    //             $match: {
    //                 "deleted": false,
    //             }
    //         },
    //         {
    //             $addFields: {
    //                 "amenagement": {
    //                     $map: {
    //                         input: {
    //                             $filter: {
    //                                 input: "$amenagement",
    //                                 as: "amenagementfillter",
    //                                 cond: { $eq: ["$$amenagementfillter.deleted", false] }
    //                             }
    //                         },
    //                         as: "amenagementmap",
    //                         in: {
    //                             "nature_amenagement": "$$amenagementmap.nature_amenagement",
    //                             "deleted": "$$amenagementmap.deleted",
    //                             "_id": "$$amenagementmap._id",
    //                             "montant_amenagement": "$$amenagementmap.montant_amenagement",
    //                             "valeur_nature_chargeProprietaire": "$$amenagementmap.valeur_nature_chargeProprietaire",
    //                             "valeur_nature_chargeFondation": "$$amenagementmap.valeur_nature_chargeFondation",
    //                             "numero_facture": "$$amenagementmap.numero_facture",
    //                             "numero_bon_commande": "$$amenagementmap.numero_bon_commande",
    //                             "date_passation_commande" : "$$amenagementmap.date_passation_commande",
    //                             "evaluation_fournisseur" : "$$amenagementmap.evaluation_fournisseur",
    //                             "date_fin_travaux" : "$$amenagementmap.date_fin_travaux",
    //                             "images_apres_travaux" : "$$amenagementmap.images_apres_travaux",
    //                             "croquis_travaux" : "$$amenagementmap.croquis_travaux",
    //                             "fournisseur": {
    //                                 $filter: {
    //                                     input: "$$amenagementmap.fournisseur",
    //                                     as: "fournisseur",
    //                                     cond: { $eq: ["$$fournisseur.deleted", false] }
    //                                 }
    //                             }
    //                         }
    //                     }
    //                 },
    //                 "directeur_regional": {
    //                     $map: {
    //                         input: {
    //                             $filter: {
    //                                 input: "$directeur_regional",
    //                                 as: "directeur_regionalFillter",
    //                                 cond: { $eq: ["$$directeur_regionalFillter.deleted_directeur", false] }
    //                             }
    //                         },
    //                         as: "directeur_regionalMap",
    //                         in: {

    //                             "deleted_directeur": "$$directeur_regionalMap.deleted_directeur",
    //                             "_id": "$$directeur_regionalMap._id",
    //                             "matricule": "$$directeur_regionalMap.matricule",
    //                             "nom": "$$directeur_regionalMap.nom",
    //                             "prenom": "$$directeur_regionalMap.prenom"
    //                         }
    //                     }
    //                 }
    //             }
    //         }

    //     ])
    //         .then(data => {
    //             res.json(data)
    //         })
    //         .catch(error => {
    //             res.status(402).send({ message: error.message })
    //         })
    // },

    // get detail Lieu 
    detailLieu: async (req, res) => {
        await Lieu.aggregate([
            {
                $match: {
                    _id: mongoose.Types.ObjectId(req.params.Id),
                    "deleted": false
                }
            },
            {
                $addFields: {
                    "imgs_lieu_entrer":{ $slice:['$imgs_lieu_entrer',-1]},
                    "amenagement": {
                        $map: {
                            input: {
                                $filter: {
                                    input: "$amenagement",
                                    as: "amenagementfillter",
                                    cond: { $eq: ["$$amenagementfillter.deleted", false] }
                                }
                            },
                            as: "amenagementmap",
                            in: {
                                "nature_amenagement": "$$amenagementmap.nature_amenagement",
                                "deleted": "$$amenagementmap.deleted",
                                "_id": "$$amenagementmap._id",
                                "montant_amenagement": "$$amenagementmap.montant_amenagement",
                                "valeur_nature_chargeProprietaire": "$$amenagementmap.valeur_nature_chargeProprietaire",
                                "valeur_nature_chargeFondation": "$$amenagementmap.valeur_nature_chargeFondation",
                                "numero_facture": "$$amenagementmap.numero_facture",
                                "numero_bon_commande": "$$amenagementmap.numero_bon_commande",
                                "date_passation_commande": "$$amenagementmap.date_passation_commande",
                                "evaluation_fournisseur": "$$amenagementmap.evaluation_fournisseur",
                                "date_fin_travaux": "$$amenagementmap.date_fin_travaux",
                                "images_apres_travaux":{ $slice: ["$$amenagementmap.images_apres_travaux", -1]},
                                "croquis_travaux": {$slice: ["$$amenagementmap.croquis_travaux", -1]},
                                "fournisseur": {
                                    $filter: {
                                        input: "$$amenagementmap.fournisseur",
                                        as: "fournisseur",
                                        cond: { $eq: ["$$fournisseur.deleted", false] }
                                    }
                                }
                            }
                        }
                    },
                    "directeur_regional": {
                        $map: {
                            input: {
                                $filter: {
                                    input: "$directeur_regional",
                                    as: "directeur_regionalFillter",
                                    cond: { $eq: ["$$directeur_regionalFillter.deleted_directeur", false] }
                                }
                            },
                            as: "directeur_regionalMap",
                            in: {

                                "deleted_directeur": "$$directeur_regionalMap.deleted_directeur",
                                "_id": "$$directeur_regionalMap._id",
                                "matricule": "$$directeur_regionalMap.matricule",
                                "nom": "$$directeur_regionalMap.nom",
                                "prenom": "$$directeur_regionalMap.prenom"
                            }
                        }
                    }
                }
            }

        ])
            .then(data => {
                res.json(data[0])
            })
            .catch(error => {
                res.status(402).send({ message: error.message })
            })
    },
    // get lieu by contrat
    getContratByLieu: async (req, res) => {
        var _id = mongoose.Types.ObjectId(req.params.Id)
        await Contrat.findOne({ lieu:  _id , deleted: false } , 'taux_impot -_id')
        .then(data => {
                res.json([data])
            })
            .catch(error => {
                res.status(402).send({ message: error.message })
            })
    },
}


