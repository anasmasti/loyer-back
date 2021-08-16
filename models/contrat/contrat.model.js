const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const EtatContratSchema = require('./etatContrat.schema');
const fileSchema = require('../shared/file.schema');


//contrat Schema
const ContratSchema = new Schema({
    numero_contrat: {
        type: String
    },
    date_debut_loyer: {
        type: String,
    },
    date_fin_contrat: {
        type: String,
    },
    date_reprise_caution: {
        type: String,
    },
    date_fin_avance: {
        type: String,
    },
    date_premier_paiement: {
        type: String,
    },
    Montant_loyer: {
        type: Number,
    },
    taxe_edilite_loyer: {
        type: String,
    },
    taxe_edilite_non_loyer: {
        type: String,
    },
    periodicite_paiement: {
        type: String,
    },
    duree_location: {
        type: String,
    },
    declaration_option: {
        type: String,
    },
    taux_impot: {
        type: Number,
    },
    retenue_source: {
        type: String,
    },
    montant_apres_impot: {
        type: Number,
    },
    montant_caution: {
        type: String,
    },
    effort_caution: {
        type: String,
    },
    statut_caution: {
        type: String,
    },
    montant_avance: {
        type: Number,
    },
    duree_avance: {
        type: String,
    },
    N_engagement_depense: {
        type: String,
    },
    echeance_revision_loyer: {
        type: String,
    },
    type_lieu: {
        type: String,
    },
    lieu: {
        type: Schema.Types.ObjectId,
        ref: 'Lieu',
    },
    proprietaire: {
        type: Schema.Types.ObjectId,
        ref: 'Proprietaire',
    },
    etat_contrat_isUpdated: {
        type: Boolean,
        default: false
    },
    etat_contrat: [{
        libelle: {
            type: String
        },
        updated: {
            type: Boolean,
            default: false
        },
        etat: {
            type: EtatContratSchema
        }
    }],
    piece_joint: {
        type: [fileSchema],
    },
    deleted: {
        type: Boolean,
        default: false
    },
    validation1_DMG: {
        type: Boolean,
        default: false
    },
    validaotion2_DAJC: {
        type: Boolean,
        default: false
    },
    contrats_resilier: {
        type: Array
    },
    contrats_suspendu: {
        type: Array
    },
    contrat_avener: {
        type: Array
    }
});


const Contrat = mongoose.model('Contrat', ContratSchema)

module.exports = Contrat