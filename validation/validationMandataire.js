const Joi = require('joi')

const MandataireValidadtion = Joi.object({
    //Mandataire validation
    cin_mandataire: Joi
        .string()
        .required()
        .min(4)
        .max(8),
    nom_prenom_mandataire: Joi
        .string()
        .max(250),
    raison_social_mandataire: Joi
        .string()
        .max(250),
    telephone_mandataire: Joi
        .number()
        .integer()
        .min(1)
        .max(9999999999),
    fax_mandataire: Joi
        .number()
        .integer()
        .min(1)
        .max(9999999999),
    adresse_mandataire: Joi
        .string()
        .max(250),
    n_compte_bancaire_mandataire: Joi
        .number()
        .integer()
        .min(1)
        .max(999999999999999999999999)
        .required()
})

module.exports = MandataireValidadtion;