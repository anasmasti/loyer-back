const Proprietaire = require('../../models/proprietaire/proprietaire.model')
const Lieu = require('../../models/lieu/lieu.model')
const Foncier = require('../../models/foncier/foncier.model')
const Contrat = require('../../models/contrat/contrat.model')

module.exports = {
    countAll: async (req, res) => {
        let totalCountAmenagements = 0, totalCountFournisseur = 0
        try {
            const countProprietaire = await Proprietaire.countDocuments({ deleted: false })
            const countLieu = await Lieu.countDocuments({ deleted: false })
            const countFoncier = await Foncier.countDocuments({ deleted: false })
            const countContrat = await Contrat.countDocuments({ deleted: false })
            const countAmenagement = await Lieu.aggregate([{ $match: { deleted: false, has_amenagements: true } }, {

                $addFields: {
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
                                "images_apres_travaux": "$$amenagementmap.images_apres_travaux",
                                "croquis_travaux": "$$amenagementmap.croquis_travaux",
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
            {
                $project: { amenagement: 1 }
            }
            ])


            for (let i = 0; i < countAmenagement.length; i++) {
                let lengthOfEachAmenageme = countAmenagement[i].amenagement;
                totalCountAmenagements += await lengthOfEachAmenageme.length;
                for (let f = 0; f < countAmenagement[i].amenagement.length; f++) {
                    let lengthOfEachFournisseur = countAmenagement[i].amenagement[f].fournisseur;
                    totalCountFournisseur += await lengthOfEachFournisseur.length;
                }
            }

            res.json({
                countProprietaire,
                countLieu,
                countFoncier,
                countContrat,
                totalCountAmenagements,
                totalCountFournisseur
            })

        } catch (error) {
            res.status(404).send({ message: error.message })
        }
    }
}