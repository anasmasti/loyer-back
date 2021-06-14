const express = require('express');
const router = express.Router()
const Proprietaire = require('../models/proprietaire.model')
const ProprietaireValidation = require('../validation/validationProprietaire')


// Ajouter un propriétaire 
router.post('/', async (req, res, next) => {

    try {

        // L'obligation d'au moin un cin ou passport ou carte sejour
        if ((req.body.cin == '' && req.body.passport == '' && req.body.carte_sejour == '')) {
            return res.status(422).send({ message: `Propriétaire doit contenir au moin Cin ou Passport ou Carte séjour` }
            )
            // return (error) => res.send(`Propriétaire doit contenir au moin Cin ou Passport ou Carte séjour` || {message: error.message})
        }

        // Lancer Joi Validation
        const validatedProprietaire = await ProprietaireValidation.validateAsync(req.body)

        // La validation d'unicité du Proprietaire
        const ValidateCinProprietaire = await Proprietaire.findOne({ cin: req.body.cin })
        const ValidatePassportProprietaire = await Proprietaire.findOne({ passport: req.body.passport })
        const ValidateCarteSejourProprietaire = await Proprietaire.findOne({ carte_sejour: req.body.carte_sejour })

        if (ValidateCinProprietaire) {
            if (ValidateCinProprietaire.cin != '') return res.status(422).send({ message: `Cin est déja pris` })
        }
        if (ValidatePassportProprietaire) {
            if (ValidatePassportProprietaire.passport != '') return res.status(422).send({ message: `Passport est déja pris` })
        }
        if (ValidateCarteSejourProprietaire) {
            if (ValidateCarteSejourProprietaire.carte_sejour != '') return res.status(422).send({ message: `Carte séjour est déja pris` })
        }

        // Sauvgarder et envoyer  Proprietaire
        if (req.body.has_mandataire === true) {

            const mandataires = []
            let item = 0

            // Boucler sur touts les mandataire
            for (item in req.body.mandataire) {

                // La validation d'unicité du Mandataire
                const ValidateCinMandataire = await Proprietaire.findOne({ "mandataire.cin_mandataire": req.body.mandataire[item].cin_mandataire })
                const ValidateNumBancaireMandataire = await Proprietaire.findOne({ "mandataire.n_compte_bancaire_mandataire": req.body.mandataire[item].n_compte_bancaire_mandataire })

                if (ValidateCinMandataire) return res.status(422).send({ message: `CIN Mandataire: ${req.body.mandataire[item].cin_mandataire} est déja pris` })

                if (ValidateNumBancaireMandataire) return res.status(422).send({ messgae: `Numéro compte bancaire de mandataire: ${req.body.mandataire[item].n_compte_bancaire_mandataire} est déja pris` })

                // Ajouter touts les mandataires dans un tableau
                await mandataires.push({
                    cin_mandataire: req.body.mandataire[item].cin_mandataire,
                    nom_prenom_mandataire: req.body.mandataire[item].nom_prenom_mandataire,
                    raison_social_mandataire: req.body.mandataire[item].raison_social_mandataire,
                    telephone_mandataire: req.body.mandataire[item].telephone_mandataire,
                    fax_mandataire: req.body.mandataire[item].fax_mandataire,
                    adresse_mandataire: req.body.mandataire[item].adresse_mandataire,
                    n_compte_bancaire_mandataire: req.body.mandataire[item].n_compte_bancaire_mandataire
                })
            }

            const proprietaire = new Proprietaire(
                {
                    deleted: false,
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
                    mandataire: mandataires
                })

            await proprietaire.save()
                .then((data) => {
                    res.send(data)
                })
                .catch((error) => {
                    if (error.name == 'ValidationError') {
                        if (error.errors.n_compte_bancaire) return res.status(422).send({ message: `Numéro compte bancaire est déja pris` })
                    } else {
                        res.status(500).send({ message: `Error d'ajouter un propriétaire` || error })
                    }
                })
        }
        else {

            const proprietaire = new Proprietaire({
                deleted: false,
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
                    res.send(data)
                })
                .catch((error) => {
                    if (error.name == 'ValidationError') {
                        if (error.errors.n_compte_bancaire) return res.status(422).send({ message: `Numéro compte bancaire est déja pris` })
                    } else {
                        res.status(500).send({ message: `Error d'ajouter un propriétaire` || error })
                    }
                })
        }
    } catch (error) {
        res.status(422).send({
            message: error.message || `Validation error: ${error}`
        })
    }

});

