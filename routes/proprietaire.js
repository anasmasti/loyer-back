const express = require('express');
const router = express.Router()
const Proprietaire = require('../models/proprietaire.model')
const ProprietaireValidation = require('../validation/validationProprietaire')


// Ajouter un propriétaire 
router.post('/', async (req, res) => {

    try {
        const validatedProprietaire = await ProprietaireValidation.validateAsync(req.body)

        if (req.body.has_mandataire == true) {
            const proprietaire = new Proprietaire(
                {
                    cin: req.body.cin,
                    passport: req.body.passport,
                    carte_sejour: req.body.carte_sejour,
                    nom_prenom: req.body.nom_prenom,
                    raison_social: req.body.raison_social,
                    n_registre_commerce: req.body.n_registre_commerce,
                    telephone: req.body.telephone,
                    fax: req.body.fax,
                    adresse: req.body.adresse,
                    n_compte_bancaire: req.body.n_compte_bancaire,
                    banque: req.body.banque,
                    nom_agence_bancaire: req.body.nom_agence_bancaire,
                    has_mandataire: req.body.has_mandataire,
                    mandataire: {
                        cin: req.body.mandataire.cin_mandataire,
                        nom_prenom: req.body.mandataire.nom_prenom_mandataire,
                        raison_social: req.body.mandataire.raison_social_mandataire,
                        telephone: req.body.mandataire.telephone_mandataire,
                        fax: req.body.mandataire.fax_mandataire,
                        adresse: req.body.mandataire.adresse_mandataire,
                        n_compte_bancaire: req.body.mandataire.n_compte_bancaire_mandataire
                    }
                }
            )
            await proprietaire.save()
                .then((data) => {
                    res.json(data)
                })
                .catch((error) => {
                    if (error.name == 'ValidationError') {
                        res.send('CIN ou Passport ou Carte séjour et déja utilisé')
                    } else {
                        res.status(500).json(`Cant send data : ${error}`)

                    }
                })
        }
        else {
            const proprietaire = new Proprietaire({
                cin: req.body.cin,
                passport: req.body.passport,
                carte_sejour: req.body.carte_sejour,
                nom_prenom: req.body.nom_prenom,
                raison_social: req.body.raison_social,
                n_registre_commerce: req.body.n_registre_commerce,
                telephone: req.body.telephone,
                fax: req.body.fax,
                adresse: req.body.adresse,
                n_compte_bancaire: req.body.n_compte_bancaire,
                banque: req.body.banque,
                nom_agence_bancaire: req.body.nom_agence_bancaire,
                has_mandataire: req.body.has_mandataire,
            })

            await proprietaire.save()
                .then((data) => {
                    res.json(data)
                })
                .catch((error) => {
                    res.status(500).json(`Cant send data${error}`)
                })
        }
    } catch (error) {
        res.status(422).send({
            message: error.message || `Validation error: ${error}`
        })
    }

});

// Modifier un propriétaire 
router.put('/:Id', async (req, res) => {

    if (Object.keys(req.body).length === 0) return res.status(500).json(`Content can't be empty`)
    try {

        const validatedProprietaire = await ProprietaireValidation.validateAsync(req.body)

        if (req.body.has_mandataire == true) {
            await Proprietaire.findByIdAndUpdate(req.params.Id, {
                cin: req.body.cin,
                passport: req.body.passport,
                carte_sejour: req.body.carte_sejour,
                nom_prenom: req.body.nom_prenom,
                raison_social: req.body.raison_social,
                n_registre_commerce: req.body.n_registre_commerce,
                telephone: req.body.telephone,
                fax: req.body.fax,
                adresse: req.body.adresse,
                n_compte_bancaire: req.body.n_compte_bancaire,
                banque: req.body.banque,
                nom_agence_bancaire: req.body.nom_agence_bancaire,
                has_mandataire: req.body.has_mandataire,
                mandataire: {
                    cin: req.body.mandataire.cin_mandataire,
                    nom_prenom: req.body.mandataire.nom_prenom_mandataire,
                    raison_social: req.body.mandataire.raison_social_mandataire,
                    telephone: req.body.mandataire.telephone_mandataire,
                    fax: req.body.mandataire.fax_mandataire,
                    adresse: req.body.mandataire.adresse_mandataire,
                    n_compte_bancaire: req.body.mandataire.n_compte_bancaire_mandataire
                }
            })
                .then((data) => {
                    res.json(data)
                })
                .catch((error) => {
                    res.status(500).json(`Cannot modify with Id : ${req.params.Id}` + error)
                })
        }
        else {
            await Proprietaire.findByIdAndUpdate(req.params.Id, {
                cin: req.body.cin,
                passport: req.body.passport,
                carte_sejour: req.body.carte_sejour,
                nom_prenom: req.body.nom_prenom,
                raison_social: req.body.raison_social,
                n_registre_commerce: req.body.n_registre_commerce,
                telephone: req.body.telephone,
                fax: req.body.fax,
                adresse: req.body.adresse,
                n_compte_bancaire: req.body.n_compte_bancaire,
                banque: req.body.banque,
                nom_agence_bancaire: req.body.nom_agence_bancaire,
                has_mandataire: req.body.has_mandataire,
                mandataire: []
            })
                .then((data) => {
                    res.json(data)
                })
                .catch((error) => {
                    res.status(500).json(`Cannot modify with Id : ${req.params.Id}` + error)
                })
        }
    } catch (error) {
        res.status(422).send({
            message: error.message || `Validation error: ${error}`
        })
    }
});

//Chercher touts les propriétaires
router.get('/', async (req, res) => {
    await Proprietaire.find()
        .then((data) => {
            res.json(data)
        })
        .catch((error) => {
            res.status(200).json(`Cannot get data Or no data found :  ${error}`)
        })
});

//Chercher propriétaires par ID
router.get('/:Id', async (req, res) => {
    await Proprietaire.findById(req.params.Id)
        .then((data) => {
            res.json(data)
        })
        .catch((error) => {
            res.status(500).json(`Not found with Id : ${req.params.Id}` + error)
        })
});

//Supprimer propriétaires par ID
router.delete('/:Id', async (req, res) => {
    await Proprietaire.findByIdAndDelete(req.params.Id)
        .then(() => {
            res.json(`Deleted`)
        })
        .catch(error => {
            res.status(400).json(`Cannot delete with Id : ${req.params.Id}` + error)
        })
})

module.exports = router;