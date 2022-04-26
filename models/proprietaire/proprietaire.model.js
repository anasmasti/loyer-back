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
    n_compte_bancaire: {
      type: String,
      unique: true,
      required: true,
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
    },
    


    // taux_impot: {
    //   type: Number,
    // },
    // retenue_source: {
    //   type: Number,
    // },
    // montant_apres_impot: {
    //   type: Number,
    // },
    // montant_loyer: {
    //   type: Number,
    // },
    // montant_avance_proprietaire: {
    //   type: Number,
    // },
    // tax_avance_proprietaire: {
    //   type: Number,
    // },
    // tax_par_periodicite: {
    //   type: Number,
    // },
    // declaration_option: {
    //   type: String,
    // },
    // caution_par_proprietaire: {
    //   type: Number,
    // },
    // is_mandataire: {
    //   type: Boolean,
    //   default: false,
    // },
    // part_proprietaire: {
    //   type: Number,
    // },
    // has_mandataire: {
    //   type: String,
    //   default: null,
    // },
    // statut: {
    //   type: String,
    //   default: "Actif",
    // },
    // proprietaire_list: [
    //   {
    //     type: Schema.Types.ObjectId,
    //     ref: "Proprietaire",
    //   },
    // ],
  },
  { timestamps: true }
);

ProprietaireSchema.plugin(uniqueValidator);
const Proprietaire = mongoose.model("Proprietaire", ProprietaireSchema);
module.exports = Proprietaire;
