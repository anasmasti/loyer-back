const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const affectationproprietaireSchema = new Schema(
  {
    deleted: {
      type: Boolean,
      default: false,
    },
    proprietaire: {
      type: Schema.Types.ObjectId,
      ref: "Proprietaire",
    },
    contrat: {
      type: Schema.Types.ObjectId,
      ref: "Contrat",
    },
    is_mandataire: {
      type: Boolean,
      default: false,
    },
    has_mandataire: {
      type: String,
      default: null,
    },
    montant_loyer: {
      type: Number,
    },
    part_proprietaire: {
      type: Number,
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
    montant_avance_proprietaire: {
      type: Number,
    },
    tax_avance_proprietaire: {
      type: Number,
    },
    tax_par_periodicite: {
      type: Number,
    },
    declaration_option: {
      type: String,
    },
    caution_par_proprietaire: {
      type: Number,
    },
    statut: {
      type: String,
      default: "Actif",
    },
    proprietaire_list: [
      {
        type: Schema.Types.ObjectId,
        ref: "AffectationProprietaire",
      },
    ],
  },
  { timestamps: true }
);

const AffectationProprietaire = mongoose.model(
  "AffectationProprietaire",
  affectationproprietaireSchema
);

module.exports = AffectationProprietaire;
