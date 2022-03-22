const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const directeurRegional = require("./directeur.schema");

const lieuSchema = new Schema(
  {
    code_lieu: {
      type: String,
    },
    intitule_lieu: {
      type: String,
    },
    code_localite: {
      type: String,
    },
    telephone: {
      type: String,
    },
    fax: {
      type: String,
    },
    type_lieu: {
      type: String,
    },
    attached_DR: {
      type: Schema.Types.ObjectId,
      ref: "Lieu",
      default: null,
    },
    attached_SUP: {
      type: Schema.Types.ObjectId,
      ref: "Lieu",
      default: null,
    },
    // code_rattache_DR: {
    //   type: String,
    // },
    // code_rattache_SUP: {
    //   type: String,
    // },
    // intitule_rattache_SUP_PV: {
    //   type: String,
    // },
    centre_cout_siege: {
      type: String,
    },
    categorie_pointVente: {
      type: String,
    },
    etat_logement_fonction: {
      type: String,
    },
    directeur_regional: {
      type: [directeurRegional],
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Lieu = mongoose.model("Lieu", lieuSchema);

module.exports = Lieu;
