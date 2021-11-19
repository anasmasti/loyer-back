const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SchemaFournisseur = new Schema({
  nom: {
    type: String,
  },
  prenom: {
    type: String,
  },
  amenagements_effectuer: {
    type: String,
  },
  deleted: {
    type: Boolean,
    default: false,
  },
});

module.exports = SchemaFournisseur;
