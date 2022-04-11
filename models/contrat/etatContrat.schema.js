const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const fileSchema = require("../shared/file.schema");

//contrat Schema
const EtatContratSchema = new Schema(
  {
    intitule_lieu: {
      type: String,
    },
    reprise_caution: {
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
    date_resiliation: {
      type: Date,
    },
    etat_lieu_sortie: {
      type: String,
    },
    preavis: {
      type: Date,
    },
    date_suspension: {
      type: Date,
    },
    duree_suspension: {
      type: Number,
    },
    motif_suspension: {
      type: String,
    },
    n_avenant: {
      type: String,
    },
    // contrat_av: {
    //     type: String,
    // },
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
    images_etat_res_lieu_sortie: {
      type: [fileSchema],
    },
    lettre_res_piece_jointe: {
      type: [fileSchema],
    },
    piece_jointe_avenant: {
      type: [fileSchema],
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
module.exports = EtatContratSchema;
