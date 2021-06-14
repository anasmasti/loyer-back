
const Joi = require('joi')

const ProprietaireValidation = Joi.object({

    // Proprietaire validation
    cin: Joi
        .string()
        .empty('')
        .min(4)
        .max(8)
        .messages({
            'string.base': 'CIN Propriétaire doit être text et numéro',
            'string.min': 'CIN Propriétaire doit être 4 charactères au minimum',
            'string.max': 'CIN Propriétaire doit être 8 charactères au maximum',
            
        }),
    passport: Joi
        .string()
        .empty('')
        .min(4)
        .max(8)
        .messages({
            'string.base': 'passport Propriétaire doit être text et numéro',
            'string.min': 'passport Propriétaire doit être 4 charactères au minimum',
            'string.max': 'passport Propriétaire doit être 8 charactères au maximum' 
        }),
    carte_sejour: Joi
        .string()
        .empty('')
        .min(4)
        .max(8)
        .messages({
            'string.base': 'carte séjour Propriétaire doit être text et numéro',
            'string.min': 'carte séjour Propriétaire doit être 4 charactères au minimum',
            'string.max': 'carte séjour Propriétaire doit être 8 charactères au maximum'
            
        }),
    nom_prenom: Joi
        .string()
        .empty()
        .min(4)
        .max(50)
        .messages({
            'string.min': 'Nom et Prénom de Propriétaire doit être 4 charactères au minimum',
            'string.max': 'Nom et Prénom de Propriétaire doit être 50 charactères au maximum',
            'string.empty': 'Nom et Prénom ne peut pas etre vide'
           
        }),
    raison_social: Joi
        .string()
        .empty()
        .min(2)
        .max(250)
        .messages({
            'string.min': 'Raison Social Propriétaire doit être 2 charactères au minimum',
            'string.max': 'Raison Social Propriétaire doit être 250 charactères au maximum',
            'string.empty': 'Raison Social ne peut pas être vide'
        }),
    n_registre_commerce: Joi
        .string()
        .empty()
        .min(2)
        .max(50)
        .messages({
            'string.min': 'Numéro de registre commerce de Propriétaire doit être 2 charactères au minimum',
            'string.max': 'Numéro de registre commerce de Propriétaire doit être 50 charactères au maximum',
            'string.empty': 'Numéro de registre commerce ne peut pas être vide'
        }),
    telephone: Joi
        .number()
        .empty()
        .integer()
        .min(1)
        .max(99999999999)
        .messages({
            'number.base': 'Téléphone peut contient seulement des chiffres',
            'string.empty': 'Téléphone ne peut pas être vide'
        }),
    fax: Joi
        .number()
        .empty()
        .integer()
        .min(1)
        .max(99999999999)
        .messages({
            'number.base': 'Fax peut contient seulement des chiffres',
            'string.empty': 'Fax ne peut pas être vide'
        }),
    adresse: Joi
        .string()
        .empty()
        .max(250)
        .messages({
            'string.max': 'Adresse peut contient seulement 250 charactères au maximum',
            'string.empty': 'Adresse ne peut pas être vide'
        }),
    n_compte_bancaire: Joi
        .number()
        .empty()
        .integer()
        .required()
        .min(0)
        .max(999999999999999999999999999999)
        .messages({
            'number.base': 'Numéro de compte bancaire contient juste des chiffres',
            'any.required': 'Numéro de compte bancaire est obligatoire',
            'string.empty': 'Numéro de compte bancaire ne peut pas être vide'
        }),
    banque: Joi
        .string()
        .empty()
        .max(250)
        .messages({
            'string.max': 'La banque peut contient seulement 250 charactères au maximum',
            'string.empty': 'La banque ne peut pas être vide'
        }),
    nom_agence_bancaire: Joi
        .string()
        .empty()
        .max(250)
        .messages({
            'string.max': `Nom d'agence bancaire peut contient seulement 250 charactères au maximum`,
            'any.empty': `Le champs nom de l'agence bancaire de Propriétaire ne peut pas être vide`,
            'string.empty': `Nom de l'agence ne peut pas être vide`
        }),
    has_mandataire: Joi
        .boolean(),
    deleted: Joi
        .boolean()
        .default(false),
    mandataire: Joi 
        .array()
        .default(null)
        .when('has_mandataire',{
            is: true,
            then: Joi
                .required()
                .messages({
                    'any.required': 'Mandataire est Obligatoir'
                })
        })
})



module.exports = ProprietaireValidation;