const moment = require('moment');
const Contrat = require('../../models/contrat/contrat.model');
const Foncier = require('../../models/foncier/foncier.model')
const generatePdf = require('../helpers/generatePdf')


module.exports = {
    amenagementReporting: async (_, res) => {
        let today = new Date();
        let dateRealisation = moment(today).format('YYYY-MM-DD');

        await Contrat.aggregate([
            {
                $match: {
                    "deleted": false
                }
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
                $project: {
                    numero_contrat: 1,
                    deleted: 1,
                    foncier: {
                        $map: {
                            input: "$foncier",
                            as: "fonciermap",
                            in: {
                                deleted: "$$fonciermap.deleted",
                                has_amenagements: "$$fonciermap.has_amenagements",
                                has_contrat: "$$fonciermap.has_contrat",
                                lieu: "$$fonciermap.lieu",
                                type_lieu: "$$fonciermap.type_lieu",
                                amenagement: {
                                    $map: {
                                        input: {
                                            $filter: {
                                                input: "$$fonciermap.amenagement",
                                                as: "amenagementfillter",
                                                cond: { $and: [
                                                   { $eq: ["$$amenagementfillter.deleted", false]},
                                                   { $gte: ["$$amenagementfillter.date_fin_travaux", dateRealisation] },
                                                ]}
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
                                            "date_livraison_local": "$$amenagementmap.date_livraison_local",
                                            "images_apres_travaux": { $slice: ["$$amenagementmap.images_apres_travaux", -1] },
                                            "croquis_travaux": { $slice: ["$$amenagementmap.croquis_travaux", -1] },
                                            "fournisseur": {
                                                $filter: {
                                                    input: "$$amenagementmap.fournisseur",
                                                    as: "fournisseur",
                                                    cond: { $eq: ["$$fournisseur.deleted", false] }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                    }
                }
            }
        ])
            .then((data) => {
                res.json(data)
                generatePdf(data, 'aménagements_réalisés')
            })
            .catch((error) => {
                res.status(402).json({ message: error.message });
            })

    }
}