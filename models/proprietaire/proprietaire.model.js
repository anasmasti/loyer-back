const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uniqueValidator = require("mongoose-unique-validator");

//Protrietaire Schema
const ProprietaireSchema = new Schema(
  {
    deleted: {
      type: Boolean,
      default: false,
    },
    cin: {
      type: String,
    },
    passport: {
      type: String,
    },
    carte_sejour: {
      type: String,
    },
    nom_prenom: {
      type: String,
    },
    raison_social: {
      type: String,
    },
    n_registre_commerce: {
      type: String,
    },
    telephone: {
      type: String,
    },
    fax: {
      type: String,
    },
    adresse: {
      type: String,
    },
    n_compte_bancaire: {
      type: String,
    },
    banque: {
      type: String,
      required: true,
    },
    nom_agence_bancaire: {
      type: String,
    },
    type_proprietaire: {
      type: String,
    }
  },
  { timestamps: true }
);

// ProprietaireSchema.plugin(uniqueValidator);
const Proprietaire = mongoose.model("Proprietaire", ProprietaireSchema);
module.exports = Proprietaire;
