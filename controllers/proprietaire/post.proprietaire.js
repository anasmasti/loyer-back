const Proprietaire = require('../../models/proprietaire/proprietaire.model')
const ProprietaireValidation = require('../../validation/proprietaire.validation')
const Lieu = require('../../models/lieu/lieu.model')

module.exports = {

    // Ajouter un propriétaire 
    postProprietaire: async (req, res) => {

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
                    montant_loyer:req.body.montant_loyer,
                    nom_agence_bancaire: req.body.nom_agence_bancaire,
                    mandataire: req.body.mandataire,
                })

                await proprietaire.save()
                    .then(async (data) => {
                        await Lieu.findByIdAndUpdate({_id: req.params.Id_lieu},{$push: {proprietaire: data._id}})
                        res.json(data)
                    })
                    .catch((error) => {
                        if (error.name == 'ValidationError') {
                            if (error.errors.n_compte_bancaire) return res.status(422).send({ message: `Numéro compte bancaire est déja pris` })
                        } else {
                            res.status(500).send({ message: `Error d'ajouter un propriétaire` || error })
                        }
                    })
            
        } catch (error) {
            res.status(422).send({
                message: error.message || `Validation error: ${error}`
            })
        }

    },
}
