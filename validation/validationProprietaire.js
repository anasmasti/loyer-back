
const Joi = require('joi')
const mandataireValidation = require('./validationMandataire')

const ProprietaireValidation = Joi.object({
    // Proprietaire validation
    cin: Joi
        .string()
        .empty('')
        .min(4)
        .max(8)
        .messages({
            'string.base': 'CIN doit être text et numéro',
            'string.min': 'CIN doit être 4 charactères au minimum',
            'string.max': 'CIN doit être 8 charactères au maximum'
        }),
    passport: Joi
        .string()
        .empty('')
        .min(4)
        .max(8)
        .messages({
            'string.base': 'passport doit être text et numéro',
            'string.min': 'passport doit être 4 charactères au minimum',
            'string.max': 'passport doit être 8 charactères au maximum'
        }),
    carte_sejour: Joi
        .string()
        .empty('')
        .min(4)
        .max(8)
        .messages({
            'string.base': 'carte séjour doit être text et numéro',
            'string.min': 'carte séjour doit être 4 charactères au minimum',
            'string.max': 'carte séjour doit être 8 charactères au maximum'
        }),
    nom_prenom: Joi
        .string()
        .min(4)
        .max(50)
        .messages({
            'string.min': 'Nom et Prénom doit être 4 charactères au minimum',
            'string.max': 'Nom et Prénom doit être 50 charactères au maximum'
        }),
    raison_social: Joi
        .string()
        .min(2)
        .max(250)
        .messages({
            'string.min': 'Raison Social doit être 2 charactères au minimum',
            'string.max': 'Raison Social doit être 250 charactères au maximum'
        }),
    n_registre_commerce: Joi
        .string()
        .min(2)
        .max(50)
        .messages({
            'string.min': 'Numéro de registre commerce doit être 2 charactères au minimum',
            'string.max': 'Numéro de registre commerce doit être 50 charactères au maximum'
        }),
    telephone: Joi
        .number()
        .integer()
        .min(1)
        .max(99999999999)
        .messages({
            'number.base': 'Téléphone peut contient seulement des chiffres'
        }),
    fax: Joi
        .number()
        .integer()
        .min(1)
        .max(99999999999)
        .messages({
            'number.base': 'Fax peut contient seulement des chiffres'
        }),
    adresse: Joi
        .string()
        .max(250)
        .messages({
            'string.max': 'Adresse peut contient seulement 250 charactères au maximum'
        }),
    n_compte_bancaire: Joi
        .number()
        .integer()
        .required()
        .min(1)
        .max(999999999999999999999999999999)
        .messages({
            'number.base': 'Numéro de compte bancaire contient juste des chiffres',
            'any.required': 'Numéro de compte bancaire est obligatoire'
        }),
    banque: Joi
        .string()
        .max(250)
        .messages({
            'string.max': 'La banque peut contient seulement 250 charactères au maximum'
        }),
    nom_agence_bancaire: Joi
        .string()
        .max(250)
        .messages({
            'string.max': `Nom d'agence bancaire peut contient seulement 250 charactères au maximum`
        }),
    has_mandataire: Joi
        .boolean(),
    mandataire: Joi
        .when('has_mandataire', {
            is: true,
            then: mandataireValidation
        })
        .error(new Error(`Ce propriétaire ne peut pas pris un mandataire`))

}).or('cin', 'passport', 'carte_sejour')
  .required()
  .error(new Error(`Vous devez remplire au moins Cin, Passeport, Carte séjour`))

module.exports = ProprietaireValidation;