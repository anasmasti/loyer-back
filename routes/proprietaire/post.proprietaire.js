const Proprietaire = require('../../models/proprietaire.model')
const ProprietaireValidation = require('../../validation/validationProprietaire')

module.exports = {

    // Ajouter un propriétaire 
    PostProprietaire: async (req, res) => {

        try {

            // L'obligation d'au moin un cin ou passport ou carte sejour
            if ((req.body.cin == '' && req.body.passport == '' && req.body.carte_sejour == '')) {
                return res.status(422).send({ message: `Propriétaire doit contenir au moin Cin ou Passport ou Carte séjour` }
                )
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

    },
}
