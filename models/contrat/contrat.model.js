const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const EtatContratSchema = require("./etatContrat.schema");
const AffectationProprietaire = require("../affectation_proprietaire/affectation_proprietaire.schema");
const fileSchema = require("../shared/file.schema");

//contrat Schema
const ContratSchema = new Schema(
  {
    numero_contrat: {
      type: String,
    },
    date_debut_loyer: {
      type: Date,
    },
    date_fin_contrat: {
      type: Date,
      default: new Date("2999-01-01"),
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
    montant_loyer: {
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
      type: Number,
    },
    montant_apres_impot: {
      type: Number,
    },
    montant_caution: {
      type: Number,
      default: 0,
    },
    duree_caution: {
      type: Number,
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
    n_engagement_depense: {
      type: String,
    },
    echeance_revision_loyer: {
      type: String,
    },
    // type_lieu: {
    //   type: String,
    // },
    foncier: {
      type: Schema.Types.ObjectId,
      ref: "Foncier",
    },
    etat_contrat: {
      libelle: {
        type: String,
      },
      etat: {
        type: EtatContratSchema,
      },
    },
    piece_joint_contrat: {
      type: [fileSchema],
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    validation1_DMG: {
      type: Boolean,
      default: false,
    },
    validation2_DAJC: {
      type: Boolean,
      default: false,
    },
    // etat_validation: {
    //   type: String,
    // },
    contrats_suspendu: {
      type: Array,
    },
    duree: {
      type: Number,
    },
    retenue_source_par_mois: {
      type: Number,
    },
    total_montant_brut_loyer: {
      type: Number,
    },
    total_montant_net_loyer: {
      type: Number,
    },
    caution_versee: {
      type: Boolean,
      default: false,
    },
    avance_versee: {
      type: Boolean,
      default: false,
    },
    montant_avance_tax: {
      type: Number,
    },
    date_comptabilisation: {
      type: Date,
    },
    is_avenant: {
      type: Boolean,
      default: false,
    },
    old_contrat: [
      {
        contrat: Schema.Types.ObjectId,
        date_affectation: {
          type: Date,
          default: new Date(),
        },
      },
    ],
    nombre_part: {
      type: Number,
    },
    has_avenant: {
      type: Boolean,
      default: false,
    },
    is_late: {
      type: Boolean,
      default: false,
    },

    // Proprietaires
    proprietaires: [
      {
        type: Schema.Types.ObjectId,
        ref: "AffectationProprietaire",
      },
    ],
  },
  { timestamps: true }
);

const Contrat = mongoose.model("Contrat", ContratSchema);

module.exports = Contrat;
