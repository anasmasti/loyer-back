const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uniqueValidator = require("mongoose-unique-validator");

//Protrietaire Schema
const ProprietaireSchema = new Schema(
  {
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
      unique: true,
      required: true,
    },
    // banque_rib: {
    //   type: Number,
    //   required: true,
    // },
    // ville_rib: {
    //   type: Number,
    //   required: true,
    // },
    // cle_rib: {
    //   type: Number,
    //   required: true,
    // },
    taux_impot: {
      type: Number,
    },
    retenue_source: {
      type: Number,
    },
    montant_apres_impot: {
      type: Number,
    },
    banque: {
      type: String,
      required: true,
    },
    montant_loyer: {
      type: Number,
    },
    nom_agence_bancaire: {
      type: String,
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
    // pourcentage: {
    //   type: Number,
    // },
    declaration_option:{
      type: String
    },
    is_person_physique:{
      type: Boolean,
      // default: true,
    },
    caution_par_proprietaire: {
      type: Number,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    is_mandataire: {
      type: Boolean,
      default: false,
    },
    part_proprietaire: {
      type: Number
    },
    // has_mandataire:{
    //   type: Schema.Types.ObjectId,
    //   ref: 'Proprietaire',
    // },
    has_mandataire: {
      type: String,
      default: null,
    },
    proprietaire_list: [
      {
          type: Schema.Types.ObjectId,
          ref: "Proprietaire",
      },
    ],
  },
  { timestamps: true }
);

ProprietaireSchema.plugin(uniqueValidator);
const Proprietaire = mongoose.model("Proprietaire", ProprietaireSchema);
module.exports = Proprietaire;
