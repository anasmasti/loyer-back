const Proprietaire = require('../../models/proprietaire/proprietaire.model')
const ProprietaireValidation = require('../../validation/proprietaire.validation')

module.exports = {

    // Modifier un propriétaire 
    putProprietaire: async (req, res, next) => {

        try {

            console.log(req.body);

            if (Object.keys(req.body).length === 0) return res.status(500).send({ message: `Contenu ne pas être vide` })

            // L'obligation d'au moin un cin ou passport ou carte sejour
            if (req.body.cin == '' && req.body.passport == '' && req.body.carte_sejour == '') {
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
                montant_loyer:req.body.montant_loyer,
                nom_agence_bancaire: req.body.nom_agence_bancaire,
                taux_impot: req.body.taux_impot,
                retenue_source: req.body.retenue_source,
                montant_apres_impot: req.body.montant_apres_impot,
                ville_rib: req.body.ville_rib,
                cle_rib: req.body.cle_rib,
                banque_rib: req.body.banque_rib,
                montant_avance_proprietaire: req.body.montant_avance_proprietaire,
                tax_avance_proprietaire: req.body.tax_avance_proprietaire,
                tax_par_periodicite: req.body.tax_par_periodicite,
                pourcentage: req.body.pourcentage,
                caution_par_proprietaire:  req.body.caution_par_proprietaire,
                is_mandataire: req.body.is_mandataire,
                proprietaire_list: req.body.proprietaire_list,
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

        } catch (error) {
            res.status(422).send({
                message: error.message || `Validation error: ${error}`
            })
        }

    },
}