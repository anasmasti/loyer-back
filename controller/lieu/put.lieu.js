const Lieu = require('../../models/lieu/lieu.model')

module.exports = {
    modifierLieu: async (req, res, next) => {

        const codeLieuExist = await Lieu.findOne({code_lieu :req.body.code_lieu})

        if (codeLieuExist) return res.status(422).send({ message: 'Le code lieu et deja pris' })


        if (req.body.has_amenagements == true) {
            let imagesLieu = []
            let imagesAmenagement = []
            let imagesCroquis = []
            let amenagements = []
            let item = 0

            if (req.files.imgs_lieu_entrer) {
                for (item in req.files.imgs_lieu_entrer) {
                    await imagesLieu.push({ image: req.files.imgs_lieu_entrer[item].path })
                }
            }

            if (req.files.imgs_amenagement) {
                for (item in req.files.imgs_amenagement) {
                    await imagesAmenagement.push({ img_Amenagement: req.files.imgs_amenagement[item].path })
                }
            }

            if (req.files.imgs_croquis) {
                for (item in req.files.imgs_croquis) {
                    await imagesCroquis.push({ img_Croquis: req.files.imgs_croquis[item].path })
                }
            }

            for (item in req.body.amenagements) {
                await amenagements.push({
                    nature_amenagement: req.body.amenagements[item].nature_amenagement,
                    montant_amenagement: req.body.amenagements[item].montant_amenagement,
                    valeur_nature_chargeProprietaire: req.body.amenagements[item].valeur_nature_chargeProprietaire,
                    valeur_nature_chargeFondation: req.body.amenagements[item].valeur_nature_chargeFondation,
                    numero_facture: req.body.amenagements[item].numero_facture,
                    numero_bon_commande: req.body.amenagements[item].numero_bon_commande,
                    date_passation_commande: req.body.amenagements[item].date_passation_commande,
                    evaluation_fournisseur: req.body.amenagements[item].evaluation_fournisseur,
                    date_fin_travaux: req.body.amenagements[item].date_fin_travaux,
                    date_livraison_local: req.body.amenagements[item].date_livraison_local,
                    images_apres_travaux: imagesAmenagement,
                    images_croquis: imagesCroquis
                })
            }

            await Lieu.findByIdAndUpdate(req.params.Id, {
                code_lieu: req.body.code_lieu,
                intitule_lieu: req.body.intitule_lieu,
                intitule_DR: req.body.intitule_DR,
                adresse: req.body.adresse,
                ville: req.body.ville,
                code_localite: req.body.code_localite,
                desc_lieu_entrer: req.body.desc_lieu_entrer,
                imgs_lieu_entrer: imagesLieu,
                has_amenagements: req.body.amenagements,
                amenagements: amenagements,
                superficie: req.body.superficie,
                telephone: req.body.telephone,
                fax: req.body.fax,
                etage: req.body.etage,
                type_lieu: req.body.type_lieu,
                code_rattache_DR: req.body.code_rattache_DR,
                code_rattahce_SUP: req.body.code_rattahce_SUP,
                intitule_rattache_SUP_PV: req.body.intitule_rattache_SUP_PV,
                centre_cout_siege: req.body.centre_cout_siege,
                categorie_pointVente: req.body.categorie_pointVente,
                deleted: false
            })
                .then((data) => {
                    res.json(data)
                })
                .catch((error) => {
                    res.status(402).send({ message: error.message })
                })
        } else {

            let imagesLieu = []
            let item = 0

            if (req.files) {
                if (req.files.imgs_lieu_entrer) {
                    for (item in req.files.imgs_lieu_entrer) {
                        await imagesLieu.push({ image: req.files.imgs_lieu_entrer[item].path })
                    }
                }
            }

            await Lieu.findByIdAndUpdate({_id: req.params.Id}, {
                code_lieu: req.body.code_lieu,
                intitule_lieu: req.body.intitule_lieu,
                intitule_DR: req.body.intitule_DR,
                adresse: req.body.adresse,
                ville: req.body.ville,
                code_localite: req.body.code_localite,
                desc_lieu_entrer: req.body.desc_lieu_entrer,
                imgs_lieu_entrer: imagesLieu,
                has_amenagements: req.body.amenagements,
                superficie: req.body.superficie,
                telephone: req.body.telephone,
                fax: req.body.fax,
                etage: req.body.etage,
                type_lieu: req.body.type_lieu,
                code_rattache_DR: req.body.code_rattache_DR,
                code_rattahce_SUP: req.body.code_rattahce_SUP,
                intitule_rattache_SUP_PV: req.body.intitule_rattache_SUP_PV,
                centre_cout_siege: req.body.centre_cout_siege,
                categorie_pointVente: req.body.categorie_pointVente,
                deleted: false
            })
                .then((data) => {
                    res.json(data)
                })
                .catch((error) => {
                    res.status(402).send({ message: error.message })
                })
        }
    }
}