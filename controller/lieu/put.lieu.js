const Lieu = require('../../models/lieu/lieu.model')

module.exports = {
    modifierLieu: async (req, res, next) => {

        const codeLieuExist = await Lieu.findOne({ code_lieu: req.body.code_lieu })

        if (codeLieuExist && codeLieuExist._id != req.params.Id) return res.status(422).send({ message: 'Le code lieu et deja pris' })


        if (req.body.has_amenagements == true) {
            let imagesLieu = []
            let imagesAmenagement = []
            let imagesCroquis = []
            let amenagements = []
            let fournisseur = []
            let directeurRegional = []
            let item = 0
            let j = 0

            if (req.files) {
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
            }
            for (item in req.body.amenagement) {

                //update fournisseurs in amenagements array
                for (j in req.body.amenagement[item].fournisseur) {
                    await fournisseur.push({
                        nom: req.body.amenagement[item].fournisseur[j].nom,
                        prenom: req.body.amenagement[item].fournisseur[j].prenom,
                        amenagements_effectuer: req.body.amenagement[item].fournisseur[j].amenagements_effectuer
                    })
                }
                await amenagements.push({
                    nature_amenagement: req.body.amenagement[item].nature_amenagement,
                    montant_amenagement: req.body.amenagement[item].montant_amenagement,
                    valeur_nature_chargeProprietaire: req.body.amenagement[item].valeur_nature_chargeProprietaire,
                    valeur_nature_chargeFondation: req.body.amenagement[item].valeur_nature_chargeFondation,
                    numero_facture: req.body.amenagement[item].numero_facture,
                    numero_bon_commande: req.body.amenagement[item].numero_bon_commande,
                    date_passation_commande: req.body.amenagement[item].date_passation_commande,
                    evaluation_fournisseur: req.body.amenagement[item].evaluation_fournisseur,
                    date_fin_travaux: req.body.amenagement[item].date_fin_travaux,
                    date_livraison_local: req.body.amenagement[item].date_livraison_local,
                    images_apres_travaux: imagesAmenagement,
                    images_croquis: imagesCroquis,
                    fournisseurs: fournisseur
                })
                fournisseur = []
            }

            for(item in req.body.directeur_regional){
                await directeurRegional.push({
                    matricule: req.body.directeur_regional[item].matricule,
                    nom: req.body.directeur_regional[item].nom,
                    prenom: req.body.directeur_regional[item].prenom,
                    deleted_directeur: false
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
                has_amenagements: req.body.has_amenagements,
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
                etat_logement_fonction:req.body.etat_logement_fonction,
                directeur_regional: directeurRegional,
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
            let directeurRegional = []
            let item = 0

            if (req.files) {
                if (req.files.imgs_lieu_entrer) {
                    for (item in req.files.imgs_lieu_entrer) {
                        await imagesLieu.push({ image: req.files.imgs_lieu_entrer[item].path })
                    }
                }
            }

            for(item in req.body.directeur_regional){
                await directeurRegional.push({
                    matricule: req.body.directeur_regional[item].matricule,
                    nom: req.body.directeur_regional[item].nom,
                    prenom: req.body.directeur_regional[item].prenom,
                    deleted_directeur: false
                })
            }

            await Lieu.findByIdAndUpdate({ _id: req.params.Id }, {
                code_lieu: req.body.code_lieu,
                intitule_lieu: req.body.intitule_lieu,
                intitule_DR: req.body.intitule_DR,
                adresse: req.body.adresse,
                ville: req.body.ville,
                code_localite: req.body.code_localite,
                desc_lieu_entrer: req.body.desc_lieu_entrer,
                imgs_lieu_entrer: imagesLieu,
                has_amenagements: req.body.has_amenagements,
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
                etat_logement_fonction:req.body.etat_logement_fonction,
                directeur_regional: directeurRegional,
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