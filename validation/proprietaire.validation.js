
const Joi = require('joi')

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
            'string.max': 'CIN doit être 8 charactères au maximum',

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
        .empty('')
        .min(4)
        .max(50)
        .messages({
            'string.min': 'Nom et Prénom doit être 4 charactères au minimum',
            'string.max': 'Nom et Prénom doit être 50 charactères au maximum'
        }),
    raison_social: Joi
        .string()
        .empty('')
        .min(2)
        .max(250)
        .messages({
            'string.min': 'Raison Social doit être 2 charactères au minimum',
            'string.max': 'Raison Social doit être 250 charactères au maximum'
        }),
    n_registre_commerce: Joi
        .string()
        .empty('')
        .min(2)
        .max(50)
        .messages({
            'string.min': 'Numéro de registre commerce doit être 2 charactères au minimum',
            'string.max': 'Numéro de registre commerce doit être 50 charactères au maximum'
        }),
    telephone: Joi
        .string()
        .empty('')
        .min(1)
        .max(10)
        .messages({
            'string.max': 'Téléphone doit être 10 chiffres au maximum'
        }),
    fax: Joi
        .string()
        .empty('')
        .min(1)
        .max(10)
        .messages({
            'string.max': 'Fax doit être 10 chiffres au maximum'
        }),
    adresse: Joi
        .string()
        .empty('')
        .max(250)
        .messages({
            'string.max': 'Adresse peut contient seulement 250 charactères au maximum'
        }),
    n_compte_bancaire: Joi
        .string()
        .empty()
        .required()
        .min(0)
        .max(24)
        .messages({
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
    // banque_rib: Joi
    //     .number()
    //     .empty()
    //     .integer()
    //     .required()
    //     .max(999)
    //     .messages({
    //         'number.base': 'Banque rib contient juste des chiffres',
    //         'any.required': 'Banque rib est obligatoire',
    //         'string.empty': 'Banque rib ne peut pas être vide',
    //         'string.max': 'Banque rib peut contient seulement 3 charactères au maximum',
    // }),
    // ville_rib: Joi
    //     .number()
    //     .empty()
    //     .required()
    //     .max(999)
    //     .messages({
    //         'any.required': 'Ville rib est obligatoire',
    //         'string.empty': 'Ville rib ne peut pas être vide',
    // }),
    // cle_rib: Joi
    //     .number()
    //     .empty()
    //     .integer()
    //     .required()
    //     .max(99)
    //     .messages({
    //         'number.base': 'Clé rib contient juste des chiffres',
    //         'any.required': 'Clé rib est obligatoire',
    //         'string.empty': 'Clé rib ne peut pas être vide',
    // }),
    taux_impot: Joi
        .number()
        .empty()
        .messages({
            'number.base': 'Taux de l\'impot contient juste des chiffres',
    }),
    retenue_source:  Joi
        .number()
        .empty(),
    montant_apres_impot: Joi
        .number()
        .empty()
        .messages({
            'number.base': 'Montant apres l\'impot contient juste des chiffres',
}),
    nom_agence_bancaire: Joi
        .string()
        .empty('')
        .max(250)
        .messages({
            'string.max': `Nom d'agence bancaire peut contient seulement 250 charactères au maximum`,
            'any.empty': `Le champs nom de l'agence bancaire ne peut pas être vide`
        }),
    montant_avance_proprietaire: Joi
        .number()
        .empty()
        .messages({
            'number.base': 'Montant avance proprietaire contient juste des chiffres',
}),
    tax_avance_proprietaire: Joi
        .number()
        .empty()
        .messages({
            'number.base': 'Tax avance proprietaire contient juste des chiffres',
}),
    tax_par_periodicite: Joi
        .number()
        .empty()
        .messages({
            'number.base': 'Tax par periodicite contient juste des chiffres',
}),
    pourcentage: Joi
        .number()
        .empty()
        .messages({
            'number.base': 'Pourcentage caution contient juste des chiffres',
}),
    caution_par_proprietaire: Joi
        .number()
        .empty()
        .messages({
            'number.base': 'Caution par proprietaire contient juste des chiffres',
}),
    email: Joi
        .string()
        .empty('')
        .messages({
            'any.empty': `Le champs email ne peut pas être vide`
        }),
    deleted: Joi
        .boolean()
        .default(false),
    montant_loyer: Joi
        .number()
        .empty(0)
        .integer()
        .min(0)
        .max(999999999999999999999999999999),
    is_mandataire: Joi
        .boolean(),
    proprietaire_list: Joi
        .array()
        .items(Joi.string()),
    old_proprietaires_list: Joi
    .array()
    .items(Joi.string()),
    has_mandataire: Joi
        .string(),
})



module.exports = ProprietaireValidation;