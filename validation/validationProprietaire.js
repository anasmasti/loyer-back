
const Joi = require('joi')
const mandataireValidation = require('./validationMandataire')

const ProprietaireValidation = Joi.object({
    // Proprietaire validation
    cin: Joi
        .string()
        .empty('')
        .min(4)
        .max(8),
    passport: Joi
        .string()
        .empty('')
        .min(4)
        .max(8),
    carte_sejour: Joi
        .string()
        .empty('')
        .min(4)
        .max(8),
    nom_prenom: Joi
        .string()
        .min(4)
        .max(50),
    raison_social: Joi
        .string()
        .min(2)
        .max(250),
    n_registre_commerce: Joi
        .string()
        .min(2)
        .max(50),
    telephone: Joi
        .number()
        .integer()
        .min(1)
        .max(99999999999),
    fax: Joi
        .number()
        .integer()
        .min(1)
        .max(99999999999),
    adresse: Joi
        .string()
        .max(250),
    n_compte_bancaire: Joi
        .number()
        .integer()
        .required()
        .min(1)
        .max(999999999999999999999999),
    banque: Joi
        .string()
        .max(250),
    nom_agence_bancaire: Joi
        .string()
        .max(250),
    has_mandataire: Joi
        .boolean(),
    mandataire: Joi
        .when('has_mandataire', {
            is: true,
            then: mandataireValidation
        })

}).or('cin', 'passport', 'carte_sejour').required()

module.exports = ProprietaireValidation;