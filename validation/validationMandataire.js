const Joi = require('joi')

const MandataireValidadtion = Joi.object({
    //Mandataire validation
    cin_mandataire: Joi
        .string()
        .required()
        .min(4)
        .max(8)
        .messages({
            'string.min': 'CIN mandataire doit être 4 charactères au minimum',
            'string.max': 'CIN mandataire doit être 8 charactères au maximum',
            'any.required': 'CIN mandataire est obligatoire'
        }),
    nom_prenom_mandataire: Joi
        .string()
        .max(250)
        .messages({
            'string.max': 'Nom et prénom de mandataire peut contient 250 charactères au maximum',
        }),
    raison_social_mandataire: Joi
        .string()
        .max(250)
        .messages({
            'string.max': 'Raison social de mandataire peut contient 250 charactères au maximum',
        }),
    telephone_mandataire: Joi
        .number()
        .integer()
        .min(1)
        .max(9999999999)
        .messages({
            'number.base': 'Téléphone de mandataire peut contient seulement des chiffres'
        }),
    fax_mandataire: Joi
        .number()
        .integer()
        .min(1)
        .max(9999999999)
        .messages({
            'number.base': 'Fax de mandataire peut contient seulement des chiffres'
        }),
    adresse_mandataire: Joi
        .string()
        .max(250)
        .messages({
            'string.max': `l'adresse de mandataire peut avoir 250 charactères au maximum`
        }),
    n_compte_bancaire_mandataire: Joi
        .number()
        .integer()
        .min(1)
        .max(999999999999999999999999)
        .required()
        .messages({
            'number.base': 'Numéro compte bancaire de mandataire peut contient seulement des chiffres',
            'any.required': 'Numéro compte bancaire de mandataire est obligatoire'
        })
})

module.exports = MandataireValidadtion;