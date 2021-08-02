const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const EtatContratSchema = require('./etatContrat.schema');
const imageSchema = require('./image.schema')

//contrat Schema
const ContratSchema = new Schema({
    numero_contrat: {
        type: String,
    },
    date_debut_loyer: {
        type: Date,
    },
    date_fin_contrat: {
        type: Date,
    },
    date_reprise_caution: {
        type: Date,
    },
    date_fin_avance: {
        type: Date,
    },
    date_premier_paiement: {
        type: Date,
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
        type: Number,
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
        type: Number,
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
        type:Schema.Types.ObjectId,
        ref: 'Proprietaire',
    },
    etat_contrat: {
        libelle:{
            type:String
        },
        etat:{
            type: EtatContratSchema
        }
    },
    piece_joint_contrat:{
        type:[imageSchema],
    },
    deleted: {
        type: Boolean,
        default: false
    }

});


const Contrat = mongoose.model('Contrat', ContratSchema)

module.exports = Contrat