const { json } = require('body-parser');
const Lieu = require('../../models/lieu/lieu.model')


module.exports = {
    ajouterLieu: async(req, res, next) => {
        let data = await JSON.parse(req.body.data)
        console.log(data);
        const codeLieuExist = await Lieu.findOne({ code_lieu: data.code_lieu })
        // const lieuExist = await Lieu.findById({ _id: data._id })
        // const etatExist = lieuExist && lieuExist.etat
        
        // if (codeLieuExist && codeLieuExist.code_lieu != "" && codeLieuExist.code_lieu != null && etatExist == 'dispo') {
        //     return res.status(422).send({ message: 'Le code lieu et deja pris' })
        // }

        if (codeLieuExist && codeLieuExist.code_lieu != "" && codeLieuExist.code_lieu != null ) {
            return res.status(422).send({ message: 'Le code lieu et deja pris' })
        }

        if (data.has_amenagements == true) {
            let amenagements = [],
                imagesLieu = [],
                fournisseur = [],
                imagesAmenagement = [],
                imagesCroquis = [],
                directeurRegional = [],
                item = 0,
                j = 0,
                i = 0,
                k = 0
            if (req.files) {
                if (req.files.imgs_lieu_entrer) {
                    for (item in req.files.imgs_lieu_entrer) {
                        imagesLieu.push({ image: req.files.imgs_lieu_entrer[item].path })
                    }
                }
            }
            //add amenagements in array
            for (item in data.amenagement) {
                let idmData = data.amenagement[item].idm
                let idm = idmData.replace('.pdf', '')
                    //add fournisseurs in amenagements array
                for (j in data.amenagement[item].fournisseur) {
                    fournisseur.push({
                        nom: data.amenagement[item].fournisseur[j].nom,
                        prenom: data.amenagement[item].fournisseur[j].prenom,
                        amenagements_effectuer: data.amenagement[item].fournisseur[j].amenagements_effectuer
                    })
                }
                if (req.files) {
                    if (req.files.imgs_amenagement) {
                        for (i in req.files.imgs_amenagement) {
                            if (req.files.imgs_amenagement[i].originalname == data.amenagement[item].idm)
                                imagesAmenagement.push({
                                    image: req.files.imgs_amenagement[i].path,
                                    image_idm: idm
                                })
                        }
                    }
                    if (req.files.imgs_croquis) {
                        for (k in req.files.imgs_croquis) {
                            if (req.files.imgs_croquis[k].originalname == data.amenagement[item].idm) {
                                imagesCroquis.push({
                                    image: req.files.imgs_croquis[k].path,
                                    image_idm: idm
                                })
                            }
                        }
                    }
                }
                amenagements.push({
                    idm: idm,
                    nature_amenagement: data.amenagement[item].nature_amenagement,
                    montant_amenagement: data.amenagement[item].montant_amenagement,
                    valeur_nature_chargeProprietaire: data.amenagement[item].valeur_nature_chargeProprietaire,
                    valeur_nature_chargeFondation: data.amenagement[item].valeur_nature_chargeFondation,
                    numero_facture: data.amenagement[item].numero_facture,
                    numero_bon_commande: data.amenagement[item].numero_bon_commande,
                    date_passation_commande: data.amenagement[item].date_passation_commande,
                    evaluation_fournisseur: data.amenagement[item].evaluation_fournisseur,
                    date_fin_travaux: data.amenagement[item].date_fin_travaux,
                    date_livraison_local: data.amenagement[item].date_livraison_local,
                    images_apres_travaux: imagesAmenagement,
                    croquis_travaux: imagesCroquis,
                    fournisseur: fournisseur
                })
                fournisseur = []
                imagesAmenagement = []
                imagesCroquis = []
            }

            for (item in data.directeur_regional) {
                directeurRegional.push({
                    matricule: data.directeur_regional[item].matricule,
                    nom: data.directeur_regional[item].nom,
                    prenom: data.directeur_regional[item].prenom,
                    deleted_directeur: false
                })
            }

            const lieu = new Lieu({
                code_lieu: data.code_lieu,
                intitule_lieu: data.intitule_lieu,
                intitule_DR: data.intitule_DR,
                adresse: data.adresse,
                ville: data.ville,
                code_localite: data.code_localite,
                desc_lieu_entrer: data.desc_lieu_entrer,
                imgs_lieu_entrer: imagesLieu,
                has_amenagements: data.has_amenagements,
                amenagement: amenagements,
                superficie: data.superficie,
                telephone: data.telephone,
                fax: data.fax,
                etage: data.etage,
                type_lieu: data.type_lieu,
                code_rattache_DR: data.code_rattache_DR,
                code_rattahce_SUP: data.code_rattahce_SUP,
                intitule_rattache_SUP_PV: data.intitule_rattache_SUP_PV,
                centre_cout_siege: data.centre_cout_siege,
                categorie_pointVente: data.categorie_pointVente,
                etat_logement_fonction: data.etat_logement_fonction,
                // etat: data.etat,
                directeur_regional: directeurRegional,
                deleted: false
            })
            await lieu.save()
                .then((data) => {
                    res.json(data)
                })
                .catch((error) => {
                    res.status(402).send({ message: error.message })
                })

        } else {

            let directeurRegional = [],
                imagesLieu = [],
                item = 0

            if (req.files) {
                if (req.files.imgs_lieu_entrer) {
                    for (item in req.files.imgs_lieu_entrer) {
                        imagesLieu.push({ image: req.files.imgs_lieu_entrer[item].path })
                    }
                }
            }

            for (item in data.directeur_regional) {
                directeurRegional.push({
                    matricule: data.directeur_regional[item].matricule,
                    nom: data.directeur_regional[item].nom,
                    prenom: data.directeur_regional[item].prenom,
                    deleted_directeur: false
                })
            }

            const lieu = new Lieu({
                code_lieu: data.code_lieu,
                intitule_lieu: data.intitule_lieu,
                intitule_DR: data.intitule_DR,
                adresse: data.adresse,
                ville: data.ville,
                code_localite: data.code_localite,
                desc_lieu_entrer: data.desc_lieu_entrer,
                imgs_lieu_entrer: imagesLieu,
                has_amenagements: data.has_amenagements,
                superficie: data.superficie,
                telephone: data.telephone,
                fax: data.fax,
                etage: data.etage,
                type_lieu: data.type_lieu,
                code_rattache_DR: data.code_rattache_DR,
                code_rattahce_SUP: data.code_rattahce_SUP,
                intitule_rattache_SUP_PV: data.intitule_rattache_SUP_PV,
                centre_cout_siege: data.centre_cout_siege,
                categorie_pointVente: data.categorie_pointVente,
                etat_logement_fonction: data.etat_logement_fonction,
                directeur_regional: directeurRegional,
                // etat: data.etat,
                deleted: false
            })
            await lieu.save()
                .then((data) => {
                    res.json(data)
                })
                .catch((error) => {
                    res.status(402).send({ message: error.message })
                })
        }
    }
}