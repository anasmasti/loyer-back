const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const fileSchema = require("../shared/file.schema");

//contrat Schema
const EtatContratSchema = new Schema(
  {
    deleted: {
      type: Boolean,
      default: false,
    },

    // Résiliation
    date_resiliation: {
      type: Date,
    },
    intitule_lieu: {
      type: String,
    },
    reprise_caution: {
      type: String,
    },
    frais_reamenagement: {
      type: String,
    },
    etat_caution_consomme: {
      type: String,
    },
    duree_consomme: {
      type: Number,
    },
    duree_a_recupere: {
      type: Number,
    },
    etat_lieu_sortie: {
      type: String,
    },
    preavis: {
      type: Date,
    },

    // Suspension
    date_suspension: {
      type: Date,
    },
    duree_suspension: {
      type: Number,
    },
    motif_suspension: {
      type: String,
    },
    date_fin_suspension: {
      type: Date,
      default: new Date("2999-01-01"),
    },

    // Avenant
    n_avenant: {
      type: String,
    },
    motif: [
      {
        type_motif: {
          type: String,
        },
        montant_nouveau_loyer: {
          type: Number,
        },
      },
    ],
    date_effet_av: {
      type: Date,
    },
    deleted_proprietaires: [
      {
        type: Schema.Types.ObjectId,
      },
    ],
    signaletique_successeur: {
      type: String,
    },
    piece_jointe_avenant: {
      type: [fileSchema],
    },

    images_etat_res_lieu_sortie: {
      type: [fileSchema],
    },
    lettre_res_piece_jointe: {
      type: [fileSchema],
    },
    etat_contrat_rappel_montant_loyer_ea: {
      type: Number,
    },
    etat_contrat_rappel_montant_loyer_ma: {
      type: Number,
    },
    etat_contrat_rappel_montant_taxe_ea: {
      type: Number,
    },
    etat_contrat_rappel_montant_taxe_ma: {
      type: Number,
    },
  },
  { timestamps: true }
);
module.exports = EtatContratSchema;