// Modifier un propriétaire 
router.put('/:Id', async (req, res, next) => {

    try {

        if (Object.keys(req.body).length === 0) return res.status(500).send({ message: `Contenu ne pas être vide` })

        // L'obligation d'au moin un cin ou passport ou carte sejour
        if ((req.body.cin && req.body.passport && req.body.carte_sejour) == null) {
            return res.status(422).send({ message: `Propriétaire doit contenir au moin Cin ou Passport ou Carte séjour` })
        }

        // Joi Validation
        const validatedProprietaire = await ProprietaireValidation.validateAsync(req.body)

        // La validation d'unicité du Proprietaire
        const ValidateCinProprietaire = await Proprietaire.findOne({ cin: req.body.cin })
        const ValidatePassportProprietaire = await Proprietaire.findOne({ passport: req.body.passport })
        const ValidateCarteSejourProprietaire = await Proprietaire.findOne({ carte_sejour: req.body.carte_sejour })

        if (ValidateCinProprietaire) {
            if (ValidateCinProprietaire.cin == req.body.cin &&
                ValidateCinProprietaire.cin != '' &&
                ValidateCinProprietaire._id != req.params.Id) {

                return res.status(422).send({ message: 'CIN est déja pris' })
            }
        }

        if (ValidatePassportProprietaire) {
            if (ValidatePassportProprietaire.passport == req.body.passport &&
                ValidatePassportProprietaire.passport != '' &&
                ValidatePassportProprietaire._id != req.params.Id) {

                return res.status(422).send({ message: 'Passport est déja pris' })
            }
        }

        if (ValidateCarteSejourProprietaire) {
            if (ValidateCarteSejourProprietaire.carte_sejour == req.body.carte_sejour &&
                ValidateCarteSejourProprietaire.carte_sejour != '' &&
                ValidateCarteSejourProprietaire._id != req.params.Id) {

                return res.status(422).send({ message: 'Carte séjour est déja pris' })
            }
        }

        if (req.body.has_mandataire === true) {

            const mandataires = []
            let item = 0
            for (item in req.body.mandataire) {

                // La validation d'unicité du Mandataire
                const ValidateCinMandataire = await Proprietaire.findOne({ "mandataire.cin_mandataire": req.body.mandataire[item].cin_mandataire })
                const ValidateNumBancaireMandataire = await Proprietaire.findOne({ "mandataire.n_compte_bancaire_mandataire": req.body.mandataire[item].n_compte_bancaire_mandataire })

                if (ValidateCinMandataire) {
                    for (let element = 0; element < ValidateCinMandataire.mandataire.length; element++) {
                        if (ValidateCinMandataire.mandataire[element].cin_mandataire == req.body.mandataire[item].cin_mandataire && ValidateCinMandataire._id != req.params.Id) {

                            return res.status(422).send({ message: `CIN Mandataire: ${req.body.mandataire[item].cin_mandataire} est déja pris` })
                        }
                    }
                }

                if (ValidateNumBancaireMandataire) {
                    for (let element = 0; element < ValidateNumBancaireMandataire.mandataire.length; element++) {
                        if (ValidateNumBancaireMandataire.mandataire[element].n_compte_bancaire_mandataire == req.body.mandataire[item].n_compte_bancaire_mandataire && ValidateNumBancaireMandataire._id != req.params.Id) {

                            return res.status(422).send({ message: `Numéro compte bancaire de Mandataire: ${req.body.mandataire[item].n_compte_bancaire_mandataire} est déja pris` })
                        }
                    }
                }

                await mandataires.push({
                    cin_mandataire: req.body.mandataire[item].cin_mandataire,
                    nom_prenom_mandataire: req.body.mandataire[item].nom_prenom_mandataire,
                    raison_social_mandataire: req.body.mandataire[item].raison_social_mandataire,
                    telephone_mandataire: req.body.mandataire[item].telephone_mandataire,
                    fax_mandataire: req.body.mandataire[item].fax_mandataire,
                    adresse_mandataire: req.body.mandataire[item].adresse_mandataire,
                    n_compte_bancaire_mandataire: req.body.mandataire[item].n_compte_bancaire_mandataire
                })
            }

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
                mandataire: mandataires
            })
                .then((data) => {
                    res.send(data)
                })
                .catch((error) => {
                    if (error.code === 11000) {

                        return res.status(422).send({ message: `Numéro compte bancaire est déja pris` })

                    } else {
                        return res.status(500).send({ message: `Error de modification le propriétaire` || error })
                    }
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
                    res.send(data)
                })
                .catch((error) => {
                    if (error.code == 11000) {

                        return res.status(422).send({ message: `Numéro compte bancaire est déja pris` })

                    } else {
                        return res.status(500).send({ message: `Error de modification le propriétaire` || error })
                    }
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
    await Proprietaire.find({ deleted: false })
        .then((data) => {
            res.send(data)
        })
        .catch((error) => {
            res.status(200).send({ message: `Aucun Propriétaire trouvé` || error })
        })
});

//Chercher propriétaires par ID
router.get('/:Id', async (req, res) => {
    await Proprietaire.findById(req.params.Id)
        .then((data) => {
            res.send(data)
        })
        .catch((error) => {
            res.status(500).send({ message: `Aucun Propriétaire trouvé` || error })
        })
});

//Supprimer propriétaires par ID
router.put('/delete/:Id', async (req, res) => {
    await Proprietaire.findByIdAndUpdate(req.params.Id, {
        deleted: req.body.deleted
    })
        .then(() => {
            res.json({ message: "Deleted" })
        })
        .catch(error => {
            res.status(400).send({ message: `Error de suppression le propriétaire` || error })
        })
})

module.exports = router;